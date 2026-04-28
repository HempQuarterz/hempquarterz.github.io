# Font Licenses & Attribution

All fonts shipped with All4Yah are loaded from the Google Fonts CDN, which redistributes
each face under the original author's open-source license. Below is per-font attribution
with the license, source, and usage scope.

## Currently loaded (production)

| Font | Used for | License | Original author | Notes |
|---|---|---|---|---|
| **Cinzel** | Display headings (logo, section titles) | OFL 1.1 | Natanael Gama | Self-hosted via Google Fonts. |
| **Cormorant Garamond** | Scripture body / serifed prose | OFL 1.1 | Christian Thalmann | Italic + roman, weights 400/600. |
| **Inter** | UI body / labels / dock | OFL 1.1 | Rasmus Andersson | Weights 300–700. |
| **Cardo** | English biblical text styling | OFL 1.1 | David J. Perry | Specifically designed for biblical/classical philology. |
| **JetBrains Mono** | Code / monospace data (Strong's, gematria) | OFL 1.1 | JetBrains s.r.o. | Weights 400/700. |
| **Libre Baskerville** | Long-form prose option | OFL 1.1 | Pablo Impallari, Rodrigo Fuenzalida | Italic + roman. |
| **Merriweather** | Alt scripture serif | OFL 1.1 | Sorkin Type | Currently loaded; usage being audited. |
| **Noto Serif** | Greek polytonic + Latin scripture body | OFL 1.1 | Google / Steve Matteson | Italic + roman. |
| **Noto Serif Ethiopic** | Geʿez / Ethiopic (EOTC manuscripts) | OFL 1.1 | Google | Weights 400/700. |
| **Ezra SIL** | **Hebrew biblical text + cantillation** | OFL 1.1 | SIL International | Designed specifically for biblical Hebrew with full niqqud and cantillation marks. Adopted 2026-04-28 (commit pending) replacing Noto Serif Hebrew for scholarly fidelity. |

All ten fonts are licensed under the SIL **Open Font License (OFL) version 1.1** — see
<https://openfontlicense.org/> for full terms. The OFL permits free use, study,
modification, embedding, and redistribution, including in commercial products, with
the requirement that the OFL itself accompany any derivative work and that fonts
sold for compensation be bundled with other software (i.e., a font cannot be sold
on its own).

## Fonts removed during stabilization

| Font | Reason | Replaced by |
|---|---|---|
| Noto Serif Hebrew | Less specialized for biblical scholarship; cantillation rendering inconsistent | Ezra SIL (commit pending — A.2 swap) |

## Future upgrade candidates (documented but not yet adopted)

These fonts were considered for the Hebrew slot during spec §3.A.2 brainstorming and remain
on the table if Ezra SIL proves insufficient for any specific rendering need.

| Font | License | Why it's interesting | Why not adopted now |
|---|---|---|---|
| **SBL Hebrew** | "Free for non-commercial educational use" — sbl-site.org | Gold standard for Society of Biblical Literature publications; arguably the cleanest cantillation rendering of any free Hebrew font. | Not on Google Fonts; requires manual download with click-through license + TTF→WOFF2 conversion + self-hosting. License terms less open than OFL. Adopt only if Ezra SIL exhibits specific rendering bugs we cannot work around. |
| **Taamey D Variable CLM** | GPL3 with font exception | True OpenType variable font specifically designed for Aleppo Codex–style cantillation. Most authentic rendering of any free font. | GPL3 license has more friction than OFL for downstream redistribution. Less browser-tested across Hebrew Unicode edge cases. Reserve for a future "scholarly edition" mode. |
| **Frank Ruehl CLM** | GPL2 | Classic Hebrew typography, niqqud OK | No cantillation rendering. Insufficient for Old Testament display. |

## Provenance notes

- All font files served via `https://fonts.googleapis.com/...` are hosted on Google's CDN.
  Browser fetches each font face in WOFF2 form (modern) with WOFF1 / TTF fallback for
  older browsers per the Google Fonts CSS API negotiation.
- No fonts are bundled into the production JS/CSS asset chunks; they are loaded as
  separate HTTP requests at first paint and cached per browser policy.
- The `frontend/index.html` `<link>` tag is the single source of truth for which font
  faces load. A previous duplicate `@import` in `frontend/src/styles/manuscripts.css`
  was removed in commit pending — do not reintroduce.

## Compliance summary

All fonts are OFL except for the candidates parked in "Future upgrade candidates"; none
of those are loaded in production. All4Yah's use case (free, non-commercial scripture
display + scholarly attribution) is well within the OFL's permissive scope. No
attribution is technically required for OFL fonts in software UI, but maintaining this
file as a courtesy and in case any font's licensing changes in the future is part of the
project's scholarly-transparency posture.

---

*Last updated: 2026-04-28 with the Noto Serif Hebrew → Ezra SIL swap (spec §3.A.2). When
adding or removing fonts, update both this file and `frontend/index.html`'s Google Fonts
URL.*
