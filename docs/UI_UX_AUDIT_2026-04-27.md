# All4Yah — UI/UX Audit (2026-04-27)

Comprehensive audit of the All4Yah React frontend (Vite 8 + vanilla CSS + Supabase) against the
redesign-skill checklist, axe-core (WCAG 2.1 AA), production bundle analysis, and live browser
snapshots at `http://localhost:3000`. **Findings only — no code changes applied.**

**Routes audited:** `/`, `/manuscripts`, `/about`, `/lsi` (LSI/AudioCaptureDemo treated as
experimental, lower bar). `SpatialSidebar` is dead code (per CLAUDE.md memo) and excluded.

---

## Executive Summary

| Severity | Count | Theme |
|---------:|------:|-------|
| **P0**   | 8     | A11y blockers, structural HTML, theme cohesion |
| **P1**   | 14    | Generic-AI patterns, missing strategic content, performance |
| **P2**   | 11    | Polish, code hygiene |

**Top three things to fix first:**
1. Resolve the dual-theme civil war between `variables.css` and `scholarly-theme.css`
   (20 `!important` declarations mask real cascade conflicts).
2. Promote `<div id="main-content">` → `<main id="main-content">` and add a `<footer>`.
   Six page regions on `/manuscripts` are not contained by landmarks (axe `region`).
3. Fix WCAG contrast on `dock-item-label` (4.45:1) and `reader-ms-lang` (3.29:1).
   Both use `rgba(255,255,255,0.5)` at 8.8–9.6 px — fail WCAG AA at any size.

---

## P0 — Critical (a11y / broken / brand-blocking)

### P0-1 Body element is a `<div>`, not `<main>` (axe `region` violation × 6 nodes)
- `frontend/src/App.jsx:56` — `<div id="main-content" className="page-with-dock">` should be
  `<main id="main-content" …>`. The skip-link (`App.jsx:30`) jumps to it, but assistive tech
  cannot identify the main region. axe reports six unlandmarked content blocks on `/manuscripts`.
- **Fix:** swap the `<div>` for `<main>`. Add `<footer>` at app shell or page level.

### P0-2 Color contrast failures (axe serious × 31 total nodes)
- `/` — 3 nodes: `.dock-item-label` text `rgba(255,255,255,0.5)` (`#909aa4`) on
  `#213448` = **4.45:1** at 9.6 px (needs 4.5:1).
- `/manuscripts` — 25 nodes: `.reader-ms-lang` `rgba(255,255,255,0.5)` (`#6f7b8a`) on
  `#182c43` = **3.29:1** at 8.8 px. Two distinct violations: ratio AND tiny font.
- **Fix:** raise label opacity to `0.85` (or use `--brand-gold #F9E4A4`) and bump font-size to
  ≥11 px. Files: `frontend/src/styles/covenant-dock.css`, `frontend/src/styles/scripture-reader.css`.

### P0-3 Heading hierarchy skipped (axe `heading-order`)
- `/`: `<h1>ALL4YAH</h1>` then jumps to five `<h3>` ("Manuscript Viewer", "Spirit AI (LSI)",
  "248,871 Verses", "Our Mission", "Daily Word"). **Zero `<h2>`.**
- `/manuscripts`: `<h1>Genesis 1</h1>` jumps to `<h3 class="cross-ref-title">Cross-References</h3>`.
- **Fix:** keep `<h1>ALL4YAH</h1>` (wordmark hero is the canonical h1 for SEO + SR) and
  promote the five section headings from `<h3>` to `<h2>`. On `/manuscripts`, demote
  Cross-References to `<h3>` only if it's a sub-section of an existing `<h2>`, otherwise
  introduce one.

### P0-4 Vertical-letter `<h1>` rendering ("A\nL\nL\n4\nY\nA\nH")
- The hero `<h1>` on `/` reports its computed innerText as seven separate lines
  (one letter per line). This is fine visually but reads catastrophically in screen readers
  and copy-paste. Each letter is being rendered with `display: block` or wrapped in spans.
- **Fix:** keep visual stack via CSS, but expose `aria-label="All4Yah"` on the `<h1>` and
  put each letter in a `<span aria-hidden="true">` so SR reads "All4Yah" once.

### P0-5 Dual-theme `!important` war
- `frontend/src/styles/variables.css` declares the Celestial palette
  (royal blue + gold + forest green; `--bg-primary: #0D1B2A`).
- `frontend/src/styles/scholarly-theme.css` overrides nearly every var with `!important`
  (`--bg-primary` parchment, `--text-primary` gold, `--accent-primary`, etc.) and re-declares
  `--font-heading`/`--font-body` against `modern.css`'s Merriweather rule.
- 36 `!important` declarations across `src/styles/`; 20 of them in `scholarly-theme.css`.
- **Fix:** pick one source of truth. Move brand kit (Cinzel/Cormorant/Inter, gold/midnight/teal)
  into `variables.css` as default. Delete the parchment light-mode block (memory says
  "always dark"). Strip `!important` once cascade is sane.

### P0-6 Theme-color metadata mismatch
- `index.html:16` — `<meta name="theme-color" content="#2E7D32">` (forest green).
- `public/manifest.json:46` — `"theme_color": "#2E7D32"`, `"background_color": "#F5F1E8"`
  (parchment cream).
- App actually renders dark-glass midnight (`#0E233B`) by default. Installed PWA chrome
  and Android task-switcher will show forest green — wrong.
- **Fix:** `theme-color` → `#0E233B`, `background_color` → `#0E233B`.

### P0-7 Same `<title>` on every route
- `App.jsx` has no `<Helmet>`/`document.title` per route. `/`, `/manuscripts`, `/about`, `/lsi`
  all share `"All4Yah - Ancient Manuscripts with Divine Name Restoration"`.
- Breaks browser-tab/back-history orientation and tanks SEO.
- **Fix:** add a tiny `useDocumentTitle(title)` hook called from each page, or install
  `react-helmet-async`.

### P0-8 No 404 / catch-all route
- `App.jsx:59-73` — explicit routes only; mistyped URL renders blank inside the dock chrome.
- **Fix:** add `<Route path="*" element={<NotFoundPage />} />` with a branded 404 (back-home
  CTA, search input).

---

## P1 — Important (generic AI patterns, perf, strategic gaps)

### P1-1 282 font-face variants loaded into the browser
- `index.html:30` imports Cinzel + Cormorant Garamond + Inter.
- `frontend/src/styles/modern.css:2` imports a SECOND copy of those + Merriweather + Libre
  Baskerville + JetBrains Mono + Noto Serif + Noto Serif Hebrew + Noto Serif Ethiopic + Cardo.
- Live count: **Inter 70 variants, Cardo 48, Noto Serif 48, Cormorant 35, Cinzel 18, JetBrains
  Mono 18, Merriweather 15, Noto Serif Ethiopic 12, Noto Serif Hebrew 12, Libre Baskerville 6 = 282.**
- **Fix:** delete the import line in `modern.css:2`. Trim `index.html:30` to only weights
  actually used. Self-host or use `font-display: optional` for non-critical fonts.

### P1-2 No Open Graph or Twitter card meta tags
- `index.html` has `description` + `keywords` only. Missing `og:title`, `og:description`,
  `og:image`, `og:url`, `og:type`, `twitter:card`, `twitter:title`, `twitter:image`.
- Sharing the live site to Discord/Twitter/iMessage gives bare-link previews.
- **Fix:** add a 1200×630 `og:image` (logo + tagline against midnight) and the seven
  baseline tags. Make titles dynamic per route once P0-7 is solved.

### P1-3 No sitemap.xml; robots.txt has no sitemap reference
- `frontend/public/robots.txt` exists but doesn't point to a sitemap. No `sitemap.xml`.
- **Fix:** generate sitemap (66 OT books × variable chapters is large — start with static
  `/`, `/about`, `/manuscripts`, then add per-book/chapter entries).

### P1-4 Lucide-react `strokeWidth` inconsistency
- 7 imports across the codebase using Sun, Moon, X, BookOpen, Hash, FileText, Eye, Sparkles,
  Home, Info, Mic, Search. `strokeWidth` mixed (some `2`, some default).
- Plus a sun/moon `.theme-toggle` (`modern.css:235-264`) — clichéd dark-mode UI.
- **Fix:** standardize `strokeWidth={1.5}` everywhere for manuscript-feel weight. Lucide as a
  set is fine — replacing it is over-investment. Replace the sun/moon toggle with text label
  `LIGHT · DARK` or a "Lamp ↔ Scroll" pair. (Originally flagged by redesign-skill as a
  generic AI choice; in this project's context, standardization is the correct ceiling.)

### P1-5 Default theme conflicts with documented direction
- Memory says "Dark Glass — always dark". Live default: `data-theme="light"`, parchment cream
  (`bodyColor: rgb(17,24,39)`). Toggle on home reads "Switch to dark mode" — i.e. starts light.
- Either commit to dark-default and remove all `[data-theme="light"]` blocks (≈40% of
  `scholarly-theme.css`), or commit to user-toggleable and delete the "always dark" memo.
- **Fix:** decide. Recommend dark-default with persisted user override.

### P1-6 No `<footer>` anywhere
- Zero `<footer>` elements rendered on `/`, `/manuscripts`, `/about`. No legal links
  (privacy, terms, contact, attributions to WLC/SBLGNT licenses).
- Manuscript projects MUST credit source licenses (WLC public-domain notice, SBLGNT CC BY 4.0,
  etc.) — currently buried in `/about` only.
- **Fix:** ship a global footer with: License attributions, GitHub link, mission statement,
  privacy/terms once written.

### P1-7 `100vh` instead of `100dvh` (9 files)
- `modern.css:24`, `layout-utilities.css`, `reader-mode.css`, `about.css`, `lsi-page.css`, etc.
- iOS Safari address-bar collapse causes the documented mobile layout-jump. Memory mentions
  the fixed mobile dock — `100dvh` would prevent the dock fighting the viewport.
- **Fix:** sed-style replace `100vh` → `100dvh` in CSS.

### P1-8 Inline styles (≈232 instances)
- `AudioCaptureDemo.jsx`: 106 (experimental — defer)
- `ParallelPassageViewer.jsx`: 27 (production — fix)
- `CrossReferenceBadge.jsx`: 10 (production — fix)
- `BentoGrid.jsx`: 8 · `ManuscriptSkeleton.jsx`: 8 · `HomePage.jsx`: 7
- **Fix:** extract `ParallelPassageViewer.jsx` and `CrossReferenceBadge.jsx` styles to their
  existing CSS files. Acceptable to leave dynamic transform values inline (motion).

### P1-9 Hardcoded hex colors in component JSX (138 hits)
- Worst: `ParallelPassageViewer.jsx`, `ErrorBoundary.jsx` (entire button/container styled
  inline with `#fff`/`#000`). `ManuscriptIcon.jsx` uses `stroke="#fff"`.
- **Fix:** route through `var(--brand-gold)`, `var(--text-primary)`, etc.

### P1-10 Bundle: 130 KB CSS (24.6 KB gz) on first paint
- The single `index-*.css` file ships every component CSS even before the user lazy-loads
  AboutPage/LSIPage. AboutPage and LSIPage have their own chunks (good), but their styles
  are still in the main bundle.
- **Fix:** rely on Vite's CSS-code-splitting (default), but verify by importing component CSS
  files INSIDE each lazy component (not from `App.jsx` global), so `LSIPage.css` only loads
  with the LSI route.

### P1-11 Heavy reliance on `dangerouslySetInnerHTML` for divine-name highlighting
- `ScriptureReader.jsx:113`, `StudyReader.jsx:105-106`, `ManuscriptCarousel.jsx`. DOMPurify
  is in deps — confirm it actually wraps every site of `dangerouslySetInnerHTML`. Audit
  showed pattern but didn't verify enforcement on every call site.
- **Fix:** centralize a `<RestoredText html={…}>` component that always sanitizes, ban
  raw `dangerouslySetInnerHTML` via ESLint rule.

### P1-12 Skip-link target is a `<div>`, not `<main>` (related to P0-1)
- `skip-to-content` jumps to `#main-content`, which is a `<div>`. After Tab → "Skip to
  content" is pressed, focus does land but screen readers don't announce a region change.
- **Fix:** P0-1 fixes this automatically.

### P1-13 Modal focus trapping
- `ManuscriptsPage.jsx:243, 260` — Search and Gematria popovers don't trap focus. Tabbing
  past the close button escapes into the page beneath. (Subagent finding.)
- **Fix:** wrap with `react-focus-lock` or hand-rolled `useFocusTrap`.

### P1-14 Click handlers on `<div>` (broken keyboard support)
- `ScriptureToolbar.jsx:133, 194` — `<div className="st-popover-backdrop" onClick={…}>` for
  modal backdrops. Backdrop is fine as div if it ONLY closes on click and the modal itself
  has its own escape/close, but currently no `aria-hidden`/`role="presentation"`.
- **Fix:** add `role="presentation"` and ensure `onKeyDown={Escape}` exists on the modal.

---

## P2 — Polish (visual hygiene, code quality)

### P2-1 Sun/moon theme toggle (`modern.css:235-264`) — generic AI pattern.
### P2-2 Z-index `9999` instead of scale.
- `modern.css:515` (`.skip-to-content`), `ink-ripple.css:13`. Replace with `var(--z-notification)`.
### P2-3 `position: fixed` without `inset:` (10+ instances).
- `bible-navigator.css`, `covenant-dock.css`, `scholarly-theme.css`. Replace four-corner
  `top/right/bottom/left: 0` patterns with `inset: 0`.
### P2-4 `.modern-header` ships light-mode `rgba(255,255,255,0.8)` default.
- Stale; site is dark-default. Either delete the rule or theme it.
### P2-5 All-caps button labels (`HOME`, `SCRIPTURE`, `SPIRIT AI`, `ABOUT`).
- `text-transform: uppercase` on dock items. Combined with the 9.6 px size and 50% opacity,
  this is the trifecta of unreadable. P0-2 fixes the contrast; consider switching to small-caps
  via `font-variant-caps: all-small-caps` or sentence-case for warmth.
### P2-6 `overflow-x: hidden` on both `<html>` and `<body>` (`modern.css:15, 25`).
- Belt + suspenders. Delete the `<html>` one — can break `position: sticky`.
### P2-7 `box-shadow` mostly pure black with low opacity.
- `variables.css:41-45`. Some gold-tinted shadows present (good); most are pure-black drop
  shadows. Tint everything with the panel's hue (midnight on midnight, gold on gold).
### P2-8 Cards use both `background-image` parchment.webp AND midnight gradient.
- `scholarly-theme.css:262-301` — every card and input gets the parchment.webp blended into
  the gradient. On `[data-theme="dark"]` cards become 85% parchment with `backdrop-filter:
  blur(16px)`. Visually striking on Hero, looks crowded everywhere else. Reserve for
  ScriptureReader/StudyReader; remove from inputs and chrome.
### P2-9 `manifest.json` `start_url: "."` should be `/`.
### P2-10 Cache-bust comment in `modern.css:598` (`/* cache bust Sat Mar 14 21:37:22 PDT 2026 */`).
- Remove. Cache busting is Vite's job via content hashes.
### P2-11 No `og:image` 1200×630 asset present.
- `public/` has logo PNGs but no social-share asset.

---

## What's Working (don't break)

- **Brand typography is genuinely good.** Cinzel + Cormorant Garamond + Inter is a
  distinctive scholarly trio that escapes the Inter-everywhere AI default. Keep it.
- **Reduced-motion handling is comprehensive.** `modern.css:569-597` plus per-component
  `@media (prefers-reduced-motion: reduce)` blocks. AAA-level effort; rare.
- **Focus-visible coverage is broad.** Global `button/a/input/[role=button]/[role=tab]:focus-visible`
  rule with a green ring.
- **Vendor chunking is sensible.** Vite manualChunks splits react/redux/supabase/motion.
  Heavy deps (`@huggingface/transformers`, ONNX wasm) are dynamically imported.
- **Skip-link is properly slide-in-on-focus** (not the common `top: -9999px` mistake).
- **Hebrew RTL + multi-script handling.** Noto Serif Hebrew + Noto Serif Ethiopic loaded
  for the languages they exist for, not duct-taped.
- **The mission-fit copy** ("Restoring the Word, verse by verse") avoids every AI
  cliché flagged by the audit (no "elevate", "seamless", "unleash", etc.).
- **0 `npm` vulnerabilities** post `react-scripts` removal.

---

## Recommended Execution Order

**Sequencing note:** Theme cohesion (Batch 1) must come before a11y (Batch 2). Fixing
contrast against `rgba(255,255,255,0.5)` would be redone after the theme refactor strips
`!important` and re-bases tokens. The original Batch 1/2 ordering in the first draft has
been swapped.

**Batch 0 — Theme decision (15 min, blocks everything):**  Dark-default with persisted user
toggle, OR always-dark with no toggle. Memory says "always dark"; live behavior contradicts.
Pick one before touching `variables.css`/`scholarly-theme.css`.

**Batch 1 — Theme cohesion + cheap perf (2–3 days):**  P0-5, P0-6, P1-5, P1-1, P1-7,
P2-4, P2-6, P2-8. One source of truth for tokens, strip `!important`, kill duplicate font
import (282→~70 fonts), `100vh`→`100dvh`.

**Batch 2 — A11y compliance (1–2 days):**  P0-1, P0-2, P0-3, P0-4, P1-12, P1-13, P1-14,
P2-2. Now contrast targets the locked theme. WCAG AA-clean baseline.

**Batch 3 — Strategic content (1 day):**  P0-7, P0-8, P1-2, P1-3, P1-6, P2-11.
404, og:image, sitemap, footer, per-route titles — every page becomes shareable and
indexable.

**Batch 4 — Code hygiene (ongoing):**  P1-8, P1-9, P1-10, P1-11, P2-1, P2-3, P2-5, P2-7,
P2-9, P2-10. Tackle as files are touched. P1-4 (Lucide standardization) belongs here too.

---

## Artifacts

- `/tmp/all4yah-audit/01-home-desktop.png` — Home page full-page screenshot (1280×577 viewport).
- `/tmp/all4yah-audit/02-manuscripts-desktop.png` — Manuscripts page above-fold.
- `/tmp/all4yah-audit/03-about-desktop.png` — About page full-page.
- `/tmp/all4yah-audit/build.log` — production bundle output.

**axe-core 4.10.2 raw findings:**
- `/`: 4 violations (color-contrast × 3, heading-order × 1)
- `/manuscripts`: 32 violations (color-contrast × 25, heading-order × 1, region × 6)
- `/about`: 3 violations (color-contrast × 3)

**Total bundle (gzipped first paint):** ≈155 KB JS + 24.6 KB CSS = **180 KB initial**.
LSI/AudioCaptureDemo + transformers (873 KB) and ONNX wasm (5.17 MB gz) load only on
`/lsi/demo` route — confirmed.
