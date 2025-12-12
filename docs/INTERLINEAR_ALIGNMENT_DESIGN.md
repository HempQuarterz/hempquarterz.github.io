# Interlinear Alignment Design

## Overview

The Interlinear Alignment feature will provide **word-by-word** alignment across manuscripts in different languages (Greek, Hebrew, English), enabling scholars to see the direct correspondence between original-language texts and translations.

## Use Cases

1. **Cross-Manuscript Study**: Compare how a Hebrew word (e.g., יהוה) is rendered in Greek (κύριος) and English ("LORD")
2. **Etymology Research**: Trace divine names across language boundaries
3. **Translation Verification**: Validate English translations against Hebrew/Greek source texts
4. **Educational Tool**: Help students learn original languages by showing word-for-word correspondence

## Database Schema

### Table: `word_alignments`

```sql
CREATE TABLE word_alignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source verse (primary manuscript, usually Hebrew OT or Greek NT)
  source_manuscript_id UUID REFERENCES manuscripts(id) NOT NULL,
  source_book VARCHAR(10) NOT NULL,
  source_chapter INTEGER NOT NULL,
  source_verse INTEGER NOT NULL,
  source_word_position INTEGER NOT NULL,  -- Word index within verse (0-based)
  source_word TEXT NOT NULL,              -- Original word (Hebrew/Greek)
  source_lemma TEXT,                      -- Dictionary form (e.g., λόγος → λέγω)
  source_strongs VARCHAR(20),             -- Strong's number (e.g., H3068, G2316)
  source_morphology JSONB,                -- Detailed parsing (tense, mood, case, etc.)

  -- Target verse (translation/parallel manuscript)
  target_manuscript_id UUID REFERENCES manuscripts(id) NOT NULL,
  target_book VARCHAR(10) NOT NULL,
  target_chapter INTEGER NOT NULL,
  target_verse INTEGER NOT NULL,
  target_word_position INTEGER NOT NULL,  -- Word index within target verse
  target_word TEXT NOT NULL,              -- Translated/parallel word
  target_lemma TEXT,                      -- Dictionary form if applicable
  target_strongs VARCHAR(20),             -- Strong's number if available

  -- Alignment metadata
  alignment_confidence DECIMAL(3,2),      -- 0.00-1.00 (manual = 1.0, auto = varies)
  alignment_type VARCHAR(20),             -- 'one-to-one', 'one-to-many', 'many-to-one', 'phrase'
  alignment_method VARCHAR(20),           -- 'manual', 'strongs', 'lexical', 'statistical'
  notes TEXT,                             -- Optional scholarly notes

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Indexes for fast lookups
  CONSTRAINT word_alignments_source UNIQUE (source_manuscript_id, source_book, source_chapter, source_verse, source_word_position),
  INDEX idx_word_alignments_source (source_manuscript_id, source_book, source_chapter, source_verse),
  INDEX idx_word_alignments_target (target_manuscript_id, target_book, target_chapter, target_verse),
  INDEX idx_word_alignments_strongs_source (source_strongs),
  INDEX idx_word_alignments_strongs_target (target_strongs)
);
```

## Example Alignment: Genesis 1:1

### Source (Hebrew WLC)
```
Position | Word      | Strongs | Morphology
---------|-----------|---------|------------
0        | בְּרֵאשִׁית | H7225  | Ncfsa (noun, common, feminine, singular, absolute)
1        | בָּרָא    | H1254  | Vqp3ms (verb, qal, perfect, 3rd, masculine, singular)
2        | אֱלֹהִים   | H430   | Ncmpa (noun, common, masculine, plural, absolute)
3        | אֵת       | H853   | To (particle, accusative marker)
4        | הַשָּׁמַיִם | H8064  | Td:Ncmpa (article + noun, plural)
5        | וְאֵת     | H853   | C:To (conjunction + particle)
6        | הָאָרֶץ    | H776   | Td:Ncfsa (article + noun, singular)
```

### Target (English WEB)
```
Position | Word      | Strongs | Aligned To (Hebrew Position)
---------|-----------|---------|-----------------------------
0        | In        | -       | 0 (בְּרֵאשִׁית)
1        | the       | -       | 0 (בְּרֵאשִׁית)
2        | beginning | -       | 0 (בְּרֵאשִׁית)
3        | God       | H430    | 2 (אֱלֹהִים)
4        | created   | H1254   | 1 (בָּרָא)
5        | the       | -       | 3,4 (אֵת הַשָּׁמַיִם)
6        | heavens   | H8064   | 4 (הַשָּׁמַיִם)
7        | and       | -       | 5 (וְאֵת)
8        | the       | -       | 5,6 (וְאֵת הָאָרֶץ)
9        | earth     | H776    | 6 (הָאָרֶץ)
```

### Word Alignment Records

```json
[
  {
    "source": {
      "manuscript": "WLC",
      "book": "GEN",
      "chapter": 1,
      "verse": 1,
      "position": 0,
      "word": "בְּרֵאשִׁית",
      "strongs": "H7225",
      "morphology": {"pos": "noun", "gender": "f", "number": "s"}
    },
    "target": {
      "manuscript": "WEB",
      "book": "GEN",
      "chapter": 1,
      "verse": 1,
      "positions": [0, 1, 2],  // "In the beginning"
      "words": ["In", "the", "beginning"]
    },
    "alignment_type": "one-to-many",
    "alignment_method": "strongs",
    "confidence": 1.0
  },
  {
    "source": {
      "manuscript": "WLC",
      "position": 2,
      "word": "אֱלֹהִים",
      "strongs": "H430"
    },
    "target": {
      "manuscript": "WEB",
      "position": 3,
      "word": "God"
    },
    "alignment_type": "one-to-one",
    "alignment_method": "strongs",
    "confidence": 1.0
  }
]
```

## Alignment Methods

### 1. **Strong's Number Matching** (Primary)
- Use existing morphology data in WLC and SBLGNT
- Match words via Strong's concordance numbers
- High confidence (0.9-1.0) for exact matches

### 2. **Lexical Matching**
- Use lemma forms (dictionary headwords)
- Match Hebrew לֵב (leb) to Greek καρδία (kardia) to English "heart"
- Medium confidence (0.7-0.9)

### 3. **Statistical Alignment**
- Use parallel corpus algorithms (IBM Model 1/2, FastAlign)
- Train on existing aligned texts
- Lower confidence (0.5-0.7), requires manual verification

### 4. **Manual Curation**
- Gold standard alignments by biblical scholars
- Highest confidence (1.0)
- Used for training and validation

## Implementation Phases

### Phase 1: Strong's-Based Alignment ✅ **START HERE**
1. Extract morphology data from existing verses (WLC, SBLGNT)
2. Create alignment records for verses where Strong's numbers match
3. Example: Hebrew H3068 (יהוה) → English "LORD" (tagged with H3068)

### Phase 2: Lexical Expansion
1. Build Hebrew-Greek-English lexicon from Strong's database
2. Add synonym mappings (e.g., H430 אלהים ≈ G2316 θεός)
3. Expand alignment coverage beyond exact Strong's matches

### Phase 3: Statistical Auto-Alignment
1. Implement FastAlign or GIZA++ for unaligned verses
2. Train on manually-aligned gold standard corpus
3. Generate candidate alignments for human review

### Phase 4: Manual Curation Tools
1. Build admin interface for alignment review/editing
2. Allow community contributions with moderation
3. Implement alignment validation workflows

## Frontend Display

### Interlinear View Layout

```
┌──────────────────────────────────────────────────────────┐
│  Genesis 1:1 - Interlinear View                         │
├──────────────────────────────────────────────────────────┤
│                                                           │
│  Hebrew (WLC)    בְּרֵאשִׁית  בָּרָא   אֱלֹהִים   אֵת  │
│  Strong's        H7225      H1254   H430      H853    │
│  Morphology      Ncfsa      Vqp3ms  Ncmpa     To      │
│                  ──┬──      ──┬──   ──┬──     ─┬─     │
│                    │          │        │         │       │
│  English (WEB)   In the     created   God     [obj]   │
│                  beginning                           │
│                                                           │
│  Restored        In the     created  Elohim  [obj]   │
│                  beginning                           │
└──────────────────────────────────────────────────────────┘
```

### Features
- **Hover**: Show Strong's definition and morphology details
- **Click**: Highlight all instances of this word in verse
- **Toggle**: Switch between original and restored divine names
- **Color Coding**:
  - Hebrew text: Blue
  - Greek text: Green
  - Restored names: Gold
  - Alignment confidence: Opacity (100% = high, 50% = low)

## Data Sources for Initial Alignment

### Strong's-Tagged Texts (Already Available)
1. **WLC** (Hebrew OT) - Has Strong's numbers in morphology
2. **SBLGNT** (Greek NT) - Has Strong's numbers via MorphGNT
3. **WEB** (English) - Can be tagged via cross-reference to WLC/SBLGNT

### Additional Resources (To Import)
1. **Open Scriptures Hebrew Bible (OSHB)** - Strong's + morphology
2. **OpenGNT** - Greek NT with Strong's and morphology
3. **NET Bible Notes** - Cross-references for difficult alignments

## Performance Considerations

### Optimization Strategies
1. **Pre-compute alignments**: Generate at import time, not query time
2. **Cache common verses**: Genesis 1:1, John 3:16, etc.
3. **Lazy loading**: Only load alignment data when interlinear view is activated
4. **Indexed lookups**: Use verse + manuscript ID for fast retrieval

### Storage Estimates
- **Per verse alignment**: ~500 bytes average (JSON)
- **Genesis 1:1** (7 Hebrew words → 10 English words): ~3.5KB
- **Entire OT** (23,145 verses × 15 words avg × 500 bytes): **~173 MB**
- **Entire NT** (7,957 verses × 12 words avg × 500 bytes): **~48 MB**
- **Total**: ~220 MB for complete Hebrew + Greek + English alignment

## Success Metrics

1. **Coverage**: % of verses with complete word-level alignment
   - **Target**: 90% coverage for canonical books
2. **Confidence**: Average alignment confidence score
   - **Target**: 0.85+ average confidence
3. **Accuracy**: % of manually-verified alignments that are correct
   - **Target**: 95%+ accuracy
4. **Performance**: Average load time for interlinear view
   - **Target**: <500ms for typical verse

## Next Steps

### Immediate (Current Session)
1. ✅ Design schema (this document)
2. Create SQL migration for `word_alignments` table
3. Write import script for WLC → WEB alignment (Genesis 1 as POC)
4. Test alignment data quality

### Short-term (Next Session)
1. Implement frontend interlinear component
2. Add hover tooltips with Strong's definitions
3. Integrate with existing restoration system
4. Deploy to production

### Long-term (Future Phases)
1. Expand to full OT alignment (WLC → WEB)
2. Add Greek NT alignment (SBLGNT → WEB)
3. Implement alignment confidence indicators
4. Build alignment editor for manual curation

---

**Document Status**: Draft (Phase 3, Session 1)
**Last Updated**: 2025-01-22
**Next Review**: After POC implementation
