/**
 * IIIF manifest resolver.
 *
 * Maps (manuscriptId, book, chapter) → IIIF Presentation API manifest URL,
 * so `ManuscriptImageViewer` can hand it to OpenSeadragon's tile-source
 * loader. Provides a fallback chain matching the spec:
 *
 *     mirror (Tier 0) → public manifest → null (caller falls back to text)
 *
 * Manifest URLs are intentionally registered with `verified: false` until
 * a maintainer fetches each manifest in a browser, confirms it loads, and
 * flips the flag. Until verified, the resolver returns null so the UI
 * gracefully shows the text-only path rather than an OpenSeadragon error.
 *
 * Spec ref: docs/superpowers/specs/2026-04-27-frontend-visual-upgrades-design.md §3.A.1
 */

/**
 * Tier-0 mirrored pages — high-traffic demo pages we host ourselves
 * (Netlify large-asset delivery). Populated by Slice 4 of Phase H.
 *
 * Schema (when populated):
 *   '<manuscriptId>:<book>:<chapter>': '/iiif/<manuscriptId>/<book>/<chapter>/info.json'
 */
export const MIRRORED_PAGES = Object.freeze({
  // Slice 4 will add: 'WLC:GEN:1', 'WLC:EXO:20', 'WLC:PSA:22',
  //                    'WLC:ISA:53', 'SBLGNT:MAT:1', 'SBLGNT:JHN:1',
  //                    'SBLGNT:REV:22'
});

/**
 * Public IIIF Presentation API manifests.
 *
 * IMPORTANT: every entry begins with `verified: false`. A maintainer must:
 *   1. Open the manifest URL in a browser (CORS check)
 *   2. Confirm it loads as valid IIIF Presentation v2 or v3 JSON
 *   3. Confirm tile images load via OpenSeadragon
 *   4. Then flip `verified: true`
 *
 * Until verified, `resolveManifest` returns null for that manuscript and the
 * UI shows text-only — no broken viewer state.
 *
 * Sources are publicly known IIIF endpoints; specific manifest URLs need
 * verification because IIIF endpoints frequently change as institutions
 * migrate between viewer software (Mirador, UV) and IIIF version (v2 → v3).
 */
export const MANIFEST_REGISTRY = Object.freeze({
  // British Library / Univ. of Leipzig digitization
  SIN: {
    manuscript: 'Codex Sinaiticus',
    source: 'https://codexsinaiticus.org/',
    manifests: {
      // Per-book manifests TBD on verification.
      // Example shape: 'JHN': 'https://codexsinaiticus.org/iiif/john/manifest.json'
    },
    verified: false,
  },

  // Israel Museum, Jerusalem
  ALEPPO: {
    manuscript: 'Aleppo Codex',
    source: 'https://aleppocodex.org/',
    manifests: {},
    verified: false,
  },

  // Leon Levy Digital Library (Israel Antiquities Authority)
  DSS: {
    manuscript: 'Dead Sea Scrolls',
    source: 'https://www.deadseascrolls.org.il/',
    manifests: {},
    verified: false,
  },

  // Vatican Apostolic Library — Vat.gr.1209, 4th-century Greek codex (LXX + NT).
  // Manifest verified 2026-04-28: returns IIIF Presentation v2 with 1555 canvases
  // and IIIF Image API v2 level 2 tiles; deep-zoom works in OpenSeadragon.
  VATICANUS: {
    manuscript: 'Codex Vaticanus',
    source: 'https://digi.vatlib.it/view/MSS_Vat.gr.1209',
    manifestRoot: 'https://digi.vatlib.it/iiif/MSS_Vat.gr.1209/manifest.json',
    manifests: {},
    verified: true,
  },

  // Cambridge University Library — MS Nn.2.41. 5th c. bilingual Greek + Latin
  // codex of the Gospels and Acts; primary witness for the "Western" text-type.
  // Manifest verified 2026-04-28: IIIF Presentation v2, 856 canvases, Image API
  // v2 level 1 with 5762×6650 px source images.
  BEZAE: {
    manuscript: 'Codex Bezae',
    source: 'https://cudl.lib.cam.ac.uk/view/MS-NN-00002-00041',
    manifestRoot: 'https://cudl.lib.cam.ac.uk/iiif/MS-NN-00002-00041',
    manifests: {},
    verified: true,
  },

  // Vatican Apostolic Library — Vat.gr.2125. 6th c. Greek codex of the LXX
  // prophetic books (Marchalianus). Direct primary-source companion for our
  // LXX text. Manifest verified 2026-04-28: IIIF Presentation v2, 1718 canvases.
  MARCHALIANUS: {
    manuscript: 'Codex Marchalianus',
    source: 'https://digi.vatlib.it/view/MSS_Vat.gr.2125',
    manifestRoot: 'https://digi.vatlib.it/iiif/MSS_Vat.gr.2125/manifest.json',
    manifests: {},
    verified: true,
  },

  // Vatican Apostolic Library — Reg.lat.7. ~8th c. Latin Vulgate Gospels;
  // primary-source companion for our VUL text. Manifest verified 2026-04-28:
  // IIIF Presentation v2, 294 canvases.
  REG_LAT_7: {
    manuscript: 'Reginensis Latinus 7 (Vulgate Gospels)',
    source: 'https://digi.vatlib.it/view/MSS_Reg.lat.7',
    manifestRoot: 'https://digi.vatlib.it/iiif/MSS_Reg.lat.7/manifest.json',
    manifests: {},
    verified: true,
  },

  // Cambridge University Library digitization
  WLC: {
    manuscript: 'Westminster Leningrad Codex',
    source: 'https://cudl.lib.cam.ac.uk/',
    manifests: {},
    verified: false,
  },
});

/**
 * Normalize a book identifier to the registry key form (uppercase, no
 * accidental whitespace). Accepts 'gen', 'GEN', 'Gen' alike.
 */
const normalizeBook = (book) => String(book ?? '').trim().toUpperCase();

/**
 * Resolve a manuscript view to an IIIF manifest URL.
 *
 * Resolution order:
 *   1. Tier-0 mirrored page (if `MIRRORED_PAGES` has the exact verse coordinate)
 *   2. Per-book manifest (if `MANIFEST_REGISTRY[id].manifests[book]` exists)
 *   3. Manuscript-level `manifestRoot` (single manifest covering the whole codex —
 *      the user navigates pages within OpenSeadragon)
 *   4. null (caller must fall back to text-only)
 *
 * For (2) and (3) the entry must be `verified: true`.
 *
 * @param {object} args
 * @param {string} args.manuscriptId  Registry key (e.g. 'VATICANUS', 'WLC')
 * @param {string} args.book          Three-letter book code (e.g. 'GEN')
 * @param {number|string} args.chapter Chapter number — used by mirror lookup
 * @returns {string|null} manifest URL, or null if no verified source exists
 */
export const resolveManifest = ({ manuscriptId, book, chapter }) => {
  const msId = String(manuscriptId ?? '').trim().toUpperCase();
  const bk = normalizeBook(book);

  const mirrorKey = `${msId}:${bk}:${chapter}`;
  if (MIRRORED_PAGES[mirrorKey]) {
    return MIRRORED_PAGES[mirrorKey];
  }

  const entry = MANIFEST_REGISTRY[msId];
  if (!entry || !entry.verified) return null;

  if (entry.manifests[bk]) return entry.manifests[bk];
  if (entry.manifestRoot) return entry.manifestRoot;
  return null;
};

/**
 * Does a manuscript have any reachable verified manifest?
 * Used by the UI to decide whether to render the "View page image" toggle.
 */
export const hasVerifiedManifests = (manuscriptId) => {
  const msId = String(manuscriptId ?? '').trim().toUpperCase();
  const entry = MANIFEST_REGISTRY[msId];
  if (!entry || !entry.verified) return false;
  if (entry.manifestRoot) return true;
  return Object.keys(entry.manifests).length > 0;
};

/**
 * Every registered manuscript that currently has a verified manifest. Returned
 * as an array of `{ id, manuscript, source }` so the UI can render a picker
 * (e.g. "Browse digitized codices").
 */
export const listVerifiedManuscripts = () =>
  Object.entries(MANIFEST_REGISTRY)
    .filter(([id]) => hasVerifiedManifests(id))
    .map(([id, entry]) => ({
      id,
      manuscript: entry.manuscript,
      source: entry.source,
    }));
