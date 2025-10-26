# Sefaria Integration Progress - All4Yah Phase 2

## Overview

Successfully initiated Sefaria API integration for importing Aramaic Targumim and cross-reference data into the All4Yah database. This enhances the biblical manuscripts collection with ancient Aramaic translations and enables cross-referencing between parallel passages.

## Completed Work (2025-10-25)

### 1. API Research & Documentation ✅

**File:** `docs/SEFARIA_API_RESEARCH.md`

**Findings:**
- Sefaria API is fully open (no authentication required)
- Base URL: `https://www.sefaria.org/api/`
- Main endpoints:
  - `/texts/{reference}` - Retrieve biblical texts
  - `/links/{reference}` - Get cross-references/links
- Reference format: `{Book}.{Chapter}.{Verse}` (e.g., "Genesis.1.1")
- Response includes both original language and English translation
- Each text version has licensing metadata (varies by source)

**Available Targumim:**
- **Targum Onkelos** (Torah - 5 books)
  - Books: Genesis, Exodus, Leviticus, Numbers, Deuteronomy
  - License: CC-BY-NC (Metsudah Chumash version)
  - Language: Aramaic with English translation

- **Targum Jonathan** (Prophets)
  - Former Prophets: Joshua, Judges, 1-2 Samuel, 1-2 Kings
  - Latter Prophets: Isaiah, Jeremiah, Ezekiel, Minor Prophets

### 2. Database Schema ✅

**Migration:** `create_cross_references_table`

**Created Table:** `cross_references`

**Purpose:** Store relationships between verses across manuscripts

**Schema:**
```sql
CREATE TABLE cross_references (
  id UUID PRIMARY KEY,

  -- Source verse
  source_manuscript_id UUID REFERENCES manuscripts(id),
  source_book VARCHAR(50),
  source_chapter INTEGER,
  source_verse INTEGER,

  -- Target verse
  target_manuscript_id UUID REFERENCES manuscripts(id),
  target_book VARCHAR(50),
  target_chapter INTEGER,
  target_verse INTEGER,

  -- Link metadata
  link_type VARCHAR(50), -- 'parallel', 'quotation', 'allusion', 'commentary', 'thematic'
  category VARCHAR(100), -- 'Tanakh', 'Commentary', 'Targum'
  direction VARCHAR(20), -- 'forward', 'backward', 'bidirectional'

  -- Additional context
  notes TEXT,
  source_ref VARCHAR(200), -- Sefaria reference format
  target_ref VARCHAR(200),
  sefaria_link_id VARCHAR(100),

  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
);
```

**Indexes:**
- Source verse lookup: `(source_manuscript_id, source_book, source_chapter, source_verse)`
- Target verse lookup: `(target_manuscript_id, target_book, target_chapter, target_verse)`
- Link type filter: `(link_type)`
- Category filter: `(category)`
- Bidirectional composite index for efficient lookups

### 3. Targum Onkelos Manuscript ✅

**Added to manuscripts table:**
```
Code: ONKELOS
Name: Targum Onkelos
Language: aramaic
Date Range: 1st-4th century CE
License: CC-BY-NC
Source: https://www.sefaria.org/texts/Tanakh/Targum/Onkelos
```

**Description:**
> Primary Aramaic translation of the Torah accepted in the Talmud as authoritative. Read publicly in synagogues in talmudic times and still today by Yemenite Jews. The Talmud states that "a person should complete his portions of Scripture along with the community, reading the Scripture twice and the targum once (shnayim mikra ve-echad targum)."

### 4. Import Script ✅

**File:** `database/import-targum-onkelos.js`

**Features:**
- Fetches Targum Onkelos from Sefaria API
- Supports test mode (`--test`) for Genesis 1 only
- Supports single book import (`--book=GEN`)
- Generates SQL INSERT statements
- Includes ON CONFLICT handling for re-imports
- Rate limiting (100ms between API requests)
- Comprehensive error handling

**Usage:**
```bash
# Test with Genesis 1
node database/import-targum-onkelos.js --test > targum-onkelos-test.sql

# Import specific book
node database/import-targum-onkelos.js --book=GEN > targum-onkelos-genesis.sql

# Import all 5 Torah books
node database/import-targum-onkelos.js > targum-onkelos-full.sql
```

**Test Results (Genesis 1):**
- ✅ Successfully fetched 31 verses
- ✅ Correct Aramaic text extraction
- ✅ SQL generation working
- ✅ Database import verified

## In Progress

### 5. Full Targum Onkelos Import ⏳

**Status:** Generating SQL for all 5 Torah books

**Expected Output:**
- Total books: 5 (Genesis, Exodus, Leviticus, Numbers, Deuteronomy)
- Total chapters: 187 (50+40+27+36+34)
- Estimated verses: ~5,850 verses
- File: `database/targum-onkelos-full.sql`

**Book Breakdown:**
```
Genesis      (GEN): 50 chapters, ~1,533 verses
Exodus       (EXO): 40 chapters, ~1,213 verses
Leviticus    (LEV): 27 chapters, ~859 verses
Numbers      (NUM): 36 chapters, ~1,289 verses
Deuteronomy  (DEU): 34 chapters, ~959 verses
```

## Next Steps

### Phase 2A: Complete Targum Onkelos Import

1. ✅ Generate full SQL for all 5 Torah books (in progress)
2. ⏸️ Execute SQL import via Supabase MCP
3. ⏸️ Verify verse counts and data integrity
4. ⏸️ Create verification script similar to OSHB verification

### Phase 2B: Cross-References Import

1. ⏸️ Create cross-references import script
2. ⏸️ Fetch links for all WLC verses from Sefaria
3. ⏸️ Filter relevant link types (parallel passages, quotations)
4. ⏸️ Import to `cross_references` table
5. ⏸️ Create verification queries

### Phase 2C: API Development

1. ⏸️ Create `/api/cross-references` endpoint
   - Get cross-references for a specific verse
   - Support bidirectional lookups
   - Filter by link type and category

2. ⏸️ Extend `/api/verses` endpoint
   - Include Targum Onkelos in parallel view
   - Add optional `?include_targum=true` parameter

3. ⏸️ Create `/api/parallel-view` endpoint
   - Return Hebrew (WLC) + Aramaic (Onkelos) + English (WEB) side-by-side
   - Support morphology display
   - Include cross-references

### Phase 2D: Targum Jonathan Import

1. ⏸️ Add Targum Jonathan manuscript record
2. ⏸️ Adapt import script for Prophets (Nevi'im)
3. ⏸️ Import all books of Prophets
4. ⏸️ Verify import

## Technical Notes

### API Rate Limiting

Current implementation: 100ms delay between requests
- ~10 requests/second
- Full Torah import: ~187 chapters = ~18.7 seconds minimum
- Well within reasonable API usage

### Data Licensing

**Important:** Targum Onkelos uses CC-BY-NC license
- **NC (Non-Commercial)** restriction
- Attribution required: "Metsudah Chumash, Metsudah Publications, 2009"
- Source attribution: "via Sefaria - https://www.sefaria.org"
- Must display in UI alongside text

### Book Code Mapping

Sefaria → All4Yah conversion:
```javascript
{
  "Genesis": "GEN",
  "Exodus": "EXO",
  "Leviticus": "LEV",
  "Numbers": "NUM",
  "Deuteronomy": "DEU"
  // ... etc for all books
}
```

### Cross-Reference Link Types

Based on Sefaria API response analysis:

1. **Commentary** - Rabbinic commentaries on verses
   - Rashi, Ramban, Rashbam, Ibn Ezra, etc.
   - NOT importing to cross_references (commentary-specific table future)

2. **Parallel** - Same event/theme in different books
   - Example: Creation account (Genesis 1 ↔ Psalms 104)
   - **PRIORITY** for import

3. **Quotation** - Direct quotes between texts
   - Example: NT quoting OT, Prophets quoting Torah
   - **PRIORITY** for import

4. **Reference** - General thematic connections
   - Lower priority, may import selectively

## Success Metrics

### Completed ✅
- ✅ Sefaria API fully researched and documented
- ✅ Cross-references database schema created
- ✅ Targum Onkelos manuscript added to database
- ✅ Import script created and tested
- ✅ Test import verified (Genesis 1:1)

### In Progress ⏳
- ⏳ Full Targum Onkelos SQL generation
- ⏳ Full import to database

### Pending ⏸️
- Cross-references import
- API endpoint development
- Targum Jonathan import
- UI integration for parallel view

---

**Last Updated:** 2025-10-25
**Phase:** 2 - Month 2 (Sefaria Integration)
**Status:** On Track
