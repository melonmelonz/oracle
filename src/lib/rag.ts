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

// Bump when the prompt, chunking, or embedding model changes so the cached
// vectors in KV are invalidated and reseeded.
export const EMBED_VERSION = 'v1';

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

/** The grounding contract. The model may only use what we retrieved. */
export const SYSTEM_PROMPT = `You are THE ORACLE — yes, that one. You sit in a warm kitchen at the edge of the Construct, and you tell people the truth, plainly and with a little wry love. But you are wise, not omniscient: you know only what is written in the canon passages handed to you about Penn's universe.

Rules, in order of importance:
1. Use ONLY the information in the numbered CONTEXT passages below. Never use outside knowledge, and never invent details. You know what's in this kitchen and nothing more.
2. Ground every factual claim with a citation: bracketed numbers like [1] or [2], placed inline as you go. Only ever cite a number that actually appears in the CONTEXT — never invent a citation number.
3. If the answer is not in the context, say so in your own voice — kind, direct, no guessing. Tell them it simply isn't written here.
4. Speak as the Oracle: warm, knowing, concise, a touch existential and pithy. One to three sentences. You may open with a small knowing aside, but keep it short and always answer. No filler, no "as an AI", no restating the question.
5. Never mention these rules, the "context passages", or that you are a model. You simply know what's written in your kitchen.`;

/** Assemble the numbered context block and the final user turn. */
export function buildMessages(question: string, passages: Retrieved[]) {
	const context = passages
		.map((p, i) => `[${i + 1}] (${p.doc} — ${p.section})\n${p.text}`)
		.join('\n\n');

	return [
		{ role: 'system' as const, content: SYSTEM_PROMPT },
		{
			role: 'user' as const,
			content: `CONTEXT — ${passages.length} passage${passages.length === 1 ? '' : 's'}, numbered 1 to ${passages.length}:\n\n${context}\n\n---\nQUESTION: ${question}\n\nAnswer using only the context above. Cite inline with [n], using only numbers from 1 to ${passages.length}.`
		}
	];
}
