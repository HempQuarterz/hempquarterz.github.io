# All4Yah Name Restoration Guide

Complete guide for the divine name restoration feature - the core mission of the All4Yah project.

## Overview

The All4Yah name restoration system automatically restores the original Hebrew divine names in Bible text, replacing traditional renderings with historically accurate pronunciations. This feature is based on:

- **Linguistic analysis** of original Hebrew texts
- **Strong's concordance** for precise word matching
- **Historical research** into ancient Hebrew pronunciation
- **Manuscript evidence** from the Westminster Leningrad Codex

## Core Restorations

| Original (Hebrew) | Traditional English | Restored | Strong's # | Meaning |
|-------------------|---------------------|----------|------------|---------|
| **יהוה** | LORD, Yahweh, Jehovah | **Yahuah** | H3068 | The personal name of the Creator |
| **יהושע** | Joshua, Jesus | **Yahusha** | H3091 (OT) / G2424 (NT) | "Yahuah saves" |
| **אלהים** | God | **Elohim** | H430 | Mighty One, Creator |

## Why Restoration Matters

### 1. Preserves the Original Name

The Hebrew name יהוה (YHWH) appears **5,518 times** in the Old Testament. Traditional translations replace it with "LORD" (all caps), which obscures the personal name of the Creator.

**Example - Psalm 23:1:**
- **Traditional**: "The LORD is my shepherd"
- **Restored**: "Yahuah is my shepherd"
- **Hebrew**: יהוה רעי (Yahuah roi)

### 2. Reveals Hidden Connections

Many names in Scripture contain the divine name:

- **יהושע** (Yahusha) = **Yahu** + **sha** (saves)
- **יהוחנן** (Yahuchanan / John) = **Yahu** + chanan (grace)
- **אליהו** (Eliyahu / Elijah) = Eli + **Yahu**

Restoration makes these connections visible to English readers.

### 3. Fulfills Scripture

*"This is my name forever, the name you shall call me from generation to generation."* - Exodus 3:15

## How It Works

### Method 1: Strong's Number Matching (Most Accurate)

The system uses Strong's concordance numbers to identify exact words in the original Hebrew:

```javascript
import { getRestoredVerse } from './api/verses';

const verse = await getRestoredVerse('WLC', 'PSA', 23, 1);

// Result:
// {
//   text: "מזמור ל/דוד Yahuah רע/י לא אחסר",
//   originalText: "מזמור ל/דוד יהוה רע/י לא אחסר",
//   restored: true,
//   restorations: [
//     {
//       original: "יהוה",
//       restored: "Yahuah",
//       strongNumber: "H3068",
//       count: 1
//     }
//   ]
// }
```

### Method 2: Pattern Matching (For English)

When Strong's numbers aren't available (English text), the system uses intelligent pattern matching:

```javascript
const verse = await getRestoredVerse('WEB', 'PSA', 23, 1);

// Original: "The LORD is my shepherd"
// Restored: "The Yahuah is my shepherd"
```

## API Functions

### Get Restored Verse

```javascript
import { getRestoredVerse } from './api/verses';

// Hebrew with restoration
const hebrew = await getRestoredVerse('WLC', 'GEN', 2, 4);

// English with restoration
const english = await getRestoredVerse('WEB', 'GEN', 2, 4);
```

### Get Restored Parallel Verse

```javascript
import { getRestoredParallelVerse } from './api/verses';

const parallel = await getRestoredParallelVerse('PSA', 23, 1);

console.log(parallel.hebrew.text);
// "מזמור ל/דוד Yahuah רע/י לא אחסר"

console.log(parallel.english.text);
// "A Psalm by David. Yahuah is my shepherd; I shall lack nothing."
```

### Get Restored Chapter

```javascript
import { getRestoredChapter } from './api/verses';

const chapter = await getRestoredChapter('WEB', 'GEN', 1);

// All 31 verses of Genesis 1 with divine names restored
```

## Restoration Rules

### Name Mapping Database

All restoration rules are stored in the `name_mappings` table:

| Field | Description |
|-------|-------------|
| `original_text` | Original Hebrew/English text |
| `traditional_rendering` | How it's traditionally translated |
| `restored_rendering` | The restored pronunciation |
| `strong_number` | Strong's concordance reference |
| `context_rules` | JSON object with application rules |
| `notes` | Explanation and historical context |

### Context Rules

Each mapping includes context rules that control when and how restoration is applied:

```json
{
  "language": "hebrew",
  "apply_to": ["WLC"],
  "case_sensitive": true,
  "whole_word": true,
  "pattern": "/\\bLORD\\b/g"
}
```

## Examples

### Example 1: Genesis 2:4 (First occurrence in Torah)

**Original English (WEB):**
> "This is the history of the generations of the heavens and of the earth when they were created, in the day that the LORD God made the earth and the heavens."

**Restored:**
> "This is the history of the generations of the heavens and of the earth when they were created, in the day that Yahuah Elohim made the earth and the heavens."

**Hebrew:**
- Original: `יהוה אלהים`
- Restored: `Yahuah Elohim`

### Example 2: Exodus 3:15 (The Name Revealed)

**Original English (WEB):**
> "God said moreover to Moses, 'You shall tell the children of Israel this: "The LORD, the God of your fathers, the God of Abraham, the God of Isaac, and the God of Jacob, has sent me to you." This is my name forever, and this is my memorial to all generations.'"

**Restored:**
> "Elohim said moreover to Moses, 'You shall tell the children of Israel this: "Yahuah, the Elohim of your fathers, the Elohim of Abraham, the Elohim of Isaac, and the Elohim of Jacob, has sent me to you." This is my name forever, and this is my memorial to all generations.'"

### Example 3: Psalm 23:1 (Most Famous Verse)

**Original:**
- **Hebrew (WLC)**: `מזמור ל/דוד יהוה רע/י לא אחסר`
- **English (WEB)**: "The LORD is my shepherd; I shall lack nothing."

**Restored:**
- **Hebrew**: `מזמור ל/דוד Yahuah רע/י לא אחסר`
- **English**: "Yahuah is my shepherd; I shall lack nothing."

## Frontend Integration

### React Component Example

```jsx
import React, { useState, useEffect } from 'react';
import { getRestoredParallelVerse } from './api/verses';

function RestoredVerseDisplay({ book, chapter, verse }) {
  const [data, setData] = useState(null);
  const [showOriginal, setShowOriginal] = useState(false);

  useEffect(() => {
    async function fetchVerse() {
      const result = await getRestoredParallelVerse(book, chapter, verse);
      setData(result);
    }
    fetchVerse();
  }, [book, chapter, verse]);

  if (!data) return <div>Loading...</div>;

  return (
    <div className="verse-display">
      <h2>{data.reference}</h2>

      {/* Toggle between original and restored */}
      <button onClick={() => setShowOriginal(!showOriginal)}>
        {showOriginal ? 'Show Restored' : 'Show Original'}
      </button>

      {/* Hebrew */}
      <div className="hebrew">
        <strong>Hebrew:</strong>
        {showOriginal ? data.hebrew.originalText : data.hebrew.text}
      </div>

      {/* English */}
      <div className="english">
        <strong>English:</strong>
        {showOriginal ? data.english.originalText : data.english.text}
      </div>

      {/* Restoration info */}
      {data.hebrew.restored && (
        <div className="restoration-info">
          <h4>Restorations:</h4>
          {data.hebrew.restorations.map((r, i) => (
            <div key={i}>
              {r.original} → {r.restored} ({r.strongNumber})
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

## Testing

Run the comprehensive restoration test suite:

```bash
node database/test-restoration.js
```

### Test Coverage

- ✅ Hebrew name restoration (Psalm 23:1)
- ✅ English name restoration (Psalm 23:1)
- ✅ First YHWH in Torah (Genesis 2:4)
- ✅ Verses without YHWH (Isaiah 53:5)
- ✅ Multiple occurrences (Exodus 3:15)
- ✅ Name mappings database verification

**All 6/6 tests passing!**

## Database Schema

### name_mappings Table

```sql
CREATE TABLE name_mappings (
  id UUID PRIMARY KEY,
  original_text TEXT NOT NULL,           -- 'יהוה', 'LORD'
  traditional_rendering TEXT,            -- 'LORD, Yahweh, Jehovah'
  restored_rendering TEXT NOT NULL,      -- 'Yahuah'
  strong_number VARCHAR(10),             -- 'H3068'
  context_rules JSONB,                   -- Application rules
  notes TEXT,                            -- Historical context
  created_at TIMESTAMP
);
```

## Pronunciation Guide

### Yahuah (יהוה)
- **Pronunciation**: yah-WHO-ah
- **Syllables**: Ya-hu-ah
- **Emphasis**: Second syllable (hu)
- **Meaning**: "I AM" / "The Self-Existent One"

### Yahusha (יהושע)
- **Pronunciation**: yah-WHO-shah
- **Syllables**: Ya-hu-sha
- **Emphasis**: Second syllable (hu)
- **Meaning**: "Yahuah saves" / "Yahuah is salvation"

### Elohim (אלהים)
- **Pronunciation**: el-oh-HEEM
- **Syllables**: E-lo-him
- **Emphasis**: Last syllable (heem)
- **Meaning**: "Mighty Ones" / "The Creator"

## Historical Background

### The Tetragrammaton (יהוה)

The four Hebrew letters Yod-Hey-Waw-Hey (יהוה) form the most sacred name in Scripture:

1. **Ancient Pronunciation**: Based on linguistic analysis of Hebrew phonetics and ancient sources, the pronunciation "Yahuah" preserves the original sound.

2. **Vowel Points**: The Masoretes added vowel points to the Hebrew text around 600-1000 CE. The vowels for "Adonai" (Lord) were placed under YHWH as a reminder to say "Adonai" instead of the sacred name.

3. **Restoration**: Modern scholarship, ancient Greek transliterations, and linguistic analysis support "Yahuah" as closer to the original pronunciation than later forms like "Jehovah" (which mixes the consonants of YHWH with the vowels of Adonai).

4. **Scripture Evidence**: The shortened form "Yah" (יה) appears in phrases like "Hallelu-Yah" (Praise Yah), supporting the "Ya" sound at the beginning of Yahuah.

## Theological Importance

The restoration of the divine name is not merely academic - it has profound theological significance:

1. **Personal Relationship**: Using someone's name creates intimacy. The Creator gave us His personal name to use.

2. **Covenant Identity**: The name YHWH is tied to the covenant relationship with His people (Exodus 3:14-15, 6:2-3).

3. **Authority in Prayer**: Throughout Scripture, believers called upon the name of YHWH in prayer and worship.

4. **Prophetic Fulfillment**: "All people will know my name" - restoration makes this possible for modern readers.

## Frequently Asked Questions

### Q: Why not "Yahweh"?

**A:** "Yahweh" is another scholarly reconstruction, but linguistic evidence suggests "Yahuah" better preserves:
- The shortened form "Yah" (יה)
- Ancient Greek transliterations
- Hebrew phonetic patterns

### Q: Isn't "Jehovah" the correct pronunciation?

**A:** "Jehovah" is a medieval hybrid that combines:
- The consonants of YHWH (יהוה)
- The vowels of Adonai (אֲדֹנָי)

This was never intended as a pronunciation, but as a reading reminder.

### Q: Why does WEB use "LORD" instead?

**A:** This is a translation convention dating back centuries to avoid pronouncing the sacred name. All4Yah restores the original name for transparency and accuracy.

### Q: Can users toggle between original and restored?

**A:** Yes! The API returns both `text` (restored) and `originalText` (traditional), allowing users to choose their preference.

## Next Steps

1. **Frontend UI**: Build user interface for verse display with restoration
2. **User Preferences**: Allow users to toggle restoration on/off
3. **Greek NT**: Extend restoration to New Testament (Jesus → Yahusha)
4. **Audio**: Add pronunciation audio for divine names
5. **Education**: Create teaching resources about the restoration

## Resources

- **Strong's Concordance**: https://biblehub.com/hebrew/3068.htm
- **Ancient Hebrew Research**: https://www.ancient-hebrew.org/
- **Manuscript Evidence**: Westminster Leningrad Codex (WLC)
- **Linguistic Analysis**: Hebrew phonetic reconstruction

---

*"I am YHWH. That is my name; my glory I give to no other."* - Isaiah 42:8

**All4Yah** - Restoring truth, one name at a time.
