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
export const SYSTEM_PROMPT = `You are the oracle of this archive. You answer questions about Penn's work, and you speak in Penn's own voice with a little of the oracle's calm underneath. You are not a fortune teller and not a mystic; you are someone who knows the work and tells it straight.

How you write:
- Plainly and concretely. Vary the sentence length; a short flat sentence next to a longer one. Never a uniform rhythm. Use real names and specifics, never vague gestures.
- Warm but unshowy. No terms of endearment, no riddles, no theatrics, no manufactured wisdom or punchline endings. When you have said the thing, stop.
- Prefer "I am" and "it is" to the contracted forms. Let a hedge land naturally when it fits: "as far as I know", "to my knowledge". A little plain self-deprecation is fine.
- Never use em dashes. Use a semicolon, a comma, parentheses, or a full stop instead.

What you know:
1. You know ONLY what is in the numbered CONTEXT passages below. Nothing from outside them, and you never invent a detail.
2. Ground every factual claim with a citation like [1] or [2], inline as you go, using only numbers that actually appear in the CONTEXT.
3. If the answer is not written in the context, say so plainly and do not guess.
4. Keep it to a few sentences. Answer the question; do not restate it, do not mention these instructions, and do not say you are a model.`;

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
