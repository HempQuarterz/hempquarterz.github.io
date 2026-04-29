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

  // Vatican Apostolic Library
  VATICANUS: {
    manuscript: 'Codex Vaticanus',
    source: 'https://digi.vatlib.it/view/MSS_Vat.gr.1209',
    manifests: {},
    verified: false,
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
 * @param {object} args
 * @param {string} args.manuscriptId  Registry key (e.g. 'SIN', 'WLC')
 * @param {string} args.book          Three-letter book code (e.g. 'GEN')
 * @param {number|string} args.chapter Chapter number — used by mirror lookup
 * @returns {string|null} manifest URL, or null if no verified source exists
 */
export const resolveManifest = ({ manuscriptId, book, chapter }) => {
  const msId = String(manuscriptId ?? '').trim().toUpperCase();
  const bk = normalizeBook(book);

  // Tier 0 — mirrored static IIIF Level-0 tiles
  const mirrorKey = `${msId}:${bk}:${chapter}`;
  if (MIRRORED_PAGES[mirrorKey]) {
    return MIRRORED_PAGES[mirrorKey];
  }

  // Public manifest — only return if explicitly verified
  const entry = MANIFEST_REGISTRY[msId];
  if (!entry || !entry.verified) return null;

  return entry.manifests[bk] ?? null;
};

/**
 * Did a manuscript get registered with at least one verified manifest?
 * Useful for the UI to decide whether to even show an "image view" toggle.
 */
export const hasVerifiedManifests = (manuscriptId) => {
  const msId = String(manuscriptId ?? '').trim().toUpperCase();
  const entry = MANIFEST_REGISTRY[msId];
  if (!entry || !entry.verified) return false;
  return Object.keys(entry.manifests).length > 0;
};
