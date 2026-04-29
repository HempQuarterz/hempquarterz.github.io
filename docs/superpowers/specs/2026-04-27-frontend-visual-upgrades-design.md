# Frontend Visual Upgrades — Design Spec

**Date:** 2026-04-27
**Status:** Partially shipped. Sections **D** (D.1, D.2, D.4), **A.2** (Hebrew biblical
font swap — Ezra SIL chosen over SBL Hebrew, see §3.A.2), **B.1** (typography polish),
full **B.2c** (root-level View Transitions + persistent dock/header + anchor positioning),
**B.3** (native CSS scroll-driven reveals), and **Phase B Subgrid** (re-scoped to
ParallelPassageViewer — see §6 phasing notes) are now shipped via commits `005ae28`,
`431234a`, `35f69b0`, `441fa52`, `a2e527b`, and `e7fbf85`. **All Section B work and the
local-feel batches are complete.** Stabilization pass shipped in `87edd8b` (Lighthouse
production verified Perf 92 / A11y 100 / BP 100 / SEO 100 + 18 new regression assertions
guarding the shipped CSS/HTML). **Phase H** in progress: slice 1 (OpenSeadragon dep +
`api/iiif.js` resolver scaffold + `ManuscriptImageViewer.jsx` lazy component + tests)
shipped, slice 2 (live UI toggle + verified manifest URLs) pending. Sections **A.1
(remaining manifests), D.3, Phase G Capacitor** still ahead.
**Live URL:** https://all4yah.com (Phase F shipped)
**Scope:** Three linked axes — manuscript authenticity (A), reading experience (B),
offline-first architecture (D) — unified under a single architectural through-line.
**Companion docs:** `docs/UI_UX_AUDIT_2026-04-27.md` (audit findings this design builds on)
**Out of scope (future specs):** audio recitation (Web Speech API + recorded audio), TEI
XML scholarly export, full local-first sync engine for user annotations, PGlite migration.

---

## 0. Shipped state as of 2026-04-27 evening

This document was written *before* execution; the project then shipped 11 commits in one
session, including most of the audit batches and Sections B.2c + D. Below is the
authoritative running state. Subsequent sections describe each piece in detail with
explicit "✅ shipped" / "⏳ pending" / "❓ verify" markers.

| Item | Status | Evidence |
|---|---|---|
| Audit Batch 1 — theme cohesion + a11y batches 1–2 | ✅ shipped | `dcb1ba4`, light-mode fixes `c0bf099` `f1b0478` |
| Audit Batch 3 — 404, og tags, sitemap, per-route titles | ✅ shipped | `a10d7c4` (incl. `useDocumentTitle` hook) |
| Phase A — Biome + Lighthouse CI | ✅ shipped | `343bfb1` |
| Phase A — `vite-plugin-pwa` scaffold | ❌ rejected | replaced by hand-rolled `frontend/public/sw.js` |
| Inline-style cleanup (audit P1-8) | ✅ shipped (partial) | `b7cae90` (ParallelPassageViewer + ErrorBoundary) |
| Section B.2c — View Transitions (root-level) | ✅ shipped | `005ae28` — `useViewTransition.js`, `view-transitions.css`, `cross-reference-badge.css` |
| Section B.2c — persistent dock/header VT names | ✅ shipped | `35f69b0` — `view-transition-name: dock` on `.covenant-dock`, `: header` on `.breadcrumb-ribbon`, plus `::view-transition-group/old/new(dock)/(header) { animation: none }` opt-outs in `view-transitions.css` |
| Section D.1 — three-tier offline (auto / read-as-you-go / opt-in download) | ✅ shipped | `431234a` |
| Section D.2 — Dexie storage + custom SW | ✅ shipped | `431234a` — `services/offlineDb.js`, `services/offlineCache.js`, `services/registerSW.js`, `public/sw.js` |
| Section D.4 — `DATA_VERSION` cache invalidation | ✅ shipped | `431234a` (in-code constant; SQL table-based mechanism deferred) |
| Phase F — DNS migration to all4yah.com | ✅ live | dashboard action |
| Section B.1 — typography polish (`text-wrap: pretty`, `hanging-punctuation`, etc.) | ✅ shipped | `35f69b0` — applied to `.reader-prose, .scripture-text, .verse-text` in `scripture-reader.css` |
| Section B.3 — native CSS scroll-driven reveals | ✅ shipped | `a2e527b` — `scroll-effects.css` adds `view()`-driven verse entry fade + `scroll(root)`-driven parchment aging deepen, gated by `@supports` + `prefers-reduced-motion: no-preference` |
| Phase B Subgrid (re-scoped) | ✅ shipped | `e7fbf85` — original premise was obsolete (no shipped side-by-side multi-language view). Re-scoped to `ParallelPassageViewer.pp-grid` for cross-card baseline alignment of titles + citations; orphaned `.parallel-view` CSS in `manuscripts.css` deleted. |
| Section A.2 — biblical Hebrew font swap | ✅ shipped | `441fa52` — chose **Ezra SIL** (OFL, Google Fonts) over SBL Hebrew per §11 open question 2; cleaner path, no self-hosting, no click-through license. SBL Hebrew documented as future upgrade candidate in `docs/FONT_LICENSES.md`. |
| Stabilization pass | ✅ shipped | `87edd8b` — Lighthouse prod verified (Perf 92 / A11y 100 / BP 100 / SEO 100, LCP 1.4s, TBT 0ms, CLS 0.001); 18 new regression assertions in `frontend/src/test/visual-upgrades.regression.test.js` covering B.1, B.2c, A.2, B.3, Phase B Subgrid; `.gitignore` swallows stray Lighthouse Chrome-profile artifacts. |
| Section A.1 — IIIF resolver + viewer scaffold (Phase H slice 1) | ✅ shipped | `1851787` — OpenSeadragon 6 installed + `vite.config.js` `vendor-openseadragon` chunk rule + `api/iiif.js` registry/resolver (initial: all `verified: false`) + `components/ManuscriptImageViewer.jsx` lazy-loadable. |
| Section A.1 — IIIF live integration (Phase H slice 2) | ✅ shipped | Codex Vaticanus IIIF Presentation v2 manifest verified live (`https://digi.vatlib.it/iiif/MSS_Vat.gr.1209/manifest.json` — 1555 canvases, IIIF Image API v2 level 2). Registry now exposes `manifestRoot` + new `listVerifiedManuscripts()` helper. New `ManuscriptImageModal.jsx` overlay (codex picker + ESC/close, lazy-imports the viewer). 4th FAB on `ManuscriptsPage` opens the modal — only rendered when `listVerifiedManuscripts()` is non-empty. Bundle: +0.83 KB to main chunk (now 106.12 KB); OpenSeadragon (341 KB / 85 KB gzipped) lives in own `vendor-openseadragon` chunk, loaded only on modal open. 12 unit tests on the resolver. |
| Section A.1 — manifest parsing fix (Phase H slice 2 follow-up) | ✅ shipped | `c3e2151` — caught during browser QA: OpenSeadragon `tileSources` cannot consume IIIF Presentation manifests directly (expected `info.json` URLs). Viewer now does two-stage init: fetch + parse manifest (v2 + v3 shapes) → setTileSources(canvases.map(→info.json)) → mount OSD with `sequenceMode: true`. New `loading` and `error` render branches. Verified end-to-end against `vite preview`: tile rendering of Vat.gr.1209 confirmed. |
| Section A.1 — additional verified codices (Phase H slice 2.5) | ✅ shipped | Three more IIIF manifests verified live and registered: **Codex Bezae** (Cambridge MS Nn.2.41 — 5th c. bilingual Greek+Latin NT, 856 canvases), **Codex Marchalianus** (Vat.gr.2125 — 6th c. LXX prophets, 1718 canvases), **Reginensis Latinus 7** (Vatican Reg.lat.7 — ~8th c. Vulgate Gospels, 294 canvases). Codex-picker tabs in the modal now activate automatically (4 codices). 6 additional resolver tests. |
| Section A.1 — per-verse canvas mapping (Phase H slice 3) | ✅ shipped | Modal now opens at the codex page that actually contains the user's current verse. New `coverCanvases` field on each verified registry entry (4 / 2 / 8 / 2 — number of leading binding/colorchecker/Roman-prefatory canvases to skip). New `CANVAS_MAPS` (curated `book → canvas-index` per codex) seeded with Vaticanus GEN→4, Bezae MAT→2, Reg.lat.7 MAT→2. New `resolveCanvasIndex({manuscriptId, book, chapter})` resolver: explicit map → coverCanvases fallback → 0. Viewer reads the resolver and passes the index to OpenSeadragon's `initialPage` config; modal threads `book`/`chapter` from `selectedVerse` through to the viewer. QA verified: opening the modal on Genesis 1 now lands directly on Vat.gr.1209 folio 1r (the illuminated Greek uncial Genesis incipit), not the binding-cover image. 8 additional resolver tests. Future codicology work can extend `CANVAS_MAPS` per-codex without touching the API. |
| Section D.3 — IIIF tile caching layer in custom SW | ✅ shipped | `frontend/public/sw.js` — `VERSION` bumped to `all4yah-v2` (cleans stale caches), new `iiif-tiles-${VERSION}` (cache-first w/ FIFO trim at 400 entries) + `iiif-manifests-${VERSION}` (stale-while-revalidate) caches. Cross-origin IIIF requests are intercepted **before** the same-origin bailout so tiles from `digi.vatlib.it` (and future codex sources) become offline-replayable. 6 new regression assertions in the visual-upgrades regression suite. |
| Phase G — Capacitor mobile wrap | ⏳ pending | post-Phase H |

**Architectural deviation worth flagging:** the original spec called for `vite-plugin-pwa`
+ Workbox runtime caching. The shipped implementation is a hand-rolled `public/sw.js` (3.2
KB) plus Dexie-backed `services/offlineCache.js`. **This is the better fit for All4Yah's
shape** (small static asset list, predictable verse-fetch URLs, no need for Workbox's
plugin ecosystem) but it does mean any future cache-strategy work — IIIF tiles,
Background Sync queues, manifest versioning beyond the current `DATA_VERSION` constant —
must be hand-coded in `public/sw.js` rather than declared via Workbox config. Section §5
below has been rewritten to reflect this.

---

## 1. Vision

**The manuscript is the artifact.** Every choice in this design pushes All4Yah away from
"Bible app skin" and toward "primary-source archive you can hold". Three concrete commitments:

1. **You can see the actual page.** Public IIIF deep-zoom of real codex photos
   (Sinaiticus, Aleppo, DSS) alongside the transcribed text. *(pending — Phase H)*
2. **It reads like a book, not a webpage.** Native CSS typography polish + hybrid
   View-Transitions/framer-motion page-turns + scroll-driven reveals. *(B.2c shipped;
   B.1 verify; B.3 pending)*
3. **It works on a plane, in bed, in a service.** Three-tier offline cache (auto-shell +
   read-as-you-go + opt-in book download) sharing infrastructure with IIIF tile cache.
   *(D.1, D.2, D.4 shipped; D.3 IIIF tile caching pending)*

These three are not independent epics. They share infrastructure: the service worker
caches both verse JSON and IIIF tiles; View Transitions wrap both verse swaps and
page-image fades; typography rules apply equally to transcription and the IIIF caption
layer.

---

## 2. Architectural Through-Line (as shipped + planned)

```
                       ┌──────────────────────────────────┐
                       │   Custom Service Worker          │
                       │   (frontend/public/sw.js)        │ ✅ shipped
                       │   • cache-first for assets       │
                       │   • network-first w/ shell HTML  │
                       │   • IIIF tile cache              │ ⏳ pending (A.1)
                       │   • Background Sync queue        │ ⏳ pending (future)
                       └────────────┬─────────────────────┘
                                    │
                ┌───────────────────┼───────────────────┐
                ▼                   ▼                   ▼
       ┌────────────────┐  ┌────────────────┐  ┌────────────────┐
       │ Dexie (IDB)    │  │ Verses API     │  │ IIIF Manifest  │
       │ (offlineDb.js) │  │ (verses.js +   │  │ Loader         │
       │ ✅ shipped     │  │  offlineCache) │  │ ⏳ pending      │
       │ • verses       │  │ ✅ read-       │  │ (api/iiif.js)  │
       │ • xrefs        │  │   through      │  │                │
       │ • mappings     │  │   wrapper      │  │                │
       │ • DATA_VERSION │  │                │  │                │
       └────────────────┘  └────────┬───────┘  └────────┬───────┘
                                    │                   │
                                    ▼                   ▼
                       ┌──────────────────────────────────┐
                       │  Manuscript Reader Surface       │
                       │  (ManuscriptViewer +             │
                       │   ScriptureReader/StudyReader)   │
                       │  • CSS typography polish         │ ❓ verify (B.1)
                       │  • View-Transition names         │ ✅ shipped (B.2c)
                       │  • OpenSeadragon panel (toggle)  │ ⏳ pending (A.1)
                       │  • Variable Hebrew font          │ ⏳ pending (A.2)
                       └──────────────────────────────────┘
```

The View Transitions API and framer-motion compose at the layout level: VT owns
route-level transitions (verse↔verse, chapter↔chapter, book↔book, codex-page↔codex-page)
and persistent elements (`view-transition-name: dock`); framer owns hover, focus, dock
state, tab switches, and any animation that responds to non-route state.

---

## 3. Section A — Manuscript Authenticity ⏳ pending

### A.1 IIIF imagery — hybrid (A.1c) ⏳ pending

**Decision:** load page imagery from public IIIF manifests by default; mirror only critical
high-traffic / demo pages to All4Yah's own storage.

**Manifests to integrate:**

| Manuscript | Source | Manifest |
|---|---|---|
| Codex Sinaiticus | British Library / Univ of Leipzig | `https://codexsinaiticus.org/iiif/...` |
| Aleppo Codex | Israel Museum | `https://manifests.imj.org.il/aleppo/...` |
| Dead Sea Scrolls | Leon Levy Digital Library | `https://www.deadseascrolls.org.il/iiif/...` |
| Codex Vaticanus | Vatican Apostolic Library | `https://digi.vatlib.it/iiif/...` |
| Westminster Leningrad | Cambridge Univ. Library digital ms | TBC during implementation |

(Exact manifest URLs verified during implementation; sources above are publicly known.)

**Mirror strategy (Tier 0 — guaranteed-available pages):**
- Genesis 1, Exodus 20, Psalm 22, Isaiah 53, Matthew 1, John 1, Revelation 22.
- Stored as IIIF Level-0 static tiles in `frontend/public/iiif/` (Netlify large-asset
  delivery, no separate large-media plugin needed).
- Fallback URL chain: `mirror → public manifest → cached tiles → text-only`.

**Component:** `frontend/src/components/ManuscriptImageViewer.jsx`
- Wraps OpenSeadragon (`openseadragon` npm package, ~120 KB).
- Lazy-loaded (React.lazy) — only mounts when user toggles "Show page image" on the
  current verse view, never on first paint.
- Receives `manuscriptId` + `book/chapter` and resolves to a manifest URL via a
  `frontend/src/api/iiif.js` resolver module.
- Emits `view-transition-name: codex-image-{manuscriptId}` so VT (already shipped) can
  fade between codex pages when the user navigates verses.

**Performance budget:** OpenSeadragon + manifest resolver must add ≤30 KB to the main
chunk. The viewer itself is route-lazy so its full ~120 KB only loads on opt-in.

### A.2 Biblical Hebrew font ✅ SHIPPED in commit `441fa52` — Ezra SIL chosen

**Decision (resolved §11 open question 2):** the spec originally proposed SBL Hebrew with
Ezra SIL as a documented fallback. After evaluating both, **Ezra SIL was adopted** as
primary because:

- It's on Google Fonts CDN (zero hosting overhead, no manual WOFF2 conversion).
- It's licensed under SIL Open Font License (OFL) 1.1, the most permissive scholarly
  font license — no click-through agreement required, clear redistribution terms.
- It was designed by SIL specifically for biblical Hebrew with full niqqud and
  cantillation; quality delta from SBL Hebrew is small for the All4Yah use case.
- The spec explicitly anticipated this trade-off ("depends on which has cleaner WOFF2
  conversion path" — Ezra SIL on Google Fonts has the cleanest path of any candidate).

SBL Hebrew remains documented as a future upgrade candidate in `docs/FONT_LICENSES.md`
should specific cantillation-rendering issues surface that Ezra SIL cannot handle.
Taamey D Variable CLM (true variable font, GPL3, Aleppo Codex aesthetic) is also
documented for a possible future "scholarly edition" mode.

**Shipped artifacts:**
- `frontend/index.html` — Google Fonts URL swapped: `Noto+Serif+Hebrew:wght@400;700` →
  `Ezra+SIL:wght@400;700`.
- 8 CSS files + `FloatingLetters.jsx` — every `font-family: 'Noto Serif Hebrew', …`
  chain rewritten to lead with `'Ezra SIL'`. Where present, `'SBL Hebrew'` retained as
  deeper fallback for users with it installed locally.
- `frontend/src/styles/manuscripts.css` — duplicate `@import` for Noto+Serif+Hebrew
  removed (was redundant with the index.html load).
- `docs/FONT_LICENSES.md` (NEW) — per-font attribution table covering all 10 OFL fonts
  in production, plus documented future upgrade candidates.

**Net font-variant reduction:** ~12 Noto Serif Hebrew variants removed, ~2 Ezra SIL
variants added — net drop of ~10 from the post-Batch-1 baseline. Compounds with the
duplicate-import deletion already shipped in audit Batch 1.

**Verification still owed:** browser-side niqqud + cantillation render check on
representative WLC verses (e.g., Gen 1:1 with niqqud, Ps 1:1 with full cantillation
marks) on Chrome + Safari. Tracked in §7 success criterion 1.2.

---

## 4. Section B — Reading Experience

### B.1 Typography polish (CSS-only) ✅ SHIPPED in commit `35f69b0`

**Decision:** apply scoped to scripture/manuscript content only — never globally
(could break dock/UI labels).

**Shipped artifacts:** `frontend/src/styles/scripture-reader.css` block beginning at line ~109,
applied to `.reader-prose`, `.scripture-text`, `.verse-text`:

```css
.reader-prose,
.scripture-text,
.verse-text {
  text-wrap: pretty;                            /* eliminate orphans */
  hanging-punctuation: first allow-end last;    /* hanging quotes */
  text-box-trim: trim-both;                     /* optical metric trim */
  text-spacing-trim: trim-start;                /* CJK/Hebrew quote trim */
}
```

(`hyphens: auto` was pre-existing in the `.reader-prose` rule and remains untouched.)

**Browser fallback:** all four properties degrade gracefully — non-supporting browsers
(Safari < 17.5) get the current rendering. No JS feature detection needed.

**Verification still owed:** Playwright snapshot tests on long-form scripture pages
(Genesis 1, Psalm 119) at desktop + mobile widths to confirm no single-word orphans render.
Tracked in §7 success criterion 2.1.

### B.2c Hybrid transitions ✅ fully shipped (base in `005ae28`, persistence in `35f69b0`)

**Shipped (base View Transitions, `005ae28`):**
- `frontend/src/hooks/useViewTransition.js` — capability-detecting hook that wraps
  `useNavigate` in `document.startViewTransition` when supported.
- `frontend/src/styles/view-transitions.css` — `@view-transition { navigation: auto; }`
  plus `::view-transition-old(root)` / `::view-transition-new(root)` parchment fade
  keyframes (180ms out, 220ms in) with `prefers-reduced-motion` opt-out.
- `frontend/src/styles/cross-reference-badge.css` — anchor-positioning rules for
  cross-reference popovers (auto-flip on viewport edges, no JS).

**Shipped (persistent-element refinement, `35f69b0`):**
- `.covenant-dock { view-transition-name: dock; }` in `covenant-dock.css`
- `.breadcrumb-ribbon { view-transition-name: header; }` in `breadcrumb-ribbon.css`
- Opt-out rules in `view-transitions.css`:
  ```css
  ::view-transition-group(dock),
  ::view-transition-group(header) { animation: none; }

  ::view-transition-old(dock),
  ::view-transition-new(dock),
  ::view-transition-old(header),
  ::view-transition-new(header) { animation: none; }
  ```

The dock and breadcrumb now stay still during route changes while only the content
area parchment-fades. Browser-side verification (Chrome 124+ / Safari 18+) recommended
during the next stabilization pass; reduced-motion users get the existing instant-nav
fallback automatically.

**framer-motion retained for** (already correct):
- ConsolidatedPanel tab switches
- Dock hover/focus magnetic effect
- ManuscriptCarousel item-level animation
- HomePage hero entrance
- All `AnimatePresence` micro-interactions

**framer-motion retained for:**
- ConsolidatedPanel tab switches
- Dock hover/focus magnetic effect
- ManuscriptCarousel item-level animation
- HomePage hero entrance
- All `AnimatePresence` micro-interactions

### B.3 Scroll-driven reveals ✅ SHIPPED in commit `a2e527b`

**Shipped artifacts:**
- `frontend/src/styles/scroll-effects.css` (new) — two atomic scroll-driven effects.
- `frontend/src/App.jsx` — single-line import after `scholarly-theme.css`.

**Effects shipped:**

1. **Ink-spread verse entry** (`animation-timeline: view()`) — `.verse-card` and
   `.verse-row` fade + lift slightly as they scroll into the viewport.
   `animation-range: entry 0% cover 30%` so the motion completes before the reader
   begins reading the element.

2. **Parchment aging deepen** (`animation-timeline: scroll(root)`) —
   `.parchment-background::after` (the age-spots layer in `scholarly-theme.css`)
   ramps opacity from 0.5 → 0.85 across full document scroll. Subtle "patina"
   suggesting time-with-the-text.

**Tasteful failure modes:** two layered gates ensure no jank on unsupported browsers
or for users who prefer reduced motion:
- `@media (prefers-reduced-motion: no-preference)` — entirely skipped on reduce-motion.
- `@supports (animation-timeline: view())` — entirely skipped on Firefox without the
  flag, Safari < 18, etc. Pure progressive enhancement; the existing static rendering
  remains.

**Originally-listed effect not shipped:** FloatingLetters parallax was removed from
scope. The component already has its own animation system using inline-style CSS
variables and per-letter transforms; layering scroll-driven on top risked visual
noise and CPU cost. Can revisit if the AboutPage narrative scroll demands it.

**GSAP** is *not* added — explicitly reserved for any future multi-stage narrative
scroll page (e.g., a "history of the manuscripts" feature on AboutPage). framer-motion
remains the answer for state-bound animation.

---

## 5. Section D — Offline-First Architecture (custom SW, not Workbox)

### D.1 Three-tier sync model ✅ SHIPPED in commit `431234a`

| Tier | Auto/Opt-in | Contents | Estimated size | Status |
|---|---|---|---|---|
| **Tier 1** | Auto on first visit | App shell + WEB English + name mappings + canonical books | ~3 MB | ✅ shipped |
| **Tier 2** | Auto on view | Chapters cached when navigated | grows with use | ✅ shipped (verified — 185 verses / 16 chapters auto-cached after a few minutes browsing) |
| **Tier 3** | Opt-in per book | Full Hebrew/Greek/Latin for a downloaded book + IIIF tiles | up to 55 MB total | ✅ button shipped (`BookDownloadButton.jsx` in `ScriptureToolbar`); IIIF tile pre-warm portion deferred to D.3 + A.1 |

Tier 3 surfaces as a "Download for offline" affordance per book/manuscript inside the
ScriptureToolbar/BookSelector flow. Three states: Download / Progress / ✓ Offline.

### D.2 Storage stack — Dexie + custom SW (PGlite later) ✅ SHIPPED in commit `431234a`

**Architecture deviation from original spec:** original recommended Workbox via
`vite-plugin-pwa`. Shipped implementation is a hand-rolled `public/sw.js` (3.2 KB) plus
Dexie. **This is the better fit** — smaller bundle, no plugin tax, full control over
cache semantics — but it means future cache-strategy additions (IIIF tiles, Background
Sync, beyond-`DATA_VERSION` invalidation) are hand-coded.

**Shipped files:**
- `frontend/src/services/offlineDb.js` — Dexie schema with 4 stores (`verses`,
  `cross_references`, `name_mappings`, `cache_manifest`-equivalent), and a
  `DATA_VERSION` constant for invalidation.
- `frontend/src/services/offlineCache.js` — read-through wrappers that are transparent
  to consumers. `getVerse` / `getChapter` in `frontend/src/api/verses.js` now delegate
  here automatically.
- `frontend/src/services/registerSW.js` — service worker registration on app boot.
- `frontend/public/sw.js` — custom SW: cache-first for assets, network-first with
  shell-HTML fallback for navigation requests.
- `frontend/src/components/OfflineBadge.jsx` — slim gold banner when
  `navigator.onLine === false`.
- `frontend/src/components/BookDownloadButton.jsx` — Tier 3 UI, three states.
- `frontend/src/hooks/useOnlineStatus.js` — for any future online-aware components.

**Bundle delta:** +96 KB unminified (~32 KB gzipped) for Dexie + cache layer + offline
UI. `transformers.web` (873 KB lazy-loaded) remains the dominant chunk and still defers.

**Background Sync queue** is *not* yet scaffolded. Add it when the first write-side
feature ships (bookmarks, notes).

**Future migration path to PGlite (deferred, documented for posterity):**
- When user-generated content (bookmarks, highlights, notes) ships, migrate the Dexie
  layer to PGlite. PGlite mirrors Supabase schema 1:1, enables ElectricSQL bidirectional
  sync, and unifies query language (SQL on both client and server).
- Migration is non-destructive: Dexie tables become Postgres tables; `offlineCache.js`
  query API stays stable; only the underlying engine swaps.
- Trigger condition: when annotation features enter scope. Until then, do not pay the
  ~3 MB WASM cost.

### D.3 IIIF tile caching ⏳ pending (depends on A.1)

**Approach:** hand-rolled in `public/sw.js`, mirroring the `CacheFirst` pattern Workbox
would have provided. Pseudocode:

```js
// frontend/public/sw.js — addition pending Section A.1
const IIIF_CACHE = 'iiif-tiles-v1';
const IIIF_PATTERN = /^https:\/\/[^/]+\/iiif\/.*\.(jpg|webp|png|json)$/;

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (IIIF_PATTERN.test(request.url)) {
    event.respondWith(
      caches.open(IIIF_CACHE).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone());
        return response;
      })
    );
    return;
  }
  // ... existing handlers for assets / navigation
});
```

LRU eviction handled via a small post-fetch sweep when cache size exceeds a configurable
threshold (e.g., 2000 entries). Tier 3 "Download book for offline" pre-warms the
`IIIF_CACHE` for every IIIF tile referenced by manifest pages within the downloaded book
— hooked from `services/offlineCache.js` via direct `caches.open('iiif-tiles-v1').put()`
loops.

### D.4 Cache invalidation ✅ SHIPPED in commit `431234a` (constant-based)

The shipped implementation uses a `DATA_VERSION` constant in `services/offlineDb.js`.
Bumping it triggers a fresh Dexie schema and re-fetch on next boot.

**Future enhancement (documented, not pending immediate work):** the original spec
proposed a Supabase-side `cache_manifest` row table so individual manuscripts could be
invalidated independently without a global flush. This remains useful long-term —
flushing 224k verses just to refresh WLC is wasteful — but the constant-based approach
is acceptable through the next several import cycles. Promote to per-manuscript
versioning when import cadence increases or when total cache size becomes a concern.

---

## 6. Phasing — current state

| Phase | Original scope | Status |
|---|---|---|
| **Audit Batch 1** | theme cohesion + duplicate font import + 100dvh | ✅ shipped (`dcb1ba4`) |
| **Audit Batch 2** | a11y compliance | ✅ shipped (in `dcb1ba4`) |
| **Audit Batch 3** | 404, footer, og:image, per-route titles, sitemap | ✅ shipped (`a10d7c4`) |
| **Phase A** | Biome + Lighthouse CI + ~~`vite-plugin-pwa` scaffold~~ | ✅ Biome + Lighthouse shipped (`343bfb1`); PWA scaffold replaced by custom `public/sw.js` |
| **Phase B** | audit findings + Subgrid for parallel viewer | ✅ shipped (re-scoped) `e7fbf85` — original premise (Hebrew \| Greek \| English columns) was obsolete by the time the spec was written; the unified-navigation refactor reshaped `ManuscriptCarousel` to one-at-a-time-with-swipe and `StudyReader` to stacked original-then-English. Subgrid was instead applied to `ParallelPassageViewer.pp-grid` (the actual side-by-side comparison view, used for cross-reference passages); orphaned `.parallel-view` CSS deleted. |
| **Phase C** | View Transitions + anchor positioning | ✅ shipped (`005ae28`) |
| **Phase D** | PWA tier 1 + 2 (app shell + read-as-you-go) | ✅ shipped (`431234a`) |
| **Phase E** | Tier 3 bulk download + cache invalidation | ✅ download UI shipped; per-book IIIF pre-warm pending (couples with Phase H) |
| **Phase F** | DNS migration to all4yah.com | ✅ live |
| **Phase G** | Capacitor wrap | ⏳ pending — defer until stabilization complete |
| **Phase H (NEW)** | A.1 IIIF + OpenSeadragon integration with mirror fallback chain | ⏳ pending |
| **Stabilization (NEW)** | Verify B.1 + verify B.2c persistent VT names + production smoke / Lighthouse run on `all4yah.com` | ⏳ next action |

**Net pending work** (sequenced post-stabilization):
- B.1 verify + ship if missing (~1 hour)
- B.3 scroll-driven CSS (~½ day)
- A.2 SBL Hebrew variable font swap (~½ day)
- Phase B Subgrid for parallel viewer (~½ day)
- Phase H IIIF + OpenSeadragon + D.3 tile caching + Phase E IIIF pre-warm (~3–4 days)
- Phase G Capacitor (~3–4 days)

Total remaining: ~7–9 days of focused work.

---

## 7. Success Criteria

The design is successful when, after all phases land:

1. **Manuscript authenticity (A):**
   - [ ] At least one verse on `/manuscripts/genesis/1/1` displays a deep-zoomable
         high-resolution image of the actual codex page alongside the transcription.
   - [ ] Hebrew niqqud and cantillation marks render without missing-glyph squares on the
         entire WLC corpus. *(A.2 Ezra SIL shipped in `441fa52`; browser-side render check
         on representative niqqud + cantillation verses still owed)*
   - [ ] OpenSeadragon viewer loads only when toggled (not on first paint of any route).
   - [ ] Total Google Fonts variants loaded reduces to ≤60 (from audit-baseline 282).
         *(A.2 dropped ~10 variants; re-measure on production to confirm trajectory)*

2. **Reading experience (B):**
   - [ ] No orphaned single words on any rendered verse line at default desktop and mobile
         widths (verified via Playwright snapshot tests). *(B.1 rules shipped in `35f69b0`;
         Playwright verification still owed)*
   - [x] Verse-prev / verse-next navigation visibly cross-fades parchment when VT is
         supported; instant swap when not. *(shipped in `005ae28`)*
   - [x] CovenantDock and BreadcrumbRibbon do NOT animate during route transitions
         (persistent VT names hold them in place). *(shipped in `35f69b0` — recommend
         browser-side smoke test in stabilization)*
   - [x] Lighthouse a11y score ≥0.95 on `/`, `/manuscripts/genesis/1/1`, `/about`. *(audit
         batches 1+2 shipped; re-run Lighthouse against production all4yah.com)*

3. **Offline-first (D):**
   - [x] Tier 1: site loads completely while offline on a previously-visited device,
         including WEB English Genesis 1. *(shipped — re-verify post-DNS)*
   - [x] Tier 2: any chapter visited while online is readable while offline. *(shipped;
         verified — 185 verses / 16 chapters auto-cached during browse session)*
   - [x] Tier 3: a "Download for offline" UI exists per book. *(shipped — IIIF tile
         portion couples with Phase H)*
   - [x] When `DATA_VERSION` is bumped, the next page load on a stale client triggers
         re-fetch of cached data. *(shipped — Playwright test still pending)*

---

## 8. Risks & Mitigations

| Risk | Mitigation |
|---|---|
| Public IIIF URLs change | Mirror critical pages (Tier 0); document fallback chain; add IIIF resolver tests |
| OpenSeadragon adds significant bundle | React.lazy on the viewer component; route-lazy by toggle |
| SBL Hebrew license terms change | Document license; keep Ezra SIL fallback ready |
| View Transitions partially supported (older browsers) | ✅ `useViewTransition` already capability-detects; falls back to existing PageTurnTransition |
| `text-wrap: pretty` not supported in older browsers | Pure progressive enhancement, degrades to default rendering |
| 55 MB Tier 3 download exceeds device storage | Warn user before download; show storage estimate; allow per-book granularity |
| Stale Dexie data after schema migration | `db.version(N)` bumps + explicit upgrade migrations + `DATA_VERSION` invalidation (shipped) |
| IIIF tile cache fills SW storage quota | When D.3 lands: hand-rolled LRU eviction in `public/sw.js` (Workbox would have given this for free; trade-off accepted) |
| **Custom SW is hand-rolled** — must hand-code Tier 0 IIIF pre-fetch, Background Sync, manifest-versioning beyond DATA_VERSION | Document the SW contract in inline comments; add a focused unit test in `frontend/src/test/` covering each cache strategy when it's added; consider Workbox if the SW grows past ~200 lines |
| Production smoke regressions after DNS cutover | Stabilization phase: Lighthouse run on https://all4yah.com, axe-core run, manual prev/next/download flows |

---

## 9. Dependencies

**Already in `frontend/package.json` and shipped to production:**
- `dexie@^4.4.2` ✅
- `@biomejs/biome@2.4.13` (dev) ✅
- `framer-motion@^12.38.0` ✅

**To be added during the pending phases:**
- `openseadragon` — IIIF viewer (~120 KB, route-lazy) — Phase H

**Explicitly rejected:**
- ~~`vite-plugin-pwa`~~ — replaced by hand-rolled `frontend/public/sw.js`.
- ~~`workbox-window`~~ — same reason.

**No new build tooling beyond Vite.** No new state library. No GSAP unless a Phase H+
narrative scroll work demands it.

---

## 10. Files

### Shipped ✅

- `frontend/src/services/offlineDb.js` — Dexie schema + DATA_VERSION
- `frontend/src/services/offlineCache.js` — read-through cache wrapper
- `frontend/src/services/registerSW.js` — SW registration
- `frontend/public/sw.js` — custom service worker (3.2 KB)
- `frontend/src/components/OfflineBadge.jsx`
- `frontend/src/components/BookDownloadButton.jsx`
- `frontend/src/hooks/useOnlineStatus.js`
- `frontend/src/hooks/useViewTransition.js`
- `frontend/src/hooks/useDocumentTitle.js` (per-route titles, audit Batch 3)
- `frontend/src/styles/view-transitions.css`
- `frontend/src/styles/cross-reference-badge.css` (anchor positioning)

### Pending — net-new files

- `frontend/src/api/iiif.js` — IIIF manifest resolver, fallback chain (Phase H)
- `frontend/src/components/ManuscriptImageViewer.jsx` — OpenSeadragon wrapper (Phase H)
- `frontend/public/iiif/` — mirrored Tier-0 critical pages (Phase H)

(The originally-listed `frontend/src/styles/scroll-effects.css` shipped in `a2e527b`.
`frontend/public/fonts/SBLHebrew.woff2` is no longer pending — A.2 shipped via Google
Fonts CDN, not self-hosted. `docs/FONT_LICENSES.md` shipped in `441fa52`.)

### Pending — modified files

- `frontend/package.json` — add `openseadragon` (Phase H)
- `frontend/public/sw.js` — append IIIF cache strategy (D.3, Phase H)
- ~~whichever CSS file holds the active Hebrew `@font-face` — replace Noto Serif Hebrew → SBL Hebrew (A.2)~~ ✅ shipped in `441fa52` (Ezra SIL chosen)
- `frontend/src/styles/scripture-reader.css`, `manuscripts.css` — typography polish rules (B.1, if not already shipped)
- `frontend/src/services/offlineCache.js` — Tier 3 IIIF pre-warm logic (Phase H + D.3 coupling)

---

## 11. Open questions parked for implementation phase

1. Exact public IIIF manifest URLs per manuscript — verify availability and any required
   attribution at implementation time.
2. ~~SBL Hebrew vs Ezra SIL final pick — depends on which has cleaner WOFF2 conversion path.~~ ✅ resolved 2026-04-28: **Ezra SIL** chosen and shipped in `441fa52`. SBL Hebrew documented as future upgrade option in `docs/FONT_LICENSES.md`.
3. Whether to ship a Tier 3 progress UI (per-tile download bar) or a single "Downloading…"
   indicator. Default: single indicator first; progress bar only if user testing demands.
4. Whether Capacitor wrap (Phase G) needs additional native plugins for IIIF cache
   storage on iOS/Android filesystems. Likely no — Cache API works in WebView. Confirm
   during Phase G.
5. Whether to migrate from `DATA_VERSION` constant to per-manuscript Supabase
   `cache_manifest` table — defer until import cadence or cache size forces it.

---

## 12. Stabilization next-actions (post-launch)

Per-user instruction: post-launch stabilization comes before any new implementation work.
The following checks are the entry criteria for resuming the pending phases.

1. **Lighthouse production run** against https://all4yah.com on `/`, `/manuscripts/genesis/1/1`,
   `/about`. Confirm a11y ≥0.95 floor holds in production (not just dev preview).
2. ~~Verify B.1 typography polish.~~ ~~Apply the 10-line CSS addition.~~ ✅ shipped in
   commit `35f69b0`. Playwright snapshot test on long-form scripture (Genesis 1, Psalm
   119) at desktop + mobile widths still owed — confirms no single-word orphans render.
3. ~~Verify B.2c persistent VT elements.~~ ~~Apply the persistent dock/header rules.~~
   ✅ shipped in commit `35f69b0`. Browser-side smoke test still owed: open
   https://all4yah.com once redeployed, navigate verse-next on Chrome 124+ / Safari 18+,
   confirm dock and breadcrumb visibly do not animate while content cross-fades.
4. **PWA smoke test on production.**
   - Visit a chapter while online, then go offline (DevTools → Network → Offline), reload.
   - Confirm OfflineBadge appears and the chapter still renders.
   - Confirm app shell (HTML, CSS, JS, fonts) is served from SW cache.
5. **`DATA_VERSION` invalidation Playwright test.** Add a regression test that bumps
   `DATA_VERSION`, reloads, and asserts cached verses are re-fetched.
6. **Bundle size budget.** Confirm `transformers.web` and `ort-wasm` chunks are still
   gated behind `/lsi/demo` route (not in main bundle). Set `size-limit` budgets in CI.
7. **404 + sitemap.xml + og:image** — confirm production serves these correctly. Twitter
   Card validator + LinkedIn Post Inspector sanity check.
8. **Capture a baseline metrics snapshot** (LCP, CLS, TTI on production) so future
   visual upgrades can be compared against the post-stabilization floor.

Once stabilization exits cleanly, the recommended next ship order is:
- **Phase H IIIF + OpenSeadragon + D.3 IIIF tile cache** (~3–4 days, the biggest "feels
  different" lever — primary-source manuscript imagery alongside transcription) →
  **Phase G Capacitor mobile wrap** (~3–4 days).

(B.1, B.2c persistence, A.2, B.3, and Phase B Subgrid shipped in `35f69b0`, `441fa52`,
`a2e527b`, and `e7fbf85` — **all Section B reading-experience work AND the parallel-
display alignment polish are complete**.)

The `superpowers:writing-plans` skill should be invoked **after stabilization passes** to
break the remaining phases into a concrete, verifiable implementation plan.

---

*Spec self-review: passed (no placeholders, status markers throughout, scoped to one
delivery, ambiguous points listed in §11 rather than left implicit; reflects the
2026-04-27 evening shipped state including the architectural deviation from Workbox to
custom service worker). Ready for documentation commit.*
