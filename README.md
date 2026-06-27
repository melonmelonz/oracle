# oracle

A **grounded oracle** over a hand-authored archive: some of Penn's own work, and
the subjects he cares about (Rust for Linux, the Linux kernel, distributed
systems, Zelda speedrunning, Neuromancer). Ask a question and it answers *only*
from the canon. If the archive doesn't contain the answer, it says so rather than
inventing one.

A minimal amber-phosphor terminal. The Oracle presides as ASCII art (a posterized
homage rendered entirely in text). The voice is Penn's own prose with a little of
the Oracle's calm underneath: plain, concrete, varied cadence, hedges that double
as honesty, no theatrics, no em dashes.

Live: **https://oracle-4ld.pages.dev**

It's a small, honest RAG (retrieval-augmented generation) system with a modern
retrieval stack: **hybrid search (dense vectors + BM25) fused with Reciprocal Rank
Fusion, then a cross-encoder reranker**. The model is handed only the survivors
and forced to speak only from them, with every claim cited back to its source.

---

## What it demonstrates

- **Custom knowledge base** — markdown docs in [`knowledge/`](./knowledge), one
  per subject, chunked by section.
- **Hybrid retrieval** — dense vector search (Workers AI embeddings) and a
  lexical BM25 score, fused with Reciprocal Rank Fusion. The lexical half catches
  exact tokens (`SRM`, `EEVDF`, `ILI9341`) that pure vectors miss.
- **Cross-encoder reranking** — a `bge-reranker-base` model reads the question and
  each shortlisted passage together and scores true relevance. This is also the
  honesty gate: off-topic questions score below threshold and retrieve nothing.
- **AI-generated answer** — streamed live with a typewriter effect.
- **Grounded answer** — the model is given only the reranked passages and is
  instructed to refuse anything outside them, in its own voice.
- **Source display** — every answer lists the passages it drew from with their
  reranker score; inline `[n]` citations highlight the matching passage on hover.
- **Deployed** — Cloudflare Pages + Workers AI, no external API keys.

## Architecture

```
knowledge/*.md  ──build──▶  src/lib/corpus.json   (chunked text + metadata)
                                   │
                          first request seeds embeddings -> KV
                                   ▼
   query ──▶ /api/ask ──▶ embed query (bge) ─┐
                          dense cosine  ──────┼─▶ RRF fuse ─▶ shortlist (14)
                          BM25 lexical  ──────┘                   │
                                                                  ▼
                                              cross-encoder rerank (bge-reranker)
                                                  top-k ≥ 0.20, else "not written"
                                                                  │
                                              grounded prompt ─▶ Llama 4 Scout
                                                                  │
                              NDJSON stream: {sources} → {token}… → {done}
                                                                  ▼
                                                  SvelteKit amber-TTY UI
```

### Why brute-force in the Worker instead of Vectorize?

The corpus is well under a hundred chunks. Dense cosine and BM25 over them run in
microseconds with **zero indexing delay** (no waiting for a vector index to become
queryable) and can't fail on stage. The chunk embeddings are computed once via a
single batched Workers AI call and cached in KV; every query after that is pure
arithmetic plus one reranker call.

**Scale path:** past a few thousand chunks, move the dense half to
[Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/) (create an
index with `--dimensions=768 --metric=cosine`, upsert the same embeddings) and
keep the BM25 + RRF + rerank stages as they are.

### Grounding and the honesty gate

`src/lib/rag.ts` holds the system prompt: use only the numbered CONTEXT passages,
cite with `[n]`, and say plainly when the answer is not written. The reranker is
the gate — relevant passages score near 1.0, off-topic noise scores below 0.2, so
an off-topic question retrieves nothing and the endpoint short-circuits to an
honest refusal without calling the chat model at all.

### A note on fidelity

Workers AI's *streaming* token deltas can drop pure-digit tokens — which would
silently corrupt facts and citation numbers in a grounded answer. So the model
is called **non-streaming** (full string returned intact) and the text is then
streamed to the browser word-by-word by the server. Same live effect, no data
loss.

## Project layout

| Path | Purpose |
|------|---------|
| `knowledge/*.md` | The canon. Add a file here to teach the oracle something new. |
| `scripts/build-corpus.mjs` | Chunks the canon into `src/lib/corpus.json` (pure Node, runs at build). |
| `src/lib/rag.ts` | Pure RAG helpers: cosine, BM25, RRF fusion, the grounding prompt. |
| `src/routes/api/ask/+server.ts` | The endpoint: hybrid shortlist → rerank → ground → stream. |
| `src/routes/+page.svelte` | The amber-TTY UI — ascii portrait, shell prompt, answer, refs. |
| `src/lib/components/` | `AsciiPortrait`, `Answer` (citation linking), `SourceCard`. |

## Develop

```bash
npm install
npm run dev          # UI works locally; AI calls need the edge (see below)
```

The Workers **AI binding only runs against Cloudflare's edge**, so live answers
require either a deploy or:

```bash
npm run build
wrangler pages dev --remote
```

## Deploy

```bash
npm run deploy       # build + wrangler pages deploy
```

Bindings (`AI`, `ORACLE_KV`) are declared in `wrangler.jsonc` and applied on
deploy. If you change the chunking, prompt, or embedding model, bump
`EMBED_VERSION` in `src/lib/rag.ts` so the cached vectors in KV are reseeded.

## Extending the canon

1. Drop a new `.md` file in `knowledge/` (frontmatter `title:` + `tags:`,
   then `##` sections).
2. `npm run deploy`.
3. Bump `EMBED_VERSION` if you want the new content embedded immediately;
   otherwise the cache reseeds automatically when the chunk count changes.

---

Built with SvelteKit, Cloudflare Pages, and Workers AI: `@cf/baai/bge-base-en-v1.5`
for embeddings, `@cf/baai/bge-reranker-base` for reranking, and
`@cf/meta/llama-4-scout-17b-16e-instruct` for generation.
