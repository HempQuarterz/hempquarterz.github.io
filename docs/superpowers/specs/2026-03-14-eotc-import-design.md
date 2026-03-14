# EOTC Canon Import — Design Specification

**Date:** 2026-03-14
**Status:** Approved
**Scope:** Import Ethiopian Orthodox Tewahedo Church canon texts into All4Yah database

## Overview

Add 5 Ethiopian texts to the All4Yah database across 3 phases, plus Ge'ez language support. This closes the gap between our 90-book catalog and the EOTC's 81-book canon by importing verse data for texts we've catalogued but never populated, and adding the Ascension of Isaiah which was missing entirely.

## Phase A — Structured Data Import (Ready Now)

### A1: 1 Enoch (1,048 verses, 108 chapters)
- **Source:** `scrollmapper/bible_databases_deuterocanonical` GitHub repo
- **File:** `sources/en/1-enoch/1-enoch.json`
- **License:** Public Domain (R.H. Charles 1912 translation)
- **Format:** JSON with `books[].chapters[].verses[]` structure containing `chapter`, `verse`, `text` fields
- **Manuscript entry:** Create new manuscript `CHARLES` (R.H. Charles Translations), language: `english`, or reuse `WEB` manuscript pattern
- **Book code:** `ENO` (already exists in `canonical_books` as "1 Enoch (Ethiopic Enoch)", tier 2)
- **Import script:** `database/import-enoch.js`
- **Approach:** Download JSON, iterate chapters/verses, batch insert to `verses` table with manuscript_id

### A2: Jubilees (50 chapters)
- **Source:** Sefaria API — `https://www.sefaria.org/api/v3/texts/Book_of_Jubilees.{chapter}`
- **License:** Public Domain (R.H. Charles 1917 translation)
- **Format:** JSON API response with verse-by-verse text, no API key required
- **Book code:** `JUB` (already exists in `canonical_books`, tier 2)
- **Import script:** `database/import-jubilees.js`
- **Approach:** Fetch each chapter via API, parse verses, batch insert

### A3: Ascension of Isaiah (~296 verses, 11 chapters)
- **Source:** `scrollmapper/bible_databases_deuterocanonical` GitHub repo or earlychristianwritings.com
- **License:** Public Domain (R.H. Charles 1900 translation)
- **Book code:** `ASI` (NEW — must be added to `canonical_books`)
- **Import script:** `database/import-ascension-isaiah.js`
- **Approach:** Download/parse structured data, batch insert

### A4: Add Ascension of Isaiah to canonical_books
- **book_code:** `ASI`
- **book_name:** `Ascension of Isaiah`
- **testament:** `Pseudepigrapha / Ethiopian Canon`
- **canonical_tier:** 2
- **canonical_status:** `deuterocanonical`
- **era:** `2nd century BCE - 2nd century CE (composite)`
- **language_origin:** `Hebrew/Greek (composite, preserved in Ge'ez)`
- **order_number:** After Jubilees (current max + 1)
- **notes:** `Composite text: Martyrdom of Isaiah (ch 1-5), Testament of Hezekiah (ch 3:13-4:22), Vision of Isaiah (ch 6-11). Complete text survives only in Ge'ez.`

### Manuscript Strategy
Create a single new manuscript entry for the R.H. Charles corpus:
- **code:** `CHARLES`
- **name:** `R.H. Charles Pseudepigrapha Translations`
- **language:** `english`
- **description:** `Public domain English translations of pseudepigraphal and deuterocanonical texts by R.H. Charles (1900-1917)`

This keeps 1 Enoch, Jubilees, and Ascension of Isaiah under one manuscript umbrella, consistent with how WEB covers all English canonical books.

## Phase B — HTML Scraping Import

### B5: Meqabyan 1-3 (67 chapters)
- **Source:** Wikisource — `en.wikisource.org/wiki/Translation:1_Meqabyan` (and 2_, 3_)
- **License:** CC-BY-SA (attribution + share-alike required)
- **Book codes:** `MEQ` already exists but may need splitting into `1MQ`, `2MQ`, `3MQ`
- **Import script:** `database/import-meqabyan.js`
- **Approach:** Fetch HTML pages, parse chapter/verse structure, batch insert
- **Challenge:** Verse numbering may need manual assignment if source uses paragraph format
- **Attribution:** Must store CC-BY-SA attribution in manuscript notes

### B6: Kebra Nagast (117 chapters, prose)
- **Source:** sacred-texts.com/afr/kn/ (one HTML page per chapter, `kn009.htm` - `kn125.htm`)
- **License:** Public Domain (E.A. Wallis Budge 1922 translation)
- **Book code:** `KNG` (already exists, tier 4 "Ethiopian Heritage")
- **Import script:** `database/import-kebra-nagast.js`
- **Approach:** Fetch each chapter page, extract text, store as verse 1 per chapter (prose text has no verse divisions)
- **Schema note:** Each chapter stored as a single verse entry. Chapter-level granularity is appropriate for this narrative text.

### B7: Ge'ez Font Support
- **Font:** Noto Serif Ethiopic (Google Fonts CDN, SIL OFL license)
- **Fallback:** Abyssinica SIL (Google Fonts CDN)
- **CSS addition** in `frontend/src/styles/modern.css`:
  ```css
  @import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Ethiopic:wght@400;700&display=swap');
  ```
- **Component class:** `.geez-text` with `font-family: 'Noto Serif Ethiopic', serif; direction: ltr; line-height: 1.6;`
- **No BiDi needed:** Ge'ez is left-to-right (unlike Hebrew)

## Phase C — Ge'ez Text Import

### C8: Jubilees in Ge'ez
- **Sources:**
  - Open Siddur Project (CC-BY-SA) — HTML with Ge'ez Unicode
  - HenokB/AGE-Dataset (GitHub) — `Kufale.json` with Ge'ez-English parallel sentences
- **Manuscript entry:** New manuscript `GEEZ` (Ge'ez Biblical Texts), language: `geez`
- **Challenge:** Sentence alignment in AGE-Dataset may not match traditional verse numbering

### C9: 1 Enoch in Ge'ez (partial)
- **Source:** Online Critical Pseudepigrapha `1En.xml` (GitHub, GPL 3.0)
- **Content:** TEI-XML with Ge'ez Unicode from Rylands MS 23
- **Challenge:** Partial coverage, requires XML parsing and filtering

### C10: Full Ge'ez Bible Verification
- **Action:** Check BibleNLP/eBible corpus for `gez-*.txt` files
- **Action:** Contact Ran HaCohen (Tel Aviv University) regarding noncommercial use permission
- **Action:** Explore Beta Masaheft API for manuscript transcriptions

## Database Schema Impact

No schema changes required. All data fits existing tables:
- `manuscripts` — 1-2 new entries (CHARLES, optionally GEEZ)
- `canonical_books` — 1 new entry (ASI)
- `verses` — New verse rows for all imported texts

Meqabyan may need the existing single `MEQ` book split into `1MQ`/`2MQ`/`3MQ`, similar to how Maccabees uses `1MA`/`2MA`/`3MA`/`4MA`.

## PostgreSQL/Supabase Considerations for Ge'ez

- UTF-8 handles Ge'ez natively (3 bytes per character)
- Collation: `am-x-icu` (Amharic ICU locale covers Ge'ez character set)
- Full-text search: Use `simple` dictionary (no Ge'ez-specific config exists)
- Trigram indexing (`pg_trgm`) works for fuzzy Ge'ez search

## Success Criteria

- All Phase A texts imported with correct book/chapter/verse structure
- Verse counts verified against source data
- Frontend displays Ethiopian texts correctly in ManuscriptViewer
- Ge'ez font renders properly when Phase C texts are added
- All licensing documented in manuscript entries

## Sources

### 1 Enoch
- scrollmapper GitHub: https://github.com/scrollmapper/bible_databases_deuterocanonical
- Project Gutenberg #77935: https://www.gutenberg.org/ebooks/77935

### Jubilees
- Sefaria API: https://www.sefaria.org/api/v3/texts/Book_of_Jubilees.{chapter}
- Sacred-Texts: https://sacred-texts.com/bib/jub/index.htm

### Ascension of Isaiah
- EarlyChristianWritings: https://www.earlychristianwritings.com/text/ascension.html
- Archive.org: https://archive.org/details/cu31924014590529

### Meqabyan
- Wikisource: https://en.wikisource.org/wiki/Translation:1_Meqabyan

### Kebra Nagast
- Sacred Texts: https://sacred-texts.com/afr/kn/index.htm

### Ge'ez
- Open Siddur Jubilees: https://opensiddur.org/readings-and-sourcetexts/festival-and-fast-day-readings/jewish-readings/shavuot-readings/sefer-hayovelim-jubilees-preserved-in-geez/
- AGE-Dataset: https://github.com/HenokB/AGE-Dataset
- Online Critical Pseudepigrapha: https://github.com/OnlineCriticalPseudepigrapha/Online-Critical-Pseudepigrapha
- Ran HaCohen (TAU): https://www.tau.ac.il/~hacohen/Biblia.html
- BibleNLP/eBible: https://github.com/BibleNLP/ebible
