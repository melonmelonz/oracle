# ORACLE

A **grounded oracle over Penn's universe** — ask a question, and it answers
*only* from the canon: a hand-authored knowledge base of Penn's projects. If the
archive doesn't contain the answer, it says so rather than inventing one.

The voice is Penn's own prose with a little of the Oracle's calm underneath:
plain, concrete, varied cadence, hedges that double as honesty, no theatrics. A
restrained, filmic still of The Oracle presides (a quiet, muted homage, regraded
from the film frame, not a raw screenshot). Editorial palette — ink, warm bone,
muted sage, a little aged gold.

Live: **https://oracle-4ld.pages.dev**

It's a small, honest RAG (retrieval-augmented generation) system: retrieve the
most relevant passages, hand them to a language model, and force the model to
speak only from what was retrieved — with every claim cited back to its source.

---

## What it demonstrates

- **Custom knowledge base** — markdown docs in [`knowledge/`](./knowledge), one
  per subject, chunked by section.
- **Retrieval** — semantic search over Cloudflare Workers AI embeddings, ranked
  by cosine similarity.
- **AI-generated answer** — streamed live with a typewriter effect.
- **Grounded answer** — the model is given only the retrieved passages and is
  instructed to refuse anything outside them ("the canon is silent on that").
- **Source display** — every answer shows the canon fragments it drew from, with
  a "resonance" score; inline `[n]` citations highlight the matching fragment on
  hover.
- **Deployed** — Cloudflare Pages + Workers AI, no external API keys.

## Architecture

```
knowledge/*.md  ──build──▶  src/lib/corpus.json   (chunked text + metadata)
                                   │
                          first request seeds:
                                   ▼
   query ──▶ /api/ask ──▶ embed query (bge) ─┐
                          embed corpus once ──┼─▶ cosine top-k (≥0.55)
                          cached in KV  ──────┘            │
                                                           ▼
                                      grounded prompt ─▶ Llama 4 Scout
                                                           │
                              NDJSON stream: {sources} → {token}… → {done}
                                                           ▼
                                              SvelteKit UI (the scrying chamber)
```

### Why brute-force cosine instead of Vectorize?

The corpus is a few dozen chunks. Brute-force cosine over them is instant, has
**zero indexing delay** (no waiting for a vector index to become queryable), and
can't fail on stage. The chunk embeddings are computed once via a single batched
Workers AI call and cached in KV; every query after that is pure arithmetic.

**Scale path:** past a few thousand chunks, swap the KV-cached array for
[Cloudflare Vectorize](https://developers.cloudflare.com/vectorize/) — create an
index with `--dimensions=768 --metric=cosine`, upsert the same embeddings, and
replace the `retrieve()` call with `env.VECTORIZE.query()`. The rest is unchanged.

### Grounding

`src/lib/rag.ts` holds the system prompt: use only the numbered CONTEXT
passages, cite with `[n]`, and say the canon is silent when the answer isn't
there. The retrieval threshold (0.55) is tuned to the bge-base similarity floor
so off-topic questions retrieve **nothing** — the endpoint then short-circuits to
an honest refusal without even calling the model.

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
| `src/lib/rag.ts` | Pure RAG helpers: cosine, retrieve, the grounding prompt. |
| `src/routes/api/ask/+server.ts` | The endpoint: seed embeddings → retrieve → ground → stream. |
| `src/routes/+page.svelte` | The UI — portrait, query, answer, sources. |
| `src/lib/components/` | `OracleScreen` (filmic portrait), `Answer` (citation linking), `SourceCard`. |
| `static/oracle.png` | Muted, regraded homage portrait (from the film frame, not a raw screenshot). |

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

Built with SvelteKit, Cloudflare Pages, and Workers AI
(`@cf/baai/bge-base-en-v1.5` for embeddings, `@cf/meta/llama-4-scout-17b-16e-instruct`
for generation).
