/**
 * Import Targum Onkelos from Sefaria API
 *
 * Targum Onkelos is the primary Aramaic translation of the Torah,
 * accepted as authoritative in the Talmud and still read in synagogues today.
 *
 * Usage:
 *   node database/import-targum-onkelos.js [--test] [--book GEN]
 *
 * Options:
 *   --test: Only import Genesis 1 (for testing)
 *   --book: Import specific book (GEN, EXO, LEV, NUM, DEU)
 */

const https = require('https');

// Sefaria API base URL
const SEFARIA_API = 'https://www.sefaria.org/api';

// Book mapping: All4Yah code -> Sefaria name
const BOOK_MAP = {
  'GEN': 'Genesis',
  'EXO': 'Exodus',
  'LEV': 'Leviticus',
  'NUM': 'Numbers',
  'DEU': 'Deuteronomy'
};

// Chapter counts for each book
const CHAPTER_COUNTS = {
  'GEN': 50,
  'EXO': 40,
  'LEV': 27,
  'NUM': 36,
  'DEU': 34
};

// Statistics
const stats = {
  books: 0,
  chapters: 0,
  verses: 0,
  errors: 0
};

/**
 * Fetch data from Sefaria API
 */
function fetchFromSefaria(ref) {
  return new Promise((resolve, reject) => {
    const url = `${SEFARIA_API}/texts/Onkelos_${ref}`;

    https.get(url, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(new Error(`Failed to parse JSON: ${error.message}`));
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    }).on('error', reject);
  });
}

/**
 * Extract verses from Sefaria response
 */
function extractVerses(data, book, chapter) {
  const verses = [];

  // Sefaria returns text as array (one entry per verse)
  const aramaic = Array.isArray(data.he) ? data.he : [data.he];
  const english = Array.isArray(data.text) ? data.text : [data.text];

  for (let i = 0; i < aramaic.length; i++) {
    if (aramaic[i]) {
      verses.push({
        book,
        chapter,
        verse: i + 1,
        text: aramaic[i].trim(),
        translation: english[i] ? english[i].trim() : null
      });
    }
  }

  return verses;
}

/**
 * Generate SQL INSERT statement
 */
function generateInsertSQL(manuscriptId, verses) {
  if (verses.length === 0) return '';

  const values = verses.map(v => {
    const text = v.text.replace(/'/g, "''");
    return `(${manuscriptId}, '${v.book}', ${v.chapter}, ${v.verse}, '${text}')`;
  }).join(',\n  ');

  return `
-- Insert ${verses[0].book} ${verses[0].chapter} (${verses.length} verses)
INSERT INTO verses (manuscript_id, book, chapter, verse, text)
VALUES
  ${values}
ON CONFLICT (manuscript_id, book, chapter, verse)
DO UPDATE SET
  text = EXCLUDED.text,
  updated_at = NOW();
`;
}

/**
 * Main import function
 */
async function importTargumOnkelos(options = {}) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Targum Onkelos Import from Sefaria API');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Determine which books to import
  let booksToImport;
  if (options.test) {
    console.log('TEST MODE: Importing Genesis 1 only\n');
    booksToImport = ['GEN'];
  } else if (options.book) {
    console.log(`Importing ${options.book} only\n`);
    booksToImport = [options.book];
  } else {
    console.log('Importing all 5 Torah books\n');
    booksToImport = Object.keys(BOOK_MAP);
  }

  // Output SQL header
  console.log('-- Targum Onkelos Import SQL');
  console.log('-- Generated:', new Date().toISOString());
  console.log('-- Source: Sefaria API (https://www.sefaria.org)');
  console.log('-- License: CC-BY-NC (Metsudah Chumash)\n');
  console.log('BEGIN;\n');

  // Get or create Targum Onkelos manuscript
  console.log(`-- Get Targum Onkelos manuscript ID`);
  console.log(`SELECT id FROM manuscripts WHERE code = 'ONKELOS';\n`);

  // For each book
  for (const bookCode of booksToImport) {
    const sefariaBook = BOOK_MAP[bookCode];
    const totalChapters = options.test ? 1 : CHAPTER_COUNTS[bookCode];

    console.error(`\nImporting ${sefariaBook} (${totalChapters} chapters)...`);
    stats.books++;

    // For each chapter
    for (let chapter = 1; chapter <= totalChapters; chapter++) {
      try {
        const ref = `${sefariaBook}.${chapter}`;
        console.error(`  Fetching ${ref}...`);

        const data = await fetchFromSefaria(ref);
        const verses = extractVerses(data, bookCode, chapter);

        if (verses.length > 0) {
          const sql = generateInsertSQL(
            "(SELECT id FROM manuscripts WHERE code = 'ONKELOS')",
            verses
          );
          console.log(sql);

          stats.chapters++;
          stats.verses += verses.length;
          console.error(`  ✓ ${ref}: ${verses.length} verses`);
        } else {
          console.error(`  ⚠ ${ref}: No verses found`);
        }

        // Rate limiting: wait 100ms between requests
        await new Promise(resolve => setTimeout(resolve, 100));

      } catch (error) {
        console.error(`  ✗ Error: ${error.message}`);
        stats.errors++;
      }
    }
  }

  console.log('\nCOMMIT;\n');

  // Print summary
  console.error('\n═══════════════════════════════════════════════════════════════');
  console.error('Import Complete');
  console.error('═══════════════════════════════════════════════════════════════');
  console.error(`Books imported:     ${stats.books}`);
  console.error(`Chapters imported:  ${stats.chapters}`);
  console.error(`Verses imported:    ${stats.verses}`);
  console.error(`Errors:             ${stats.errors}`);
  console.error('───────────────────────────────────────────────────────────────\n');
}

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  test: args.includes('--test'),
  book: args.find(arg => arg.startsWith('--book'))?.split('=')[1]
};

// Run import
importTargumOnkelos(options).catch(error => {
  console.error('\n❌ Fatal error:', error.message);
  process.exit(1);
});
