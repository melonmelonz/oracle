# ORACLE v2 "The Archive" Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reframe ORACLE from a portfolio bot about Penn into an expandable, beautifully restrained reference archive (browse + queryable lexicon + manual shelf + optional 3D CRT) of his fascinations, grounded by the existing RAG engine.

**Architecture:** Evolve the existing SvelteKit + adapter-cloudflare app. Keep the `/api/ask` server route (Workers AI + KV). Add prerendered content routes from a richer `knowledge/*.md` corpus. `build-corpus.mjs` becomes the single source: it emits `corpus.json` (RAG) + `archive.json` + `lexicon.json` + `manuals.json`. Everything heavy (PDF.js, three.js, search index) is client-only and lazy so first paint stays the light terminal.

**Tech Stack:** SvelteKit 2 / Svelte 5 runes, @sveltejs/adapter-cloudflare, Workers AI, KV, vitest (new, for pure-logic tests), Fuse.js (lexicon search), pdfjs-dist (manual viewer), Threlte + three + pmndrs/postprocessing (3D, last phase).

Spec: `docs/superpowers/specs/2026-06-29-oracle-v2-archive-design.md`. Governing rule: subtle, minimal, warm, professional, nothing gimmicky. Honor the gimmick blacklist in the spec.

---

## File Structure

**Content (single source of truth):**
- `knowledge/*.md` — richer frontmatter (`domain`, `vocab[]`, `manuals[]`, `related[]`, `source`). Purge personal docs; deepen subject docs; add monitors-pvm, gamecube, majoras-mask, spi-bus.
- `scripts/build-corpus.mjs` — emit four JSON artifacts.
- `src/lib/corpus.json` (RAG, existing) + `src/lib/archive.json` + `src/lib/lexicon.json` + `src/lib/manuals.json` (new).

**Engine:**
- `src/lib/rag.ts` — de-personalize `SYSTEM_PROMPT`; bump `EMBED_VERSION`.
- `src/routes/api/ask/+server.ts` — unchanged logic.

**UI / theme:**
- `src/app.css` — role-based tokens, cool accent, underscan frame, tuned scanline.
- `src/routes/+layout.svelte` — shared monitor shell + nav.
- `src/routes/+page.svelte` — Oracle (ask) home; updated copy/suggestions.
- `src/routes/archive/+page.svelte`, `src/routes/archive/[topic]/+page.{ts,svelte}` — browse (prerendered).
- `src/routes/lexicon/+page.{ts,svelte}`, `src/routes/lexicon/[term]/+page.{ts,svelte}` — lexicon (prerendered) + command-palette search.
- `src/routes/manuals/+page.{ts,svelte}` — manual shelf.
- `src/lib/components/CommandPalette.svelte`, `PdfViewer.svelte`, `Monitor3D.svelte` (lazy), `Sidenote.svelte`.

**Tests:**
- `tests/build-corpus.test.mjs`, `tests/lexicon.test.ts`, `tests/rag.test.ts`.

---

## Phase 0: Tooling + safety net

### Task 0.1: Add vitest

**Files:** Modify `package.json`; Create `vitest.config.js`.

- [ ] **Step 1: Install vitest**

```bash
cd ~/dev/oracle && npm i -D vitest
```

- [ ] **Step 2: Add test scripts to package.json**

Add to `"scripts"`:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 3: Create vitest.config.js**

```js
import { defineConfig } from 'vitest/config';

export default defineConfig({
	test: {
		include: ['tests/**/*.{test,spec}.{js,mjs,ts}'],
		environment: 'node'
	}
});
```

- [ ] **Step 4: Verify runner works**

Run: `npm test`
Expected: PASS with "No test files found" is acceptable, or exits 0. (vitest exits 1 on no files; create a trivial `tests/smoke.test.mjs` with `import {test,expect} from 'vitest'; test('smoke',()=>expect(1).toBe(1))` and confirm PASS, then keep it.)

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json vitest.config.js tests/smoke.test.mjs
git commit -m "chore: add vitest for pure-logic tests"
```

---

## Phase 1: Foundation (content + engine + corpus build + CSS evolution)

### Task 1.1: Define the richer corpus build (TDD)

**Files:** Modify `scripts/build-corpus.mjs`; Test `tests/build-corpus.test.mjs`.

The builder must: parse extended frontmatter (`domain`, `tags`, `vocab`, `manuals`, `related`, `source`), still emit `corpus.json` chunks (one per `##`), and additionally emit `archive.json`, `lexicon.json`, `manuals.json`.

- [ ] **Step 1: Write failing test for the four artifacts**

```js
// tests/build-corpus.test.mjs
import { test, expect } from 'vitest';
import { parseFrontmatter, chunkBody, buildArtifacts } from '../scripts/build-corpus.mjs';

const DOC = `---
title: Test Topic
domain: monitors
tags: [crt, trinitron]
vocab:
  - { term: Underscan, def: "image pulled inward leaving a black border" }
manuals:
  - { model: PVM-20M2U, title: Service Manual, year: 1995, url: "https://example/x", kind: service }
related: [gamecube]
source: "test provenance"
---
# Test Topic
Intro line.

## History
It began somewhere.
`;

test('parseFrontmatter reads extended fields', () => {
	const { meta } = parseFrontmatter(DOC);
	expect(meta.domain).toBe('monitors');
	expect(meta.vocab[0].term).toBe('Underscan');
	expect(meta.manuals[0].model).toBe('PVM-20M2U');
	expect(meta.related).toContain('gamecube');
});

test('buildArtifacts emits corpus, archive, lexicon, manuals', () => {
	const a = buildArtifacts([{ file: 'test-topic.md', raw: DOC }]);
	expect(a.corpus.length).toBeGreaterThanOrEqual(2); // Overview + History
	expect(a.archive[0]).toMatchObject({ slug: 'test-topic', domain: 'monitors', title: 'Test Topic' });
	expect(a.archive[0].sections.map((s) => s.section)).toContain('History');
	expect(a.lexicon.find((t) => t.term === 'Underscan')).toMatchObject({ domain: 'monitors', slug: 'test-topic' });
	expect(a.manuals.find((m) => m.model === 'PVM-20M2U')).toMatchObject({ kind: 'service', topic: 'test-topic' });
});
```

- [ ] **Step 2: Run it, verify failure**

Run: `npm test -- build-corpus`
Expected: FAIL (functions not exported / undefined).

- [ ] **Step 3: Refactor build-corpus.mjs into testable pure functions + a writer**

Rewrite so `parseFrontmatter` handles nested YAML-ish `vocab`/`manuals` (use a tiny dependency-free parser: support `- { key: val, ... }` inline objects and `- scalar` lists), `chunkBody` stays as-is, and add `buildArtifacts(files)` returning `{corpus, archive, lexicon, manuals}`. Keep a `build()` that reads `knowledge/`, calls `buildArtifacts`, and writes all four JSONs to `src/lib/`. Export the pure functions. Guard the `build()` call with `if (import.meta.url === pathToFileURL(process.argv[1]).href)`.

Frontmatter parser approach: parse the block line-by-line; for `key: [a, b]` -> array; for a key followed by indented `- ...` lines -> array of items; each `- { ... }` -> object via splitting on commas not inside quotes; `- scalar` -> string. Keep it small and covered by the test above.

`archive` entry shape: `{ slug, title, domain, tags, source, related, sections: [{section, text}], vocab, manuals }`.
`lexicon` entry shape: `{ term, def, domain, slug, topicTitle }` (one per vocab item, deduped by lowercased term, first-wins).
`manuals` entry shape: `{ ...manualFields, topic: slug, topicTitle, domain }`.

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- build-corpus`
Expected: PASS (both tests).

- [ ] **Step 5: Run the real build against current knowledge/ and confirm it still produces corpus.json**

Run: `npm run corpus`
Expected: logs corpus chunk count and writes `src/lib/{corpus,archive,lexicon,manuals}.json`. (Existing docs have no vocab/manuals yet, so lexicon/manuals may be near-empty; archive should list all current docs.)

- [ ] **Step 6: Commit**

```bash
git add scripts/build-corpus.mjs tests/build-corpus.test.mjs src/lib/*.json
git commit -m "feat: build-corpus emits archive, lexicon, and manuals artifacts"
```

### Task 1.2: De-personalize the RAG voice (TDD)

**Files:** Modify `src/lib/rag.ts`; Test `tests/rag.test.ts`.

- [ ] **Step 1: Write failing test**

```ts
// tests/rag.test.ts
import { test, expect } from 'vitest';
import { SYSTEM_PROMPT, EMBED_VERSION, buildMessages } from '../src/lib/rag';

test('system prompt is de-personalized (archivist of subjects, not Penn)', () => {
	expect(SYSTEM_PROMPT).not.toMatch(/Penn/i);
	expect(SYSTEM_PROMPT).not.toMatch(/portfolio|resume|the work\b/i);
	expect(SYSTEM_PROMPT).toMatch(/archive|archivist/i);
	// keep the hard voice rule
	expect(SYSTEM_PROMPT).toMatch(/em dash/i);
});

test('embed version bumped to invalidate KV cache', () => {
	expect(EMBED_VERSION).toBe('v2');
});

test('buildMessages still numbers and bounds citations', () => {
	const msgs = buildMessages('q?', [
		{ id: 'c0', doc: 'D', slug: 'd', section: 'S', tags: [], text: 'T', embedText: '', score: 1 }
	]);
	expect(msgs[1].content).toMatch(/\[1\]/);
	expect(msgs[1].content).toMatch(/1 to 1/);
});
```

- [ ] **Step 2: Run it, verify failure**

Run: `npm test -- rag`
Expected: FAIL (prompt still mentions Penn; EMBED_VERSION is 'v1').

- [ ] **Step 3: Rewrite SYSTEM_PROMPT and bump EMBED_VERSION**

Replace `SYSTEM_PROMPT` so it casts the Oracle as the keeper of an archive of subjects (CRT/PVM monitors, the GameCube, Majora's Mask speedruns, Rust-for-Linux and SPI, distributed systems, Neuromancer). Keep: grounded-only, cite `[n]` inline using only valid numbers, refuse plainly when the archive is silent, no model-talk, keep the plain varied-cadence prose and the **no em dashes** rule. Remove every reference to Penn / "the work" / portfolio. Set `EMBED_VERSION = 'v2'`.

- [ ] **Step 4: Run tests, verify pass**

Run: `npm test -- rag`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add src/lib/rag.ts tests/rag.test.ts
git commit -m "feat: de-personalize oracle voice and bump embed version to v2"
```

### Task 1.3: CSS evolution — role tokens, cool accent, underscan, tuned scanline

**Files:** Modify `src/app.css`, `src/routes/+layout.svelte`.

- [ ] **Step 1: Add role-based + cool-accent tokens to `:root`**

Keep existing aliases (legacy components depend on them). Add:
```css
/* role tokens */
--text: var(--paper);
--text-dim: #b8954e;
--text-faint: var(--amber-dim);
--accent-warm: var(--amber);
--accent-warm-bright: var(--amber-bright);
/* one cool accent: desaturated teal-slate calibration blue, sourced/grounded only */
--cool: #4e7e8c;
--cool-bright: #6fa6b5;
--cool-deep: #1e2d33;
--surface: #15110a;
--surface-raised: var(--bg-2);
/* type */
--sans: 'IBM Plex Sans', ui-sans-serif, system-ui, sans-serif;
```
Point `--text-dim` usage at the brighter `#b8954e` only for secondary UI; body stays `--paper`.

- [ ] **Step 2: Tune the scanline overlay down to material grain**

Find `body::after` (the scanline `repeating-linear-gradient`). Set the dark band to `rgba(0,0,0,0.12)` and keep `mix-blend-mode: multiply; pointer-events:none;` and the 3px pitch. Ensure no animation is attached (static). Confirm the existing `@media (prefers-reduced-motion: reduce)` block remains.

- [ ] **Step 3: Add the underscan frame to the monitor shell**

In `+layout.svelte`, wrap the page in a `.bezel` (deep black `#070604`) containing a `.screen` with `padding: clamp(12px,3vw,40px)` and `box-shadow: inset 0 0 0 1px var(--edge-soft), inset 0 0 120px rgba(0,0,0,0.5)`. The bezel fills the viewport; the screen holds `<slot/>`. Keep `pointer-events` normal. No fake buttons, LEDs, or badges (gimmick blacklist).

- [ ] **Step 4: Load IBM Plex Sans (lexicon prose only) + Mono**

In `src/app.html`, ensure IBM Plex Mono is loaded (it already is via the font stack/wherever). Add IBM Plex Sans the same way (self-host or the existing font source). If fonts are currently system-fallback only, add `@fontsource` packages: `npm i @fontsource/ibm-plex-mono @fontsource/ibm-plex-sans` and import both in `+layout.svelte`.

- [ ] **Step 5: Verify build + check + visual**

Run: `npm run check` (Expected: 0 errors) and `npm run build` (Expected: success).
Visual: `npm run dev`, confirm the underscan frame reads as a calibrated monitor, scanlines are subliminal, body text is `--paper`, nothing animates. Verify `prefers-reduced-motion` still neutralizes motion.

- [ ] **Step 6: Commit**

```bash
git add src/app.css src/routes/+layout.svelte src/app.html package.json package-lock.json
git commit -m "feat: calibrated-PVM theme - role tokens, cool accent, underscan frame, tuned scanline"
```

### Task 1.4: Author the content corpus (subagent workflow)

**Files:** Create/replace `knowledge/*.md`.

This is a content task executed via the research/authoring workflow (web-backed, fact-verified). Output: the new corpus with rich frontmatter.

- [ ] **Step 1: Purge personal docs**

```bash
cd ~/dev/oracle/knowledge && rm -f about-penn.md fluxcore.md els911.md goolz-hegemony.md pathfinder.md peek-and-mute.md playing-with-goolz.md pointcloud-server.md wanderlost.md minor-works.md kernel-quest.md
```

- [ ] **Step 2: Run the authoring workflow** (parallel agents, one per doc, web-researched + verified)

New + deepened docs, each with frontmatter (`domain`, `tags`, `vocab[]`, `manuals[]`, `related[]`, `source`) and `##` sections:
- `monitors-pvm.md` (domain monitors) — what PVM/BVM are, Trinitron/aperture grille, underscan, RGB/component/sync, why retro gamers prize them; vocab heavy; manuals[] = the verified IA URLs from the spec.
- `gamecube.md` (domain console) — Gekko/Flipper, miniDVD, digital AV out + component, homebrew, why it pairs with PVMs.
- `majoras-mask.md` (domain zelda) — design (3-day cycle, masks), and its speedrun scene.
- `spi-bus.md` (domain kernel) — SPI protocol + vocab (MOSI/MISO/SCLK/CS, CPOL/CPHA modes, DMA) and how it shows up in Rust-for-Linux drivers.
- Deepen existing: `rust-for-linux.md`, `linux-kernel.md`, `distributed-systems.md`, `neuromancer.md`, `zelda-speedruns.md` — add `vocab[]` and `related[]`, tighten prose, keep accurate.
- Rewrite `about-oracle.md` — the archive's self-description (no Penn).

- [ ] **Step 3: Verify + rebuild**

Run: `npm run corpus`
Expected: corpus/archive/lexicon/manuals JSONs populated; lexicon has dozens of terms; manuals lists the IA items. Spot-check that all manual URLs resolve (the workflow verifies this; re-check any flagged).

- [ ] **Step 4: Commit**

```bash
git add knowledge/ src/lib/*.json
git commit -m "content: purge personal docs; add monitors/gamecube/majoras/spi; deepen subjects with vocab"
```

### Task 1.5: Update the Oracle home copy

**Files:** Modify `src/routes/+page.svelte`.

- [ ] **Step 1: Replace SUGGESTIONS + tagline to reflect the archive (no Penn)**

New suggestions drawn from the subjects, e.g.: `what is a pvm?`, `what is stale reference manipulation?`, `what are spi modes?`, `why put rust in the linux kernel?`, `what did neuromancer invent?`, `how is majora's mask broken in a speedrun?`. Tagline: an archive of these subjects; answers only from what is written. Title tag updated. Citation `[n]` markers styled with `--cool` (in `Answer.svelte`).

- [ ] **Step 2: Verify**

Run: `npm run build` (Expected: success). Visual: suggestions work, citations render in the cool accent.

- [ ] **Step 3: Commit**

```bash
git add src/routes/+page.svelte src/lib/components/Answer.svelte
git commit -m "feat: archive-focused oracle home copy and cool-accent citations"
```

### Task 1.7: Signal path + grounded RAG demos ("make it special")

**Files:** Modify `src/routes/api/ask/+server.ts`, `src/lib/rag.ts`, `src/routes/+page.svelte`; Create `src/lib/components/SignalPath.svelte`.

The point: make the hybrid + rerank retrieval legible and show off faithful, grounded generation. All subtle, off by default, styled as a monitor calibration readout.

- [ ] **Step 1: Thread per-stage scores through the endpoint.** `hybridCandidates` already computes `dense` and `lexical` per candidate; capture the RRF rank and the cross-encoder rerank score too. Emit a streamed `trace` message: `{ type:'trace', query, tokens:[...bm25 terms...], gate: RERANK_MIN, candidates:[{doc,section,dense,lexical,rrf,rerank,passed}] }` for the full 14-candidate shortlist (not just the surviving 6). Keep the existing `sources`/`token`/`done` messages.
- [ ] **Step 2: SignalPath.svelte** — an "underscan" toggle (label: `underscan`) that reveals a calibration-style table: the tokenized query, then each candidate as a row with dense / lexical / RRF / rerank columns (dotted leaders, mono, cool-accent for the rerank winner column), a clear gate line, and which passed. No charts, no animation; reads like a service-menu readout. Collapsed by default.
- [ ] **Step 3: Grounded follow-ups.** After `done`, derive 2-3 follow-up questions from the cited docs' `related[]` + neighboring `sections` in `archive.json` (NOT model-invented). Render as the same `>` suggestion affordance. Include one cross-domain seed (e.g. relating two cited domains) when the answer cited >1 domain.
- [ ] **Step 4: Verify** — ask a question, toggle underscan, confirm the stage scores look right (dense/lexical/rrf/rerank present, winner in cool accent, gate honest), follow-ups are corpus-derived. `npm run build` passes.
- [ ] **Step 5: Commit**

```bash
git add src/routes/api/ask/+server.ts src/lib/rag.ts src/routes/+page.svelte src/lib/components/SignalPath.svelte
git commit -m "feat: underscan signal-path view and grounded follow-ups - demo the RAG machinery"
```

### Task 1.6: Deploy checkpoint (Phase 1 live)

- [ ] **Step 1: Build + deploy + reseed**

Run: `npm run deploy` (build + `wrangler pages deploy --branch main`). The `EMBED_VERSION` bump reseeds KV on first queries.
- [ ] **Step 2: Smoke test live** — ask 2-3 archive questions and an off-topic one (expect honest refusal). Confirm de-personalized voice.

---

## Phase 2: Browse + Lexicon

### Task 2.1: Prerendered archive browse

**Files:** Create `src/routes/archive/+page.{ts,svelte}`, `src/routes/archive/[topic]/+page.{ts,svelte}`.

- [ ] **Step 1:** `archive/+page.ts`: `export const prerender = true`; load `archive.json`, return topics grouped by `domain`.
- [ ] **Step 2:** `archive/+page.svelte`: domains as sections, topic cards (title + first-section excerpt), styled in tokens. Plain underlined links.
- [ ] **Step 3:** `archive/[topic]/+page.ts`: `export const prerender = true` + `entries()` returning every `{topic: slug}` from `archive.json`; load returns the matching archive entry (404 if none).
- [ ] **Step 4:** `archive/[topic]/+page.svelte`: render sections, a "defines" vocab list (links to `/lexicon/[term]`), a "manuals" list (links to `/manuals`), and an "ask the Oracle about this" link that prefills the home prompt (`/?q=...`). Sans for prose, mono for headers/labels.
- [ ] **Step 5:** Make the home `ask()` read `?q=` on mount and auto-run.
- [ ] **Step 6:** Verify `npm run build` prerenders every topic (check `.svelte-kit/cloudflare`). Commit.

### Task 2.2: Lexicon pages + index (TDD on the index helper)

**Files:** Create `src/lib/lexicon.ts` (pure helpers), `src/routes/lexicon/+page.{ts,svelte}`, `src/routes/lexicon/[term]/+page.{ts,svelte}`; Test `tests/lexicon.test.ts`.

- [ ] **Step 1: Failing test** for `slugifyTerm`, `buildSearchIndex`, `groupAlpha`:

```ts
import { test, expect } from 'vitest';
import { slugifyTerm, buildSearchIndex, groupAlpha } from '../src/lib/lexicon';

const TERMS = [
	{ term: 'MOSI', def: 'master out slave in', domain: 'kernel', slug: 'spi-bus' },
	{ term: 'Aperture Grille', def: 'vertical wires', domain: 'monitors', slug: 'monitors-pvm' }
];

test('slugifyTerm', () => {
	expect(slugifyTerm('Aperture Grille')).toBe('aperture-grille');
	expect(slugifyTerm('CPOL/CPHA')).toBe('cpol-cpha');
});
test('buildSearchIndex shape', () => {
	const idx = buildSearchIndex(TERMS);
	expect(idx[0]).toHaveProperty('slug');
	expect(idx[0]).toHaveProperty('term');
	expect(idx[0]).toHaveProperty('domain');
});
test('groupAlpha buckets by first letter', () => {
	const g = groupAlpha(TERMS);
	expect(g['A'][0].term).toBe('Aperture Grille');
	expect(g['M'][0].term).toBe('MOSI');
});
```

- [ ] **Step 2:** Run -> FAIL. **Step 3:** Implement `src/lib/lexicon.ts` (pure). **Step 4:** Run -> PASS.
- [ ] **Step 5:** `lexicon/+page.ts` (prerender) loads `lexicon.json`, builds A-Z groups + the search index (shipped inline as JSON for the small corpus). `lexicon/[term]/+page.ts` prerender + `entries()` over every slugified term; load returns `{term, def, domain, topic}`.
- [ ] **Step 6:** `lexicon/[term]/+page.svelte`: term, one-line def, domain chip, link to its topic, "Related" list, citation sidenote (Sidenote.svelte). `lexicon/+page.svelte`: pinned search box + facet chips + A-Z sections.
- [ ] **Step 7:** Verify build prerenders all terms. Commit.

### Task 2.3: Command palette search (Fuse.js, lazy)

**Files:** `npm i fuse.js`; Create `src/lib/components/CommandPalette.svelte`; wire into `+layout.svelte`.

- [ ] **Step 1:** Palette opens on `/` or Cmd/Ctrl-K (global keydown in layout, ignore when typing in the ask input). On first open, dynamic-import Fuse and the lexicon index (lazy). Fuzzy search over term+def+domain; arrow-key nav; Enter -> navigate to `/lexicon/[slug]`; matched-substring highlight; real zero-results state; facet filter chips. Looks like a search box (not disguised). Plain ranked text rows.
- [ ] **Step 2:** Verify: build, palette works, index loads only on first open (check network). Commit.

### Task 2.4: Sidenote component (CSS-only)

**Files:** Create `src/lib/components/Sidenote.svelte`.

- [ ] **Step 1:** Tufte CSS-only sidenote: right margin on wide viewports, inline toggle (`<label>`+hidden checkbox) on narrow; shown by default on desktop. No JS required. Commit after build passes.

### Task 2.5: Deploy checkpoint (Phase 2 live)

- [ ] `npm run deploy`; smoke test browse + lexicon + palette live.

---

## Phase 3: Manual shelf + PDF.js viewer

### Task 3.1: Manual shelf page

**Files:** Create `src/routes/manuals/+page.{ts,svelte}`.

- [ ] **Step 1:** `+page.ts` prerender loads `manuals.json`; group by topic/domain. `+page.svelte`: quiet citable source rows (model, title, year, kind, source host), plain underlined link to the archive.org `/details/` page; an "open in viewer" affordance only when a raw PDF URL is known + CORS-safe. No loud CTAs, no fake bezel. Commit after build.

### Task 3.2: Manual viewer — DECISION: Archive.org embed, not custom PDF.js

**Built instead of the custom pdfjs viewer.** Reason: archive.org serves manuals under
varied filenames with uncertain CORS, so a custom pdfjs viewer pointed at raw PDFs would
be flaky per-item. The research named `archive.org/embed/<identifier>` as the officially
supported, reliable embed path. The shelf opens each manual in a minimally-framed inline
panel via that embed (no rehosting, no filename/CORS guessing), with a direct link to the
source item. pdfjs-dist was not installed, keeping the bundle lean. The original pdfjs
viewer remains a possible future refinement if a CORS-clean PDF source is curated.

### Task 3.2 (original): Lazy PDF.js viewer (superseded by the embed approach above)

**Files:** `npm i pdfjs-dist`; Create `src/lib/components/PdfViewer.svelte`.

- [ ] **Step 1:** Component is dynamic-imported only when a manual is opened. `import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'; pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl`. All calls guarded behind `onMount`/`browser`. IntersectionObserver page windowing (current +/-1), width-fit DPR-aware scale, canvas + optional text layer, single discreet +/-/fit control styled in tokens. No Acrobat chrome, no CRT post-fx over the document.
- [ ] **Step 2:** Ensure pdfjs-dist is NOT in the server bundle (client-only import; route `ssr=false` or component-level dynamic import). Verify with a bundle check.
- [ ] **Step 3:** CSP: add `worker-src 'self' blob:` (and `connect-src`/`img-src` for archive.org if fetching remote PDFs) via response headers / `app.html` meta as appropriate for Pages. Verify a manual renders. Commit.

### Task 3.3: Deploy checkpoint (Phase 3 live)

- [ ] `npm run deploy`; confirm a manual opens and the worker bundle is unaffected.

---

## Phase 4: 3D CRT showpiece — DEFERRED (judgment gate, awaiting green-light)

**Decision (2026-06-29):** deferred, not built in this pass. The spec's own judgment gate
plus the research flagged the 3D CRT as the single surface most at risk of reading
"gimmicky", which directly conflicts with the governing directive (subtle, minimal,
professional, nothing gimmicky). The CSS evolution (underscan frame, tuned scanline, warm
palette) already delivers the broadcast-monitor read at ~1% of the weight, and the
"underscan" signal-path view is the genuine special centerpiece. WebGL output also cannot
be visually verified in this build environment. The Threlte scene below is fully specced
and ready to build on an explicit green-light. Everything else ships live now.

## Phase 4 (spec): 3D CRT showpiece (cut-able)

### Task 4.1: Lazy Threlte scene

**Files:** `npm i three @threlte/core @threlte/extras postprocessing`; Modify `vite.config.js` (`ssr: { noExternal: ['three'] }`); Create `src/lib/components/Monitor3D.svelte` + `CrtScene.svelte`.

- [ ] **Step 1:** `Monitor3D.svelte` renders the existing terminal by default; on mount, if WebGL present and not reduced-motion, `{#await import('./CrtScene.svelte')}` lazy-loads the scene. Procedural geometry (RoundedBoxGeometry chassis + 64x48 bulged PlaneGeometry screen). Terminal drawn to a CanvasTexture (NOT `<Html>`). EffectComposer (HalfFloat): RenderPass -> custom CRT Effect (barrel denom 8-16, scanline into [0.1,1.0], sub-0.5px aberration, vignette) -> BloomEffect(intensity 0.4, threshold 0.85) own pass -> ToneMapping.
- [ ] **Step 2:** Fallbacks: WebGL absent -> CSS-CRT; reduced-motion -> single static frame, no rAF, no power-on. Cap DPR 2, pause offscreen (IntersectionObserver) + on `visibilitychange`, dispose on teardown.
- [ ] **Step 3:** Verify three.js is in its own lazy chunk and NOT in `_worker.js` (rollup-plugin-visualizer or inspect output). Build size sane.
- [ ] **Step 4: JUDGMENT GATE** — view it. If it reads as spectacle/gimmick against the governing rule, cut it (revert this phase) and ship the CSS-CRT as canonical. Record the decision. Commit (or revert).

### Task 4.2: Final deploy + push

- [ ] **Step 1:** `npm run check` (0 errors), `npm test` (all pass), `npm run build` (success).
- [ ] **Step 2:** `git push origin main` (his repo, ASCII commit messages only).
- [ ] **Step 3:** `npm run deploy` (`wrangler pages deploy --branch main`).
- [ ] **Step 4:** Live smoke test: ask/browse/lexicon/manuals (+3D if kept). Confirm de-personalized, grounded, restrained.

---

## Self-Review notes

- Spec coverage: §6.1 Oracle -> T1.2,1.5; §3-5 aesthetic/color/type -> T1.3; §6.2 browse -> T2.1; §6.3 lexicon -> T2.2,2.3,2.4; §6.4 manuals -> T3.1,3.2; §6.5 3D -> T4.1; §7 expandability -> T1.1; §8 content -> T1.4; §9 platform (keep adapter-cloudflare, prerender content routes) -> T2.1,2.2,3.1; deploy/push -> T1.6,2.5,3.3,4.2.
- Adapter decision (spec §11): KEEP `@sveltejs/adapter-cloudflare`; the `/api/ask` route stays server-side; content routes use `export const prerender = true`. Confirmed compatible.
- Gimmick blacklist enforced in T1.3 (no bezel chrome), T3.1/3.2 (no faux-Acrobat, no CRT over docs), T4.1 (no fisheye/flicker, CanvasTexture not Html).
