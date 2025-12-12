# All4Yah API Usage Guide

Complete guide for using the All4Yah verse retrieval API.

## Overview

The All4Yah API provides functions for retrieving Bible verses from the Supabase database with support for:
- Single verse retrieval (Hebrew or English)
- Parallel verse retrieval (Hebrew + English together)
- Full chapter retrieval
- Strong's number search
- Text content search

## Installation

The API module is located at `src/api/verses.js` and uses the Supabase client configured in `src/config/supabase.js`.

```javascript
import {
  getVerse,
  getParallelVerse,
  getChapter,
  searchByStrongsNumber,
  searchByText
} from './api/verses';
```

## API Functions

### 1. Get Single Verse

Retrieve a single verse from either Hebrew (WLC) or English (WEB) manuscript.

```javascript
const verse = await getVerse('WLC', 'GEN', 1, 1);

// Returns:
// {
//   manuscript: 'WLC',
//   book: 'GEN',
//   chapter: 1,
//   verse: 1,
//   text: 'ב/ראשית ברא אלהים את ה/שמים ו/את ה/ארץ',
//   strong_numbers: ['H7225', 'H1254', 'H430', 'H853', 'H8064', 'H776']
// }
```

**Parameters:**
- `manuscript` (string): `'WLC'` for Hebrew or `'WEB'` for English
- `book` (string): 3-letter book code (e.g., `'GEN'`, `'PSA'`, `'ISA'`)
- `chapter` (number): Chapter number
- `verse` (number): Verse number

### 2. Get Parallel Verse

Retrieve both Hebrew and English versions of the same verse.

```javascript
const parallel = await getParallelVerse('PSA', 23, 1);

// Returns:
// {
//   reference: 'PSA 23:1',
//   hebrew: {
//     manuscript: 'WLC',
//     book: 'PSA',
//     chapter: 23,
//     verse: 1,
//     text: 'מזמור ל/דוד יהוה רע/י לא אחסר',
//     strong_numbers: ['H4210', 'H1732', 'H3068', 'H7462', 'H3808', 'H2637']
//   },
//   english: {
//     manuscript: 'WEB',
//     book: 'PSA',
//     chapter: 23,
//     verse: 1,
//     text: 'A Psalm by David. The LORD is my shepherd; I shall lack nothing.',
//     strong_numbers: []
//   }
// }
```

**Parameters:**
- `book` (string): 3-letter book code
- `chapter` (number): Chapter number
- `verse` (number): Verse number

### 3. Get Full Chapter

Retrieve all verses in a chapter.

```javascript
const chapter = await getChapter('WEB', 'GEN', 1);

// Returns array of 31 verses:
// [
//   {
//     manuscript: 'WEB',
//     book: 'GEN',
//     chapter: 1,
//     verse: 1,
//     text: 'In the beginning, God created the heavens and the earth.',
//     strong_numbers: []
//   },
//   // ... verses 2-31
// ]
```

**Parameters:**
- `manuscript` (string): `'WLC'` or `'WEB'`
- `book` (string): 3-letter book code
- `chapter` (number): Chapter number

### 4. Get Parallel Chapter

Retrieve both Hebrew and English versions of an entire chapter.

```javascript
const parallelChapter = await getParallelChapter('GEN', 1);

// Returns:
// {
//   reference: 'GEN 1',
//   hebrew: [...31 Hebrew verses],
//   english: [...31 English verses],
//   verseCount: 31
// }
```

**Parameters:**
- `book` (string): 3-letter book code
- `chapter` (number): Chapter number

### 5. Search by Strong's Number

Find all verses containing a specific Strong's number.

```javascript
// Search for יהוה (YHWH - H3068)
const results = await searchByStrongsNumber('H3068', 10);

// Returns array of verses:
// [
//   {
//     manuscript: 'WLC',
//     reference: 'GEN 2:4',
//     book: 'GEN',
//     chapter: 2,
//     verse: 4,
//     text: '...',
//     strong_numbers: ['...', 'H3068', '...']
//   },
//   // ... more results
// ]
```

**Parameters:**
- `strongNumber` (string): Strong's number (e.g., `'H3068'`, `'H430'`)
- `limit` (number, optional): Maximum results to return (default: 10)

**Common Strong's Numbers:**
- `H3068` - יהוה (YHWH - The divine name)
- `H430` - אלהים (Elohim - God)
- `H3091` - יהושע (Yahusha - Joshua/Jesus)
- `H4899` - משיח (Mashiach - Messiah/Anointed)

### 6. Search by Text

Search for verses containing specific text.

```javascript
// Search English text
const englishResults = await searchByText('WEB', 'shepherd', 5);

// Search Hebrew text
const hebrewResults = await searchByText('WLC', 'אלהים', 5);

// Returns array of matching verses
```

**Parameters:**
- `manuscript` (string): `'WLC'` or `'WEB'`
- `searchText` (string): Text to search for (case-insensitive)
- `limit` (number, optional): Maximum results to return (default: 10)

### 7. Get YHWH Verses

Shortcut function to find verses containing the divine name.

```javascript
const yhwhVerses = await getYHWHVerses(20);

// Equivalent to:
// searchByStrongsNumber('H3068', 20)
```

### 8. Get Book Info

Retrieve metadata about books.

```javascript
// Get verse count
const verseCount = await getBookVerseCount('WLC', 'GEN');
// Returns: 1533

// Get chapter count
const chapterCount = await getBookChapterCount('WLC', 'GEN');
// Returns: 50

// Get all available books
const books = await getBooks('WLC');
// Returns: ['GEN', 'EXO', 'LEV', ..., 'MAL']
```

## Book Codes

### Old Testament (39 books)

| Code | Book | Code | Book | Code | Book |
|------|------|------|------|------|------|
| GEN | Genesis | 1KI | 1 Kings | ISA | Isaiah |
| EXO | Exodus | 2KI | 2 Kings | JER | Jeremiah |
| LEV | Leviticus | 1CH | 1 Chronicles | LAM | Lamentations |
| NUM | Numbers | 2CH | 2 Chronicles | EZK | Ezekiel |
| DEU | Deuteronomy | EZR | Ezra | DAN | Daniel |
| JOS | Joshua | NEH | Nehemiah | HOS | Hosea |
| JDG | Judges | EST | Esther | JOL | Joel |
| RUT | Ruth | JOB | Job | AMO | Amos |
| 1SA | 1 Samuel | PSA | Psalms | OBA | Obadiah |
| 2SA | 2 Samuel | PRO | Proverbs | JON | Jonah |
| --- | --- | ECC | Ecclesiastes | MIC | Micah |
| --- | --- | SNG | Song of Solomon | NAM | Nahum |
| --- | --- | --- | --- | HAB | Habakkuk |
| --- | --- | --- | --- | ZEP | Zephaniah |
| --- | --- | --- | --- | HAG | Haggai |
| --- | --- | --- | --- | ZEC | Zechariah |
| --- | --- | --- | --- | MAL | Malachi |

## Error Handling

All API functions throw errors that should be caught:

```javascript
try {
  const verse = await getVerse('WLC', 'GEN', 1, 1);
  console.log(verse.text);
} catch (error) {
  console.error('Failed to get verse:', error.message);
}
```

## Example Usage in React

```javascript
import React, { useState, useEffect } from 'react';
import { getParallelVerse } from './api/verses';

function VerseDisplay({ book, chapter, verse }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchVerse() {
      try {
        setLoading(true);
        const result = await getParallelVerse(book, chapter, verse);
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchVerse();
  }, [book, chapter, verse]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return null;

  return (
    <div>
      <h2>{data.reference}</h2>
      <div className="hebrew">
        <strong>Hebrew:</strong> {data.hebrew.text}
      </div>
      <div className="english">
        <strong>English:</strong> {data.english.text}
      </div>
      <div className="strongs">
        <strong>Strong's:</strong> {data.hebrew.strong_numbers.join(', ')}
      </div>
    </div>
  );
}

export default VerseDisplay;
```

## Testing

Run the comprehensive test suite:

```bash
node database/test-api.js
```

This tests all 8 API functions and verifies:
- Single verse retrieval (Hebrew & English)
- Parallel verse retrieval
- Chapter retrieval
- Strong's number search
- Text search (Hebrew & English)
- Error handling

## Database Structure

The API queries the following Supabase tables:

### manuscripts
- `id` - UUID
- `code` - 'WLC' or 'WEB'
- `name` - Full manuscript name
- `language` - 'hebrew' or 'english'

### verses
- `id` - UUID
- `manuscript_id` - References manuscripts.id
- `book` - 3-letter book code
- `chapter` - Chapter number
- `verse` - Verse number
- `text` - Verse content
- `strong_numbers` - Array of Strong's numbers (Hebrew only)

## Performance Notes

- All queries use indexed columns for fast lookups
- Batch operations are optimized for minimal database calls
- Parallel verse retrieval uses `Promise.all()` for concurrent fetching
- Default result limits prevent excessive data transfer

## Next Steps

1. **Name Restoration**: Build on this API to create name restoration (יהוה → Yahuah)
2. **Frontend Components**: Create React components for verse display
3. **Caching**: Add client-side caching for frequently accessed verses
4. **Pagination**: Implement pagination for large result sets
5. **Greek NT**: Extend API to support Textus Receptus when imported

## Support

For issues or questions about the API, please refer to:
- `/docs/VISION_ROADMAP.md` - Project roadmap
- `/docs/PHASE_1_ACTIONS.md` - Current phase details
- `/docs/CLAUDE.md` - Development guidelines
