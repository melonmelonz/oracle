import type { RequestHandler } from './$types';
import corpus from '$lib/corpus.json';
import archive from '$lib/archive.json';
import {
	EMBED_MODEL,
	CHAT_MODEL,
	FALLBACK_MODEL,
	RERANK_MODEL,
	EMBED_VERSION,
	retrieve,
	buildMessages,
	tokenize,
	buildBm25Index,
	hybridCandidates,
	type Chunk,
	type Candidate,
	type Retrieved
} from '$lib/rag';

const CHUNKS = corpus as Chunk[];
const BM25 = buildBm25Index(CHUNKS);

// Topic relations, for grounded follow-up suggestions. Every follow-up points at
// a topic that exists in the corpus and is curated as related to a cited one, so
// nothing is invented.
interface TopicMeta {
	title: string;
	domain: string;
	related: string[];
}
const TOPIC = new Map<string, TopicMeta>(
	(archive as Array<{ slug: string; title: string; domain: string; related?: string[] }>).map((a) => [
		a.slug,
		{ title: a.title, domain: a.domain, related: a.related ?? [] }
	])
);

/** Follow-ups drawn from the cited topics' related[] and their domains. */
function followups(passages: Retrieved[]): string[] {
	const citedSlugs = [...new Set(passages.map((p) => p.slug))];
	const cited = citedSlugs.map((s) => TOPIC.get(s)).filter((t): t is TopicMeta => !!t);
	if (cited.length === 0) return [];

	const out: string[] = [];
	const domains = [...new Set(cited.map((c) => c.domain))];
	if (cited.length >= 2 && domains.length >= 2) {
		out.push(`what connects ${cited[0].title.toLowerCase()} and ${cited[1].title.toLowerCase()}?`);
	}
	const relatedSlugs = [...new Set(cited.flatMap((c) => c.related))].filter((s) => !citedSlugs.includes(s));
	for (const s of relatedSlugs) {
		const t = TOPIC.get(s);
		if (t) out.push(`what is ${t.title.toLowerCase()}?`);
		if (out.length >= 3) break;
	}
	return out.slice(0, 3);
}
const EMBED_KEY = `emb:${EMBED_VERSION}:${CHUNKS.length}`;
const EMBED_BATCH = 50;

// Retrieval pipeline knobs.
const CANDIDATES = 14; // hybrid shortlist sent to the reranker
const TOP_K = 6; // passages handed to the model
const RERANK_MIN = 0.2; // reranker relevance gate; below this -> "not written here"

const encoder = new TextEncoder();
const line = (obj: unknown) => encoder.encode(JSON.stringify(obj) + '\n');

/**
 * Return the embedding for every corpus chunk, in corpus order. Seeds the
 * vectors into KV on first call (one batched AI request per 50 chunks) and
 * reuses them on every subsequent call. This is the whole "index": brute-force
 * cosine over a few dozen vectors is instant and has no indexing delay.
 */
async function ensureEmbeddings(env: App.Platform['env']): Promise<number[][]> {
	const cached = await env!.ORACLE_KV.get(EMBED_KEY);
	if (cached) {
		try {
			const parsed = JSON.parse(cached) as number[][];
			if (parsed.length === CHUNKS.length) return parsed;
		} catch {
			// fall through and reseed
		}
	}

	const vectors: number[][] = [];
	for (let i = 0; i < CHUNKS.length; i += EMBED_BATCH) {
		const batch = CHUNKS.slice(i, i + EMBED_BATCH).map((c) => c.embedText);
		const res = (await env!.AI.run(EMBED_MODEL, { text: batch })) as { data: number[][] };
		vectors.push(...res.data);
	}

	// Best-effort cache; a failed write just means we reseed next time.
	await env!.ORACLE_KV.put(EMBED_KEY, JSON.stringify(vectors)).catch(() => {});
	return vectors;
}

interface RerankHit {
	index: number;
	score: number;
}

/**
 * Cross-encoder rerank of the hybrid shortlist. bge-reranker-base reads the
 * question and each passage together and scores genuine relevance, which the
 * bi-encoder embedding cannot. Returns candidate-array indices with scores,
 * sorted best first. Throws on an unexpected response so the caller can fall
 * back to dense retrieval.
 */
async function rerank(
	env: NonNullable<App.Platform['env']>,
	query: string,
	candidates: Candidate[]
): Promise<RerankHit[]> {
	const input = {
		query,
		top_k: candidates.length,
		contexts: candidates.map((c) => ({ text: c.text }))
	};
	const res = (await env.AI.run(RERANK_MODEL, input)) as { response?: Array<{ id: number; score: number }> };

	const out = (res.response ?? [])
		.filter((r) => typeof r?.id === 'number' && typeof r?.score === 'number')
		.map((r) => ({ index: r.id, score: r.score }));
	if (!out.length) throw new Error('reranker returned no scores');
	out.sort((a, b) => b.score - a.score);
	return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Emit `text` to the client one word at a time for the live "scrying"
 * typewriter effect. We stream our *own* validated text rather than the model's
 * SSE deltas because Workers AI streaming can drop pure-digit tokens — fatal for
 * a grounded oracle whose whole job is to repeat facts (and citation numbers)
 * exactly. A non-streamed model call returns the complete string intact.
 */
async function typeOut(text: string, send: (obj: unknown) => void) {
	const parts = text.match(/\S+\s*/g) ?? [text];
	for (const part of parts) {
		send({ type: 'token', text: part });
		await sleep(14);
	}
}

const SILENT =
	"That one is not written in the archive, as far as I can see, so I will not guess at it. Ask me about the PVM monitors, the GameCube, the Zelda runs, Rust for Linux and the SPI bus, the kernel, distributed systems, or Neuromancer, and I can tell you what is there.";

export const POST: RequestHandler = async ({ request, platform }) => {
	const env = platform?.env;
	if (!env?.AI || !env?.ORACLE_KV) {
		return new Response(
			JSON.stringify({ error: 'Bindings unavailable. Run with the Cloudflare platform (deploy, or `wrangler pages dev --remote`).' }),
			{ status: 503, headers: { 'content-type': 'application/json' } }
		);
	}

	let question = '';
	try {
		const body = (await request.json()) as { question?: string };
		question = (body.question ?? '').trim();
	} catch {
		return new Response(JSON.stringify({ error: 'Invalid JSON body.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}
	if (!question) {
		return new Response(JSON.stringify({ error: 'Ask a question.' }), {
			status: 400,
			headers: { 'content-type': 'application/json' }
		});
	}
	if (question.length > 500) question = question.slice(0, 500);

	const stream = new ReadableStream<Uint8Array>({
		async start(controller) {
			const send = (obj: unknown) => controller.enqueue(line(obj));
			try {
				const [embeddings, queryRes] = await Promise.all([
					ensureEmbeddings(env),
					env.AI.run(EMBED_MODEL, { text: question }) as Promise<{ data: number[][] }>
				]);

				// 1. Hybrid shortlist: dense vectors + BM25, fused with RRF.
				const candidates = hybridCandidates(
					queryRes.data[0],
					tokenize(question),
					CHUNKS,
					embeddings,
					BM25,
					{ topN: CANDIDATES }
				);

				// 2. Cross-encoder rerank for true relevance; fall back to dense-only
				//    cosine if the reranker is unavailable.
				let passages: Retrieved[];
				const rerankByCand = new Map<number, number>(); // candidate-array index -> rerank score
				let usedFallback = false;
				try {
					const hits = await rerank(env, question, candidates);
					for (const h of hits) rerankByCand.set(h.index, h.score);
					passages = hits
						.filter((h) => h.score >= RERANK_MIN)
						.slice(0, TOP_K)
						.map((h) => ({ ...candidates[h.index], score: h.score }));
				} catch {
					usedFallback = true;
					passages = retrieve(queryRes.data[0], CHUNKS, embeddings, { topK: TOP_K });
				}

				const sources = passages.map((p: Retrieved, i: number) => ({
					n: i + 1,
					doc: p.doc,
					slug: p.slug,
					section: p.section,
					score: Math.round(p.score * 1000) / 1000,
					text: p.text
				}));
				send({ type: 'sources', sources });

				// 3. The "underscan" signal: the full retrieval pipeline laid bare for
				//    the whole shortlist, not just the survivors. dense (cosine) and
				//    lexical (BM25) feed RRF (rank in the fused order), and the
				//    cross-encoder rerank score decides what crosses the honesty gate.
				const r3 = (x: number) => Math.round(x * 1000) / 1000;
				const passedIds = new Set(passages.map((p) => p.id));
				send({
					type: 'trace',
					query: question,
					tokens: tokenize(question),
					gate: RERANK_MIN,
					fallback: usedFallback,
					candidates: candidates.map((c, i) => ({
						doc: c.doc,
						slug: c.slug,
						section: c.section,
						dense: r3(c.dense),
						lexical: Math.round(c.lexical * 100) / 100,
						rrf: i + 1,
						rerank: rerankByCand.has(i) ? r3(rerankByCand.get(i)!) : null,
						passed: passedIds.has(c.id)
					}))
				});

				if (passages.length === 0) {
					await typeOut(SILENT, send);
					send({ type: 'done' });
					controller.close();
					return;
				}

				const messages = buildMessages(question, passages);
				const chatInput = { messages, temperature: 0.3, max_tokens: 640 };
				let result: { response?: string };
				try {
					result = (await env.AI.run(CHAT_MODEL, chatInput)) as { response?: string };
				} catch {
					result = (await env.AI.run(FALLBACK_MODEL, chatInput)) as { response?: string };
				}

				const answer = (result?.response ?? '').toString().trim();
				await typeOut(answer || SILENT, send);
				send({ type: 'done', followups: followups(passages) });
			} catch (err) {
				send({ type: 'error', message: err instanceof Error ? err.message : 'Oracle failure.' });
			} finally {
				controller.close();
			}
		}
	});

	return new Response(stream, {
		headers: {
			'content-type': 'application/x-ndjson; charset=utf-8',
			'cache-control': 'no-store',
			'x-accel-buffering': 'no'
		}
	});
};
