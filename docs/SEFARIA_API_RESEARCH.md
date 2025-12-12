# Sefaria API Research - All4Yah Integration

## API Overview

**Base URL:** `https://www.sefaria.org/api/`
**Authentication:** None required - fully open API
**Rate Limits:** Not documented, appears unlimited for reasonable use
**License:** Varies by text (check individual text licenses)

## Available Endpoints

### 1. Text Retrieval API
**Endpoint:** `/api/texts/{reference}`

**Example:** `https://www.sefaria.org/api/texts/Onkelos_Genesis.1.1`

**Returns:**
- `ref`: Standardized reference (e.g., "Onkelos Genesis 1:1")
- `heRef`: Hebrew reference
- `text`: Array of English text (one entry per verse)
- `he`: Array of Hebrew/Aramaic text
- `versions`: Array of available text versions with metadata
  - `language`: "en" or "he"
  - `versionTitle`: Version name
  - `versionSource`: Source URL
  - `license`: License type (CC-BY-NC, CC-BY, etc.)

### 2. Cross-References/Links API
**Endpoint:** `/api/links/{reference}`

**Example:** `https://www.sefaria.org/api/links/Genesis.1.1`

**Returns:** Array of linked texts including:
- `type`: "commentary", "quotation", "reference"
- `category`: "Commentary", "Tanakh", etc.
- `ref`: Reference to linked text
- `anchorRef`: Reference to source verse
- `sourceRef`: Reference to the commentary/link source
- `collectiveTitle`: Title of the work

## Available Targumim

### Targum Onkelos (Torah - Genesis through Deuteronomy)
**Books Available:**
- `Onkelos_Genesis`
- `Onkelos_Exodus`
- `Onkelos_Leviticus`
- `Onkelos_Numbers`
- `Onkelos_Deuteronomy`

**Language:** Aramaic (with English translation)
**License:** CC-BY-NC (Metsudah Chumash version)
**Chapters:** Matches Torah structure exactly

### Targum Jonathan (Prophets - Nevi'im)
**Books Available:**
- Former Prophets: Joshua, Judges, 1&2 Samuel, 1&2 Kings
- Latter Prophets: Isaiah, Jeremiah, Ezekiel, Minor Prophets

**API Pattern:** `Targum_Jonathan_on_{book}`
**Example:** `https://www.sefaria.org/api/texts/Targum_Jonathan_on_Isaiah.1.1`

## Reference Format

Sefaria uses a standardized reference format:

**Pattern:** `{Book}.{Chapter}.{Verse}`

**Examples:**
- Torah: `Genesis.1.1`, `Exodus.20.1`
- Targum: `Onkelos_Genesis.1.1`
- Commentary: `Rashi_on_Genesis.1.1.1`

**Mapping to All4Yah Codes:**
```javascript
{
  "Genesis": "GEN",
  "Exodus": "EXO",
  "Leviticus": "LEV",
  // ... etc
}
```

## Cross-Reference Data Structure

Links endpoint returns relationships between texts:

**Commentary Links:**
```json
{
  "type": "commentary",
  "category": "Commentary",
  "ref": "Rashi on Genesis 1:1:1",
  "anchorRef": "Genesis 1:1",
  "collectiveTitle": {
    "en": "Rashi",
    "he": "רש\"י"
  }
}
```

**Parallel Passage Links:**
```json
{
  "type": "reference",
  "category": "Tanakh",
  "ref": "Psalms 104:5",
  "anchorRef": "Genesis 1:1"
}
```

## Import Strategy for All4Yah

### Phase 1: Targum Onkelos Import
1. **Manuscripts Table:** Add Targum Onkelos record
   - Code: `ONKELOS`
   - Name: `Targum Onkelos`
   - Language: `aramaic`
   - License: `CC-BY-NC`

2. **Verses Table:** Import all 5 books
   - Fetch each chapter via API
   - Map Sefaria book names to All4Yah codes
   - Store Aramaic text in `text` column
   - Store English translation in separate `translations` table (future)

3. **API Fetching Pattern:**
```javascript
// For each Torah book
const books = ['Genesis', 'Exodus', 'Leviticus', 'Numbers', 'Deuteronomy'];
for (const book of books) {
  const sefariaBook = `Onkelos_${book}`;

  // Get total chapters (use table of contents API)
  for (let chapter = 1; chapter <= totalChapters; chapter++) {
    const url = `https://www.sefaria.org/api/texts/${sefariaBook}.${chapter}`;
    // Fetch and parse
  }
}
```

### Phase 2: Cross-References Import
1. **Create `cross_references` table:**
```sql
CREATE TABLE cross_references (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  source_manuscript_id UUID REFERENCES manuscripts(id),
  source_book VARCHAR(50),
  source_chapter INTEGER,
  source_verse INTEGER,
  target_manuscript_id UUID REFERENCES manuscripts(id),
  target_book VARCHAR(50),
  target_chapter INTEGER,
  target_verse INTEGER,
  link_type VARCHAR(50), -- 'commentary', 'parallel', 'quotation'
  category VARCHAR(100),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

2. **Fetch Links:**
```javascript
// For each verse in WLC
const ref = `${sefariaBook}.${chapter}.${verse}`;
const links = await fetch(`https://www.sefaria.org/api/links/${ref}`);

// Filter for relevant links (parallel passages, quotations)
const parallels = links.filter(link =>
  link.type === 'reference' ||
  link.category === 'Tanakh'
);
```

### Phase 3: Targum Jonathan Import
Similar process to Onkelos but for Prophets (Nevi'im)

## Data Licensing

**Important:** Each text has its own license:
- Targum Onkelos (Metsudah): CC-BY-NC (non-commercial)
- Other texts: Varies (check `versions[].license`)

**Attribution Required:**
```
Source: Sefaria - https://www.sefaria.org
Text: [Version Title] - [License]
```

## Next Steps

1. ✅ Research Sefaria API structure
2. Create Targum Onkelos import script
3. Create cross-references database schema
4. Implement Targum Onkelos import
5. Implement cross-references import
6. Build API endpoints for All4Yah to serve cross-references

---

**Research Completed:** 2025-10-25
**API Version:** v3 (current)
**Documentation:** https://developers.sefaria.org
