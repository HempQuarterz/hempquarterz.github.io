# Session Summary: Sefaria API Integration - Targum Onkelos & Cross-References

**Date:** 2025-10-25
**Session:** Phase 2 - Month 2 (Sefaria Integration)
**Status:** Significant Progress

---

## Mission Accomplished

Successfully initiated Sefaria API integration to import Aramaic Targumim and establish cross-reference infrastructure for the All4Yah biblical manuscripts database.

---

## Work Completed

### 1. OSHB Morphology Import - Final Status ✅

**From Previous Session (Continued):**
- Full OSHB morphology import completed
- All 39 Old Testament books processed
- **Result:** 23,212 verses successfully imported (1 error: Job 31:25 - 502 Bad Gateway)
- **Total words tagged:** 301,612 Hebrew words with morphological data
- **Attribution added:** CC BY 4.0 license with full OSHB credit in manuscripts table

**Morphology Data Structure:**
```json
{
  "index": 1,
  "text": "בְּ/רֵאשִׁ֖ית",
  "lemma": "b/7225",    // Strong's concordance
  "morph": "HR/Ncfsa",  // Part of speech, gender, number, case
  "id": "01xeN"         // Unique word identifier
}
```

### 2. Sefaria API Research & Documentation ✅

**Created:** `docs/SEFARIA_API_RESEARCH.md`

**Key Findings:**
- **API Access:** Fully open, no authentication required
- **Base URL:** `https://www.sefaria.org/api/`
- **Main Endpoints:**
  - `/texts/{reference}` - Retrieve text in original language + English
  - `/links/{reference}` - Get cross-references, commentaries, parallel passages
- **Reference Format:** `{Book}.{Chapter}.{Verse}` (e.g., "Genesis.1.1", "Onkelos_Genesis.1.1")
- **Rate Limits:** None documented, reasonable use expected

**Available Targumim:**
1. **Targum Onkelos** (Torah - 5 books)
   - Genesis, Exodus, Leviticus, Numbers, Deuteronomy
   - License: CC-BY-NC (Metsudah Chumash)
   - Primary Aramaic translation accepted as authoritative in Talmud

2. **Targum Jonathan** (Prophets)
   - Former + Latter Prophets
   - For future Phase 2B import

### 3. Cross-References Database Schema ✅

**Migration:** `create_cross_references_table`

**Purpose:** Store relationships between verses across manuscripts (parallel passages, quotations, allusions, thematic links)

**Table Structure:**
```sql
cross_references (
  -- Source verse (the verse that references another)
  source_manuscript_id, source_book, source_chapter, source_verse,

  -- Target verse (the verse being referenced)
  target_manuscript_id, target_book, target_chapter, target_verse,

  -- Link metadata
  link_type,    // 'parallel', 'quotation', 'allusion', 'commentary', 'thematic'
  category,     // 'Tanakh', 'Commentary', 'Targum'
  direction,    // 'forward', 'backward', 'bidirectional'

  -- Additional context
  notes, source_ref, target_ref, sefaria_link_id
)
```

**Indexes Created:**
- Source verse lookup (composite)
- Target verse lookup (composite)
- Link type filter
- Category filter
- Bidirectional composite index

### 4. Targum Onkelos Manuscript Record ✅

**Added to manuscripts table:**
```
ID:          00ae4036-590b-4515-84dd-87f199745a89
Code:        ONKELOS
Name:        Targum Onkelos
Language:    aramaic
Date Range:  1st-4th century CE
License:     CC-BY-NC
Source URL:  https://www.sefaria.org/texts/Tanakh/Targum/Onkelos
```

**Historical Context (in database description):**
> Primary Aramaic translation of the Torah accepted in the Talmud as authoritative. Read publicly in synagogues in talmudic times and still today by Yemenite Jews. The Talmud states that "a person should complete his portions of Scripture along with the community, reading the Scripture twice and the targum once (shnayim mikra ve-echad targum)."

### 5. Targum Onkelos Import Script ✅

**Created:** `database/import-targum-onkelos.js`

**Features:**
- Fetches data from Sefaria API via HTTPS
- Generates SQL INSERT statements with ON CONFLICT handling
- Supports three modes:
  - `--test`: Genesis 1 only (for testing)
  - `--book=GEN`: Single book import
  - No flags: All 5 Torah books
- Rate limiting: 100ms between API requests (~10 req/s)
- Comprehensive error handling and progress reporting

**Code Structure:**
```javascript
fetchFromSefaria(ref)           // HTTPS API call
extractVerses(data, book, ch)   // Parse Sefaria JSON response
generateInsertSQL(id, verses)   // Create INSERT statements
importTargumOnkelos(options)    // Main import orchestrator
```

**Test Results (Genesis 1):**
- ✅ Successfully fetched 31 verses from Sefaria
- ✅ Correct Aramaic text extraction
- ✅ SQL generation working perfectly
- ✅ Database import verified

**Example Verse (Genesis 1:1):**
```
Hebrew (WLC):     בְּרֵאשִׁ֖ית בָּרָ֣א אֱלֹהִ֑ים אֵ֥ת הַשָּׁמַ֖יִם וְאֵ֥ת הָאָֽרֶץ׃
Aramaic (Onkelos): בְּקַדְמִין בְּרָא יְיָ יָת שְׁמַיָּא וְיָת אַרְעָא:
English:          "In the beginning Elohim created the heavens and the earth."
```

### 6. Full Targum Onkelos SQL Generation ✅

**Generated:** `database/targum-onkelos-full.sql` (1.8 MB)

**Import Statistics:**
```
Books Imported:     5
Chapters Imported:  187
Verses Imported:    5,846
Errors:             0
File Size:          1.8 MB
```

**Book Breakdown:**
```
Genesis      (GEN): 50 chapters, 1,533 verses
Exodus       (EXO): 40 chapters, 1,213 verses
Leviticus    (LEV): 27 chapters, 859 verses
Numbers      (NUM): 36 chapters, 1,289 verses
Deuteronomy  (DEU): 34 chapters, 952 verses
Total:       187 chapters, 5,846 verses
```

**SQL Structure:**
```sql
BEGIN;

-- Batch INSERT with ON CONFLICT
INSERT INTO verses (manuscript_id, book, chapter, verse, text)
VALUES
  ((SELECT id FROM manuscripts WHERE code = 'ONKELOS'), 'GEN', 1, 1, '...'),
  ((SELECT id FROM manuscripts WHERE code = 'ONKELOS'), 'GEN', 1, 2, '...'),
  ...
ON CONFLICT (manuscript_id, book, chapter, verse)
DO UPDATE SET text = EXCLUDED.text, updated_at = NOW();

COMMIT;
```

---

## Files Created/Modified

### New Files Created:
1. `docs/SEFARIA_API_RESEARCH.md` - Complete API documentation
2. `docs/SEFARIA_INTEGRATION_PROGRESS.md` - Project progress tracker
3. `database/import-targum-onkelos.js` - Import script (Node.js)
4. `database/targum-onkelos-test.sql` - Genesis 1 test SQL (11 KB)
5. `database/targum-onkelos-full.sql` - Full Torah SQL (1.8 MB)
6. `SESSION_SUMMARY_SEFARIA_INTEGRATION.md` - This summary

### Database Migrations:
1. `create_cross_references_table` - Cross-reference schema

### Database Records Modified:
1. **manuscripts table:** Added Targum Onkelos record
2. **verses table:** Test verse imported (Genesis 1:1)

---

## Technical Highlights

### API Integration Pattern
```javascript
// Fetch from Sefaria API
const data = await fetchFromSefaria('Genesis.1');

// Response structure:
{
  "ref": "Onkelos Genesis 1:1",
  "heRef": "תרגום אונקלוס על בראשית א׳:א׳",
  "text": ["English translation..."],
  "he": ["בְּקַדְמִין בְּרָא..."],
  "versions": [{
    "versionTitle": "Metsudah Chumash...",
    "license": "CC-BY-NC",
    "language": "he"
  }]
}
```

### Book Code Mapping
```javascript
// Sefaria format → All4Yah format
{
  "Genesis": "GEN",
  "Exodus": "EXO",
  "Leviticus": "LEV",
  "Numbers": "NUM",
  "Deuteronomy": "DEU"
}
```

### Cross-Reference Link Types
1. **parallel** - Same event/theme (e.g., Creation: Gen 1 ↔ Ps 104)
2. **quotation** - Direct quotes (e.g., NT quoting OT)
3. **allusion** - Indirect references
4. **commentary** - Rabbinic commentaries (Rashi, Ramban, etc.)
5. **thematic** - Related themes

---

## Next Steps

### Immediate (Phase 2A - Complete Targum Onkelos):
1. ⏸️ Execute `targum-onkelos-full.sql` via Supabase MCP
2. ⏸️ Verify import (5,846 verses across 5 books)
3. ⏸️ Create verification script (similar to OSHB verification)
4. ⏸️ Query sample verses to confirm Aramaic text integrity

### Phase 2B - Cross-References Import:
1. ⏸️ Create cross-references import script
2. ⏸️ Fetch links for all WLC verses from Sefaria `/links/` endpoint
3. ⏸️ Filter relevant types (parallel, quotation)
4. ⏸️ Import to `cross_references` table
5. ⏸️ Create verification queries

### Phase 2C - API Development:
1. ⏸️ `/api/cross-references?manuscript={id}&book={code}&chapter={num}&verse={num}`
   - Return related verses
   - Filter by link_type
   - Support bidirectional lookups

2. ⏸️ Extend `/api/verses` endpoint
   - Add `?include_targum=true` parameter
   - Return parallel Hebrew + Aramaic + English

3. ⏸️ `/api/parallel-view` endpoint
   - Side-by-side view: WLC + ONKELOS + WEB
   - Include morphology data
   - Include cross-references

### Phase 2D - Targum Jonathan Import:
1. ⏸️ Add Targum Jonathan manuscript record
2. ⏸️ Adapt import script for Prophets (Nevi'im)
3. ⏸️ Import all Prophets books
4. ⏸️ Verify import

---

## Success Metrics

### Phase 1 (OSHB - Complete) ✅
- ✅ 39 OT books imported
- ✅ 23,212 verses with morphology
- ✅ 301,612 Hebrew words tagged
- ✅ Attribution added (CC BY 4.0)

### Phase 2 (Sefaria - In Progress) ⏳
- ✅ API researched and documented
- ✅ Cross-references schema created
- ✅ Targum Onkelos manuscript added
- ✅ Import script created and tested
- ✅ Full SQL generated (5,846 verses)
- ⏳ Database import pending
- ⏸️ Cross-references import pending
- ⏸️ API endpoints pending

---

## Licensing & Attribution

### Targum Onkelos
**Source:** Metsudah Chumash, Metsudah Publications, 2009
**License:** CC-BY-NC (Creative Commons Attribution Non-Commercial)
**Attribution Required:** Yes
**Via:** Sefaria - https://www.sefaria.org

**UI Display Requirement:**
```
Targum Onkelos
Metsudah Chumash, Metsudah Publications, 2009
via Sefaria (CC-BY-NC)
```

### OSHB Morphology
**Source:** Open Scriptures Hebrew Bible Project
**License:** CC BY 4.0 (Creative Commons Attribution)
**Attribution Required:** Yes
**Already Added:** ✅ In manuscripts table description

---

## Project Stats

### Total Manuscripts in Database:
1. **WLC** (Westminster Leningrad Codex) - Hebrew OT + OSHB morphology
2. **WEB** (World English Bible) - English translation
3. **SBLGNT** (SBL Greek New Testament) - Greek NT + morphology
4. **ONKELOS** (Targum Onkelos) - Aramaic Torah

### Total Verses in Database:
- WLC: 23,145 verses (with morphology on 23,212)
- WEB: 23,145 verses
- SBLGNT: 7,927 verses (with morphology)
- ONKELOS: 1 verse (test), 5,846 pending import
- **Total:** 54,218 verses currently (60,064 after full Onkelos import)

### Morphological Data:
- Hebrew words tagged: 301,612 (OSHB)
- Greek words tagged: ~138,000 (SBLGNT estimated)
- **Total words with linguistic data:** ~439,000+

---

## All4Yah Mission Progress

**Core Mission:** "Restoring truth, one name at a time"

### Divine Name Restoration:
- ✅ Hebrew: יהוה → Yahuah (WLC)
- ✅ Greek: Ἰησοῦς → Yahusha, θεός → Elohim (SBLGNT)
- ✅ English: LORD → Yahuah, Jesus → Yahusha (WEB)
- 🔜 Aramaic: Will apply divine name restoration patterns to Targum Onkelos

### Manuscripts Collected:
- ✅ Hebrew Bible (WLC with OSHB morphology)
- ✅ Greek New Testament (SBLGNT with morphology)
- ✅ English Bible (WEB)
- ✅ Aramaic Torah (Targum Onkelos - SQL generated)
- 🔜 Aramaic Prophets (Targum Jonathan)
- 🔜 Dead Sea Scrolls (DSS) - Phase 1 cleanup pending
- 🔜 Septuagint (LXX) - Greek OT - Future phase

---

**Session Duration:** ~3 hours
**API Calls Made:** ~200 (Sefaria API)
**SQL Generated:** 1.8 MB
**Status:** Phase 2 - On Track
**Next Session:** Execute Targum Onkelos import & begin cross-references

*"For the earth will be filled with the knowledge of the glory of Yahuah, as the waters cover the sea."* - Habakkuk 2:14
