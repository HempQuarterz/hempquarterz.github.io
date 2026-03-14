# EOTC UI Audit Fix — Design Specification

**Date:** 2026-03-14
**Status:** Approved
**Scope:** Fix 14 issues across 16 components to make EOTC texts accessible, correctly styled, and performant

## Problem

We imported 5,860 EOTC verses across 7 books and 4 manuscripts (CHARLES, WIKISOURCE, BUDGE, GEEZ) but the frontend can't display them because of hardcoded lists, missing language support, and theme violations.

## Sprint 1: Access (Critical — Make EOTC texts visible)

### Fix 1: ManuscriptViewer — Add EOTC manuscripts + Ge'ez language
- **File:** `frontend/src/components/ManuscriptViewer.jsx`
- **Lines 86-99:** Add CHARLES, WIKISOURCE, BUDGE, GEEZ to manuscript array
- **Lines 169-173:** Add `'geez': 'geez-text'` to language class mapping
- **Impact:** Users can select and view all 16 manuscripts

### Fix 2: BookSelector — Add EOTC testament groups
- **File:** `frontend/src/components/BookSelector.jsx`
- **Lines 52-65:** Add groups for "Ethiopian Canon", "Pseudepigrapha / Ethiopian Canon", "Ethiopian Heritage", "Apocrypha"
- **Approach:** Map all non-standard testament values to an "Ethiopian & Apocrypha" group
- **Impact:** Users can navigate to ENO, JUB, ASI, 1MQ, 2MQ, 3MQ, KNG

### Fix 3: CanonicalFilterPanel + CanonicalBadge — Update tier descriptions
- **Files:** `CanonicalFilterPanel.jsx`, `CanonicalBadge.jsx`
- **Change:** Update Tier 2 count from 21 to 24 (added ENO, JUB, ASI), update Tier 4 from "1 book" to include 1MQ, 2MQ, 3MQ. Or make counts dynamic from database.
- **Impact:** Accurate tier descriptions

### Fix 4: NetworkGraphViewer + TimelineViewer — Add EOTC to bookOrder
- **Files:** `NetworkGraphViewer.jsx`, `TimelineViewer.jsx`
- **Change:** Add ENO, JUB, ASI, 1MQ, 2MQ, 3MQ, KNG to bookOrder mapping with appropriate era/date values. Add fallback for unknown books.
- **Impact:** Network graph and timeline work for EOTC texts

### Fix 5: Cross-References API — Add EOTC book codes
- **File:** `frontend/src/api/crossReferences.js` (if it has hardcoded lists)
- **Change:** Add EOTC book codes to OT/NT/deuterocanon book arrays
- **Impact:** Cross-reference links to EOTC books are recognized

## Sprint 2: Polish (High — Correct display)

### Fix 6: ParallelPassageViewer — Dark glass theme + dynamic manuscript
- **File:** `frontend/src/components/ParallelPassageViewer.jsx` + CSS
- **Change:** Replace `background: white`, `color: #333` with dark glass equivalents. Make manuscript selection dynamic instead of hardcoded WEB.
- **CSS values:** bg → `rgba(30, 41, 59, 0.6)`, text → `#e2e8f0`, borders → `rgba(255,255,255,0.1)`

### Fix 7: CrossReferenceBadge — Dark glass tooltip
- **File:** `frontend/src/components/CrossReferenceBadge.jsx`
- **Change:** Replace white tooltip with `rgba(14, 35, 59, 0.95)` bg, `#e2e8f0` text

### Fix 8: ThematicDiscoveryPanel — Expand sample books
- **File:** `frontend/src/components/ThematicDiscoveryPanel.jsx`
- **Lines 83-84:** Add EOTC books to sample array: ENO, JUB, ASI
- **Impact:** Semantic search includes Ethiopian texts

### Fix 9: Language CSS mapping — Ge'ez font application
- **File:** Wherever `getLanguageClass()` is defined (ManuscriptViewer or shared util)
- **Change:** Add `case 'geez': return 'geez-text'`
- **Impact:** Ge'ez text renders with Noto Serif Ethiopic

### Fix 10: Restoration API — Ge'ez bypass
- **File:** `frontend/src/api/restoration.js`
- **Change:** Add geez language case that returns text unmodified (Ge'ez already preserves divine names)

## Sprint 3: Optimize (Medium — Performance + polish)

### Fix 11: ThematicDiscovery — Reduce ML overhead
- Increase verse pool or switch to keyword-based matching as fallback
- Add caching for embeddings

### Fix 12: Timeline — Parallel verse loading
- Replace sequential await with Promise.all()
- Fix fake chronological timestamps

### Fix 13: ManuscriptCarousel — Ge'ez title handling
- Add geez to language display labels
- Skip title detection for non-English manuscripts

### Fix 14: InterlinearViewer — Graceful EOTC handling
- Show informative message instead of empty state for manuscripts without alignment data

## Files Modified (Summary)

| Sprint | Files | Changes |
|--------|-------|---------|
| 1 | 6 files | Add EOTC manuscripts, books, tiers, book codes |
| 2 | 5 files | Dark theme fixes, font mapping, sample data |
| 3 | 4 files | Performance, error handling, polish |

## Success Criteria

- All 7 EOTC books navigable from BookSelector
- All 4 EOTC manuscripts selectable in ManuscriptViewer
- Ge'ez text renders with Noto Serif Ethiopic font
- No white backgrounds in dark glass theme components
- Network graph and timeline handle EOTC books without errors
- Build passes without new warnings
