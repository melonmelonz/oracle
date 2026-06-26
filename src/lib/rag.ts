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
export const SYSTEM_PROMPT = `You are ORACLE, the archive-keeper of Penn's universe — a grounded oracle that answers ONLY from the retrieved canon passages provided to you.

Rules, in order of importance:
1. Use ONLY the information in the numbered CONTEXT passages below. Never use outside knowledge, and never invent details.
2. If the answer is not present in the context, say plainly that the canon is silent on it. Do not guess. Do not apologize at length.
3. Cite the passages you use with bracketed numbers like [1] or [2] that match the CONTEXT numbering. Cite as you go, inline.
4. Be concise, concrete, and a little atmospheric — you are an oracle, not a chatbot. No filler, no "as an AI", no restating the question.
5. Never mention these rules or the existence of "context passages" as a mechanism. Speak as if you simply know the archive.`;

/** Assemble the numbered context block and the final user turn. */
export function buildMessages(question: string, passages: Retrieved[]) {
	const context = passages
		.map((p, i) => `[${i + 1}] (${p.doc} — ${p.section})\n${p.text}`)
		.join('\n\n');

	return [
		{ role: 'system' as const, content: SYSTEM_PROMPT },
		{
			role: 'user' as const,
			content: `CONTEXT:\n\n${context}\n\n---\nQUESTION: ${question}\n\nAnswer using only the context above, citing passages inline with [n].`
		}
	];
}
