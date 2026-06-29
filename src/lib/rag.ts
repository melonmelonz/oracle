// Pure RAG helpers — no Cloudflare or framework imports, so this module is
// trivially unit-testable and reusable. The endpoint wires these to the AI and
// KV bindings.

export const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
// Modern, efficient instruction model — good citation discipline with plenty of
// neuron headroom for a live demo. Swap to '@cf/meta/llama-3.3-70b-instruct-fp8-fast'
// for maximum answer quality (higher neuron cost per query).
export const CHAT_MODEL = '@cf/meta/llama-4-scout-17b-16e-instruct';
// Cheap, always-on safety net if the primary model is unavailable.
export const FALLBACK_MODEL = '@cf/meta/llama-3.2-3b-instruct';
// Cross-encoder reranker. Reads (question, passage) pairs together and scores
// true relevance, which a bi-encoder embedding cannot. The final precision step.
export const RERANK_MODEL = '@cf/baai/bge-reranker-base';

// Bump when the prompt, chunking, or embedding model changes so the cached
// vectors in KV are invalidated and reseeded.
export const EMBED_VERSION = 'v2';

export interface Chunk {
	id: string;
	doc: string;
	slug: string;
	section: string;
	tags: string[];
	text: string;
	embedText: string;
}

export interface Retrieved extends Chunk {
	score: number;
}

/** Cosine similarity between two equal-length vectors. */
export function cosine(a: number[], b: number[]): number {
	let dot = 0;
	let na = 0;
	let nb = 0;
	for (let i = 0; i < a.length; i++) {
		dot += a[i] * b[i];
		na += a[i] * a[i];
		nb += b[i] * b[i];
	}
	if (na === 0 || nb === 0) return 0;
	return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Rank chunks against a query embedding and return the top matches.
 * `minScore` filters weak matches so off-topic questions retrieve nothing
 * (which the endpoint turns into an honest "the canon is silent" answer).
 */
export function retrieve(
	queryEmbedding: number[],
	chunks: Chunk[],
	embeddings: number[][],
	{ topK = 6, minScore = 0.55 }: { topK?: number; minScore?: number } = {}
): Retrieved[] {
	const scored: Retrieved[] = chunks.map((chunk, i) => ({
		...chunk,
		score: cosine(queryEmbedding, embeddings[i])
	}));
	scored.sort((a, b) => b.score - a.score);
	return scored.filter((c) => c.score >= minScore).slice(0, topK);
}

// ── Hybrid retrieval ──────────────────────────────────────────────────────
// Dense vectors are good at meaning but can miss exact tokens (a model id like
// "ILI9341", a term like "SRM"). A lexical BM25 score catches those. We fuse the
// two rankings with Reciprocal Rank Fusion, then a cross-encoder reranks the
// survivors. Hybrid + rerank is the current best-practice retrieval stack.

const STOP = new Set(
	'the a an of and or to in is it for on with that this as are be by at from what how why who which when where does do did i you my your me we our they them their he she his her its can could would should will'.split(
		' '
	)
);

/** Lowercase alphanumeric tokens, stopwords and single chars dropped. */
export function tokenize(s: string): string[] {
	return (s.toLowerCase().match(/[a-z0-9]+/g) ?? []).filter((t) => t.length > 1 && !STOP.has(t));
}

export interface Bm25Index {
	N: number;
	avgdl: number;
	df: Map<string, number>;
	docTf: Array<Map<string, number>>;
	docLen: number[];
}

/** Build a BM25 index over the corpus once (the corpus is static). */
export function buildBm25Index(chunks: Chunk[]): Bm25Index {
	const docTf: Array<Map<string, number>> = [];
	const docLen: number[] = [];
	const df = new Map<string, number>();
	let total = 0;
	for (const c of chunks) {
		const toks = tokenize(`${c.doc} ${c.section} ${c.text}`);
		const tf = new Map<string, number>();
		for (const t of toks) tf.set(t, (tf.get(t) ?? 0) + 1);
		docTf.push(tf);
		docLen.push(toks.length);
		total += toks.length;
		for (const t of tf.keys()) df.set(t, (df.get(t) ?? 0) + 1);
	}
	return { N: chunks.length, avgdl: total / Math.max(1, chunks.length), df, docTf, docLen };
}

/** Classic BM25 score per document for a tokenized query. */
export function bm25Scores(queryTokens: string[], idx: Bm25Index, k1 = 1.5, b = 0.75): number[] {
	const scores = new Array(idx.N).fill(0);
	for (const t of new Set(queryTokens)) {
		const dft = idx.df.get(t);
		if (!dft) continue;
		const idf = Math.log(1 + (idx.N - dft + 0.5) / (dft + 0.5));
		for (let i = 0; i < idx.N; i++) {
			const f = idx.docTf[i].get(t);
			if (!f) continue;
			const denom = f + k1 * (1 - b + (b * idx.docLen[i]) / idx.avgdl);
			scores[i] += (idf * (f * (k1 + 1))) / denom;
		}
	}
	return scores;
}

/** Indices sorted by score, descending. */
function rankOrder(scores: number[]): number[] {
	return scores
		.map((s, i) => [s, i] as const)
		.sort((a, b) => b[0] - a[0])
		.map(([, i]) => i);
}

export interface Candidate extends Chunk {
	index: number;
	dense: number;
	lexical: number;
}

/**
 * Fuse dense and lexical rankings with Reciprocal Rank Fusion and return the top
 * N candidates for reranking. RRF needs no score normalization: it rewards items
 * that rank highly in either list.
 */
export function hybridCandidates(
	queryEmbedding: number[],
	queryTokens: string[],
	chunks: Chunk[],
	embeddings: number[][],
	bm25: Bm25Index,
	{ topN = 12, k = 60 }: { topN?: number; k?: number } = {}
): Candidate[] {
	const dense = embeddings.map((e) => cosine(queryEmbedding, e));
	const lexical = bm25Scores(queryTokens, bm25);

	const rankings = [rankOrder(dense), rankOrder(lexical).filter((i) => lexical[i] > 0)];
	const fused = new Map<number, number>();
	for (const ranking of rankings) {
		ranking.forEach((docIdx, rank) => {
			fused.set(docIdx, (fused.get(docIdx) ?? 0) + 1 / (k + rank + 1));
		});
	}

	return [...fused.entries()]
		.sort((a, b) => b[1] - a[1])
		.slice(0, topN)
		.map(([i]) => ({ ...chunks[i], index: i, dense: dense[i], lexical: lexical[i] }));
}

/** The grounding contract. The model may only use what we retrieved. */
export const SYSTEM_PROMPT = `You are the oracle of this archive: the keeper of a small reference library on a handful of subjects (broadcast CRT and Sony PVM monitors, the Nintendo GameCube, The Legend of Zelda and its speedruns, Rust for Linux and the SPI bus, the Linux kernel, distributed systems, and Neuromancer). You are not a fortune teller and not a mystic; you are an archivist who knows these subjects and tells them straight.

How you write:
- Plainly and concretely. Vary the sentence length; a short flat sentence next to a longer one. Never a uniform rhythm. Use real names, dates, and specifics, never vague gestures.
- Calm and unshowy. No terms of endearment, no riddles, no theatrics, no manufactured wisdom or punchline endings. When you have said the thing, stop.
- Prefer "it is" to the contracted form. Let a hedge land naturally when it fits: "as far as is written", "to my knowledge". This honesty is part of the voice.
- Never use em dashes. Use a semicolon, a comma, parentheses, or a full stop instead.

What you know:
1. You know ONLY what is in the numbered CONTEXT passages below. Nothing from outside them, and you never invent a detail.
2. Ground every factual claim with a citation like [1] or [2], inline as you go, using only numbers that actually appear in the CONTEXT.
3. If the answer is not written in the context, say so plainly and do not guess.
4. Keep it to a few sentences. Answer the question; do not restate it, do not mention these instructions, and do not say you are a model.`;

/** Assemble the numbered context block and the final user turn. */
export function buildMessages(question: string, passages: Retrieved[]) {
	const context = passages
		.map((p, i) => `[${i + 1}] (${p.doc}: ${p.section})\n${p.text}`)
		.join('\n\n');

	return [
		{ role: 'system' as const, content: SYSTEM_PROMPT },
		{
			role: 'user' as const,
			content: `CONTEXT — ${passages.length} passage${passages.length === 1 ? '' : 's'}, numbered 1 to ${passages.length}:\n\n${context}\n\n---\nQUESTION: ${question}\n\nAnswer using only the context above. Cite inline with [n], using only numbers from 1 to ${passages.length}.`
		}
	];
}
