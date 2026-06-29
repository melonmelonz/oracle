# ORACLE v2 — "The Archive" — Design Spec

Date: 2026-06-29
Status: approved (design); pending implementation plan
Repo: ~/dev/oracle (github.com/melonmelonz/oracle, branch main), live oracle-4ld.pages.dev

## 1. Intent

Reframe ORACLE from a portfolio bot *about Penn* into an expandable **reference
archive of fascinations** — broadcast CRT monitors, the GameCube, Majora's Mask
and its speedruns, Rust-for-Linux and the SPI bus, distributed systems, and
Neuromancer. Two ways in: **browse** it like a beautifully built broadcast-monitor
reference, or **ask** the Oracle (the existing grounded RAG engine).

Nothing personal survives — no portfolio, no resume, no "the work." Penn's *taste*
(the prose voice, the CRT obsession, the terminal aesthetic) stays as the
archivist's hand; his *biography* goes.

We are **evolving** the existing app, not rebuilding it. The current engine
(`rag.ts` hybrid + rerank + grounded generation) and the amber-phosphor terminal
in `app.css` are the foundation. `app.css` was specifically assessed as already
correct on CRT fundamentals — we extend it.

## 2. Governing rule

**Subtle, minimal, warm ("high temperature"), professional, nothing gimmicky.**
Every effect dialed to "you'd only notice it if it vanished." Restraint, undertone
consistency, and solid fills over fake glows are what separate a calibrated
broadcast monitor from a retro costume.

### Gimmick blacklist (hard constraints — never do)

- Geometric screen curvature / fishbowl warp in CSS (perspective, matrix3d,
  feDisplacementMap). In 3D, no low-denominator barrel (fisheye) — keep 8–16.
- Constant flicker / opacity jitter; animated rolling "sweep" scanline as default;
  loud CRT power-on flash / degauss rainbow.
- Heavy high-contrast scanlines (>~20% darkening, thick/wide pitch = venetian blinds).
- Chromatic aberration beyond a sub-pixel hint; RGB fringing.
- Skeuomorphic monitor chrome: fake plastic bezel, glossy reflections, power LEDs,
  tally lights, knobs, brand badges, vent lines, OSD borders.
- Global `blur()`/`contrast()` filter over content to fake bloom; thin neon outlines
  on everything.
- Pure saturated phosphor / neon body text (fails WCAG).
- Cold royal/electric blue accent; multiple competing status hues.
- PDF surface: cartoon CRT bezel around the doc, faux-Acrobat toolbars, page-curl,
  CRT post-fx over schematics, loud "DOWNLOAD" CTAs, rehosting PDFs.
- Lexicon: force-graph/backlink visualizations, typewriter reveals, badge-color soup,
  disguised search box, mandatory-interaction sidenotes on desktop.
- 3D: `<Html>`/CSS3DRenderer for screen text (use CanvasTexture); over-stacking
  textures — pick two or three quiet layers, never all at once.

## 3. Aesthetic — calibrated PVM

Keep the amber-phosphor terminal DNA. Evolve with the two highest-signal,
zero-motion moves first:

1. **Underscan black frame** — wrap the screen in a deep-black container with even
   `clamp(12px,3vw,40px)` padding + a 1px inner edge / faint inset box-shadow. This
   single detail reads "broadcast monitor" with no animation. Highest signal/effort.
2. **Tuned scanline** — keep the existing fixed `::after` overlay; trim to ~10–14%
   effective darkening, 3–4px pitch, `mix-blend-mode: multiply`, `pointer-events:none`,
   **static** (no flicker/sweep). Keep the radial vignette + soft top glow.

Skipped: aperture-grille tint (muddies a monochrome amber screen), barrel curvature,
chromatic aberration, breathing-brightness animation (default OFF).

## 4. Color — role-based, not "amber everywhere"

Define CSS custom properties as **roles**, not swatch names, so a re-skin is a
one-layer change. All dark surfaces: HSL saturation ≤15%, lightness ≤15%, hue in the
warm 30–45° band.

| Token | Value | Role |
|---|---|---|
| `--bg` | `#0C0B08` | base |
| `--bg-2` | `#110F0A` | raised |
| `--surface` | `#15110A` | chamber/cards |
| `--paper` | `#ECD9B4` | body / sustained reading (clears WCAG AA) |
| `--text-dim` | `#B8954E` | secondary UI |
| `--accent-warm-bright` | `#F6CD84`→`#FFBF00` | RESERVED: prompt glyph, focus, headings, key numerals |
| `--accent-cool` | `#4E7E8C` | citation / source / "grounded" markers (one job) |
| `--cool-bright` | `#6FA6B5` | cool hover/active |
| `--cool-deep` | `#1E2D33` | cool fill bg |

- **60-30-10 distribution:** ~60–70% warm-charcoal surfaces, ~30% paper/dim-amber,
  ≤10% combined bright-amber + cool accent.
- The cool accent is a desaturated **teal-slate "calibration blue"** — the authentic
  PVM warm/cool tension. It does exactly one semantic job: marking sourced/grounded
  content (citations, source links). This doubles as a visual signal of the Oracle's
  honesty thesis. Never a cold royal/electric blue.
- Phosphor glow: tight `text-shadow: 0 0 1px currentColor` on amber accents only;
  reserve the soft ~24px ambient `--glow` for the hero/ASCII portrait. Solid fills
  over outlines.

## 5. Type

- **IBM Plex Mono** stays the identity: terminal, prompt, code, IDs, citation
  metadata, timestamps, ASCII portrait.
- **IBM Plex Sans** (same superfamily, shared metrics) introduced only where
  sustained reading dominates — the `/lexicon` reference prose. Everywhere else stays
  mono at line-height ≥1.6.
- Scale (16px root, ~1.2 ratio): `0.75 / 0.875 / 1 / 1.2 / 1.5 / 1.875rem`,
  line-heights snapped to 8px multiples; body mono 1.6, sans 1.5, headings 1.2.
- 4/8px spacing rhythm. Answer/prose measure ~62ch (current 720px maxw is close).

## 6. Five surfaces, one corpus

### 6.1 Oracle (ask)
Engine untouched mechanically — keep hybrid + RRF + cross-encoder rerank, the
`RERANK_MIN` honesty gate, and the **non-streaming model call + server-side
word-streaming** fix (Workers AI streaming drops pure-digit tokens). Changes:
- Corpus swapped to the archive.
- `SYSTEM_PROMPT` de-personalized: an archivist of the *subjects*, never "Penn" or
  "the work." Keep the plain, varied-cadence, no-em-dash voice as house style.
- Citation markers render in `--accent-cool`.
- Bump `EMBED_VERSION` → `v2` to invalidate + reseed the KV vector cache.

### 6.2 Archive (browse)
Prerendered topic pages rendered from `knowledge/*.md`. Fully static
(adapter-static), works with zero JS. Each page shows its sections, the vocab it
defines, the manuals it cites, and an "ask the Oracle about this" hook.

### 6.3 Lexicon (vocab) — queryable
- `/lexicon` index (A–Z, prerendered from frontmatter) + `/lexicon/[term]` pages,
  `export const prerender = true` + `entries()` returning every slug.
- **Build-time JSON search index** shipped as a static asset, loaded lazily on first
  search focus. **Fuse.js** for the command-palette term search (`/` or Cmd/Ctrl-K) —
  primary navigation. (FlexSearch/MiniSearch only if full body-text scale needed later.)
- Domain facet chips (monitors / console / zelda / kernel / distsys / fiction),
  real zero-results state, results labeled by type when mixing terms vs topics.
- Cross-links authored inline as `[[term]]`, resolved at build to anchors + a small
  auto-generated "Related" list. Links = plain underlined text.
- Citations as **Tufte CSS-only sidenotes** (right margin on wide, inline-toggle on
  narrow, shown by default on desktop).
- Vocab seed: Rust/SPI (MOSI, MISO, SCLK, CS/SS, CPOL/CPHA, DMA, `pin_init`, kernel
  `Result`, `impl Trait`…), Zelda speedrun tech (SRM, ISG, wrong warp, bottle
  adventure, 0th-day…), PVM (underscan, aperture grille, dot pitch, RGBHV,
  sync-on-green, line doubler…).

### 6.4 Manual shelf
Manuals as quiet **citable source documents**. Lean PDF.js viewer (`pdfjs-dist`),
**dynamically imported only on open, client-only, never in the `_worker.js` bundle**.
Worker wired via `import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'`;
all calls guarded behind `onMount`/`browser`. IntersectionObserver page windowing
(current ±1), width-fit DPR-aware scale, single discreet +/−/fit control, styled in
the existing terminal tokens. CSP: `worker-src 'self' blob:`, worker served
same-origin.

**Never rehost.** Default to a link to the archive.org `/details/` page; feed our own
viewer the raw `/download/<id>/<file>.pdf` only when CORS permits; `/embed/` iframe
only if inline preview is wanted. No faux-Acrobat chrome, no CRT post-fx over
schematics.

Verified Internet Archive seed (live, free, legal):
- Master collection: https://archive.org/details/SonyMonitorDocumentation
- PVM-20M2U/20M4U service: https://archive.org/details/SonyPVM20M220M4ServiceManual
- PVM-14L2/20L2 service: https://archive.org/details/trinitron_pvm14l2
- PVM-20L2/14L2/9L2/9L3 user + service menu: https://archive.org/details/sony-pvm-20-l-2-14-l-2-9-l-2-9-l-3-user-guide-manual-with-service-menu
- PVM-20M7MDE service: https://archive.org/details/sony-pvm-20-m-7-mde-service-manual
- PVM-8042Q/8045Q/9042Q/9045Q op+service: https://archive.org/details/SonyPVM8042Q8045Q9042Q9045QOperationAndServiceManual
- BVM-14E/14F/20E/20F op+maintenance: https://archive.org/details/SonyBVM14EBVM14FBVM20EBVM20F20F1U14F5UOperationAndMaintenanceManual
- BVM-2010/1910 series: https://archive.org/details/SonyBVM20102010P2010PD2010PM2010PMD1910OperationAndMaintenanceServiceManual
- BVM-1916 op+maintenance: https://archive.org/details/SonyBVM1916OperationAndMaintenanceManual
- BVM-2000AP service: https://archive.org/details/sony-bvm-2000-ap-service-manual

### 6.5 3D CRT (showpiece) — built last, cut-able
A *lazy, hero-only, static-by-default* Threlte (`@threlte/core` + `@threlte/extras`)
+ three + `pmndrs/postprocessing` scene:
- Procedural geometry (RoundedBoxGeometry chassis + lightly-bulged 64×48 PlaneGeometry
  screen), **not** a GLB. Matte dark chassis that recedes.
- Live terminal drawn to a **CanvasTexture** (NOT `<Html>`/CSS3DRenderer).
- EffectComposer on HalfFloat buffer: RenderPass → custom CRT Effect (barrel
  denominators 8–16, scanline mapped into [0.1,1.0], sub-0.5px aberration, vignette) →
  BloomEffect (intensity ~0.4, luminanceThreshold ~0.85) in its own EffectPass →
  ToneMappingEffect.
- `ssr.noExternal: ['three']` in vite config; verify three.js is NOT in `_worker.js`.
  Dynamic `import()` gated on mount/visibility. Target ~150–220KB gz chunk.
- WebGL absent → CSS-CRT fallback. `prefers-reduced-motion` → one static
  `composer.render()` frame, no rAF loop, no power-on. Cap DPR at 2, pause offscreen,
  dispose on teardown.

Research flags this as the surface most at risk of tipping gimmicky. The CSS
evolution already delivers ~80% of the premium read at ~1% of the weight, so the 3D
is **judged in context and cut without regret** if it reads as spectacle.

## 7. Expandability contract

One markdown file per topic. `build-corpus.mjs` extended to emit four artifacts from
`knowledge/*.md`: `corpus.json` (RAG chunks, as today) + `archive.json` (topics,
sections, domains) + `lexicon.json` (all vocab terms w/ domain + source doc) +
`manuals.json`. Drop a file, rebuild → it appears in browse, lexicon, manual shelf,
and the Oracle automatically.

Frontmatter schema:
```yaml
---
title: Sony PVM / Broadcast Monitors
domain: monitors          # monitors | console | zelda | kernel | distsys | fiction
tags: [crt, trinitron]
vocab:
  - { term: Aperture Grille, def: "one-line definition" }
  - { term: Underscan, def: "..." }
manuals:
  - { model: PVM-20M2U, title: Service Manual, year: 1995, url: "...", kind: service }
related: [gamecube, majoras-mask]
source: "provenance / citation note"
---
# body with ## sections (chunked for RAG, as today)
```

## 8. Content plan

- **Purge:** about-penn, fluxcore, els911, goolz-hegemony, pathfinder, peek-and-mute,
  playing-with-goolz, pointcloud-server, wanderlost, minor-works, kernel-quest.
- **Rewrite:** about-oracle (no longer "answers about Penn's work").
- **Keep + deepen:** rust-for-linux, linux-kernel, distributed-systems, neuromancer,
  zelda-speedruns.
- **Add:** monitors-pvm, gamecube, majoras-mask, spi-bus (vocab-heavy).
- Authored + fact-verified by a subagent workflow (web-backed: accurate SPI/speedrun
  vocab, manual URLs that resolve, adversarial verification pass).

## 9. Platform / routing

adapter-static, fully prerendered, Cloudflare Pages. No-JS static HTML is the
guaranteed baseline; 3D, PDF, and search index are code-split, lazy enhancements so
first paint is the lightweight amber terminal. three.js and pdfjs must never enter
the SvelteKit server `_worker.js`.

> NOTE: the current app uses `@sveltejs/adapter-cloudflare` with a server `/api/ask`
> route (the RAG endpoint needs Workers AI + KV bindings at runtime). The "static
> baseline" applies to browse/lexicon/manuals; the Oracle ask endpoint remains a
> server route. The implementation plan must resolve adapter strategy: either keep
> adapter-cloudflare and `prerender = true` the content routes, or split static
> content from the dynamic endpoint. **Decided in the plan, not here.**

Deploy ritual unchanged: `npm run deploy` (build + `wrangler pages deploy --branch
main`). Bump `EMBED_VERSION` when chunking/prompt/embedding changes.

## 10. Build order (each phase shippable)

1. **Foundation** — content purge/add + engine prompt de-personalization + corpus
   build outputs + CSS evolution (underscan, tuned scanline, role-based palette, cool
   accent). `EMBED_VERSION → v2`, reseed KV.
2. **Browse + Lexicon** — prerendered pages, build-time search index, command palette.
3. **Manual shelf + PDF.js viewer.**
4. **3D CRT showpiece** — judged in context; cut-able.

## 11. Open decisions deferred to the plan

- Adapter strategy (static content vs dynamic ask endpoint) — see §9 note.
- Whether the 3D showpiece ships in v2 at all (default: build last, decide on sight).

## 12. Research provenance

Design grounded in a 5-agent research workflow (2026-06-29) covering tasteful CRT/PVM
CSS, the 3D Trinitron stack, PDF.js + manual sourcing, reference/glossary UX, and
warm-minimal palette/type. Key sources:

- CRT CSS restraint: aleclownes.com/2017/02/01/crt-display.html; afterglow-crt;
  webaim.org/articles/contrast/
- 3D: threlte.xyz; pmndrs/postprocessing Custom-Effects wiki; svelte.dev/docs/kit/adapter-cloudflare
- PDF: npmjs.com/package/pdfjs-dist; mozilla/pdf.js discussion #17622; archive.org embed pattern
- Reference UX: edwardtufte.github.io/tufte-css/; gwern.net/sidenote; fusejs.io;
  mli.puffinsystems.com/blog/sveltekit-blog-docs-with-mdsvex
- Warm-minimal: colorhero.io dark palettes 2025; figma.com/colors/amber/;
  v6.carbondesignsystem.com/essentials/typography.html
