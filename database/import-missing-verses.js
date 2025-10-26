#!/usr/bin/env node
/**
 * Import specific missing verses from Targum Onkelos
 *
 * Missing verses:
 * - GEN 1: verses 2-31 (30 verses)
 * - GEN 4: verses 7-26 (20 verses)
 * - NUM 16: verses 36-50 (15 verses)
 * - DEU 5: verses 31-33 (3 verses)
 * - DEU 12: verse 32 (1 verse)
 * - NUM 29: verse 40 (1 verse)
 */

const https = require('https');

const SEFARIA_API = 'https://www.sefaria.org/api';

const BOOK_MAP = {
  'Genesis': 'GEN',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU'
};

// Missing verses specification
const MISSING_VERSES = [
  { book: 'Genesis', chapter: 1, startVerse: 2, endVerse: 31 },
  { book: 'Genesis', chapter: 4, startVerse: 7, endVerse: 26 },
  { book: 'Numbers', chapter: 16, startVerse: 36, endVerse: 50 },
  { book: 'Deuteronomy', chapter: 5, startVerse: 31, endVerse: 33 },
  { book: 'Deuteronomy', chapter: 12, startVerse: 32, endVerse: 32 },
  { book: 'Numbers', chapter: 29, startVerse: 40, endVerse: 40 }
];

function fetchFromSefaria(ref) {
  return new Promise((resolve, reject) => {
    const url = `${SEFARIA_API}/texts/Onkelos_${ref}`;

    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}`));
        }
      });
    }).on('error', reject);
  });
}

function extractSpecificVerses(data, book, chapter, startVerse, endVerse) {
  const verses = [];
  const aramaic = Array.isArray(data.he) ? data.he : [data.he];
  const bookCode = BOOK_MAP[book];

  // Verses are 1-indexed in the array
  for (let i = startVerse; i <= endVerse && i <= aramaic.length; i++) {
    const text = aramaic[i - 1]; // Array is 0-indexed
    if (text) {
      verses.push({
        book: bookCode,
        chapter,
        verse: i,
        text: text.trim()
      });
    }
  }

  return verses;
}

function generateInsertSQL(verses) {
  if (verses.length === 0) return '';

  const bookName = verses[0].book;
  const chapter = verses[0].chapter;

  console.log(`-- Insert ${bookName} ${chapter}:${verses[0].verse}-${verses[verses.length-1].verse} (${verses.length} verses)`);
  console.log('INSERT INTO verses (manuscript_id, book, chapter, verse, text)');
  console.log('VALUES');

  const values = verses.map(v => {
    const text = v.text.replace(/'/g, "''");
    return `  ((SELECT id FROM manuscripts WHERE code = 'ONKELOS'), '${v.book}', ${v.chapter}, ${v.verse}, '${text}')`;
  }).join(',\n');

  console.log(values);
  console.log('ON CONFLICT (manuscript_id, book, chapter, verse)');
  console.log('DO UPDATE SET');
  console.log('  text = EXCLUDED.text,');
  console.log('  updated_at = NOW();\n');
}

async function importMissingVerses() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Import Missing Targum Onkelos Verses');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log('BEGIN;\n');

  let totalVerses = 0;
  let errors = 0;

  for (const spec of MISSING_VERSES) {
    try {
      const ref = `${spec.book}.${spec.chapter}`;
      console.error(`\nFetching ${spec.book} ${spec.chapter}:${spec.startVerse}-${spec.endVerse}...`);

      const data = await fetchFromSefaria(ref);
      const verses = extractSpecificVerses(
        data,
        spec.book,
        spec.chapter,
        spec.startVerse,
        spec.endVerse
      );

      if (verses.length > 0) {
        generateInsertSQL(verses);
        totalVerses += verses.length;
        console.error(`✓ Fetched ${verses.length} verses`);
      } else {
        console.error(`⚠ No verses found`);
      }

      // Rate limiting
      await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
      console.error(`✗ Error: ${error.message}`);
      errors++;
    }
  }

  console.log('COMMIT;\n');

  console.error('\n═══════════════════════════════════════════════════════════════');
  console.error('Import Complete');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error(`Total verses fetched: ${totalVerses}`);
  console.error(`Errors: ${errors}`);
  console.error('───────────────────────────────────────────────────────────────\n');
}

importMissingVerses().catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
