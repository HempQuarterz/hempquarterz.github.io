/**
 * WEB Deuterocanon Import Script
 * Imports 18 deuterocanonical books from World English Bible USFM files
 *
 * Usage:
 *   node import-web-deuterocanon.js --test           # Test with Wisdom only
 *   node import-web-deuterocanon.js --book WIS       # Import single book
 *   node import-web-deuterocanon.js --full           # Import all 18 books
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';
const USFM_DIR = '/tmp/eng-web_usfm';
const MANUSCRIPT_CODE = 'WEB';

// Deuterocanonical book mappings (USFM number prefix → book code)
const DEUT_BOOKS = {
  '41': 'TOB',   // Tobit
  '42': 'JDT',   // Judith
  '43': 'ESG',   // Additions to Esther (Greek Esther)
  '45': 'WIS',   // Wisdom of Solomon
  '46': 'SIR',   // Sirach (Ecclesiasticus)
  '47': 'BAR',   // Baruch (includes Letter of Jeremiah as ch. 6)
  '52': '1MA',   // 1 Maccabees
  '53': '2MA',   // 2 Maccabees
  '54': '1ES',   // 1 Esdras
  '55': 'MAN',   // Prayer of Manasseh
  '56': 'PS2',   // Psalm 151
  '57': '3MA',   // 3 Maccabees
  '58': '2ES',   // 2 Esdras
  '59': '4MA',   // 4 Maccabees
  '66': 'DAG'    // Daniel Greek (contains S3Y, SUS, BEL)
};

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

/**
 * Clean USFM markup from text
 */
function cleanText(text) {
  if (!text) return '';

  // Remove footnotes: \f + ... \f*
  text = text.replace(/\\f \+ .*?\\f\*/g, '');

  // Remove formatting markers: \q1, \q2, \p, \b, etc.
  text = text.replace(/\\[a-z]+\d*\s*/g, '');

  // Remove extra whitespace
  text = text.replace(/\s+/g, ' ').trim();

  return text;
}

/**
 * Parse USFM file and extract verses
 */
function parseUSFMFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const verses = [];
  let currentBook = null;
  let currentChapter = null;
  let currentVerseNum = null;
  let currentVerseText = [];

  for (const line of lines) {
    // Extract book code from \id marker
    if (line.startsWith('\\id ')) {
      const parts = line.split(/\s+/);
      currentBook = parts[1];
    }

    // Chapter marker
    else if (line.startsWith('\\c ')) {
      // Save previous verse before starting new chapter
      if (currentVerseNum) {
        verses.push({
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerseNum,
          text: cleanText(currentVerseText.join(' '))
        });
      }

      currentChapter = parseInt(line.split(/\s+/)[1]);
      currentVerseNum = null;
      currentVerseText = [];
    }

    // Verse marker
    else if (line.startsWith('\\v ')) {
      // Save previous verse
      if (currentVerseNum) {
        verses.push({
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerseNum,
          text: cleanText(currentVerseText.join(' '))
        });
      }

      // Start new verse
      const parts = line.substring(3).trim().split(/\s+/);
      currentVerseNum = parseInt(parts[0]);
      currentVerseText = parts.length > 1 ? [parts.slice(1).join(' ')] : [];
    }

    // Continuation of verse text
    else if (currentVerseNum && line.trim()) {
      currentVerseText.push(line);
    }
  }

  // Save last verse
  if (currentVerseNum) {
    verses.push({
      book: currentBook,
      chapter: currentChapter,
      verse: currentVerseNum,
      text: cleanText(currentVerseText.join(' '))
    });
  }

  return verses;
}

/**
 * Extract Daniel Greek additions as separate books
 * S3Y (Song of Three) = Daniel 3:24-90
 * SUS (Susanna) = Daniel 13
 * BEL (Bel and Dragon) = Daniel 14
 */
function extractDanielAdditions(dagVerses) {
  const s3y = dagVerses
    .filter(v => v.chapter === 3 && v.verse >= 24)
    .map(v => ({ ...v, book: 'S3Y', chapter: 1, verse: v.verse - 23 }));

  const sus = dagVerses
    .filter(v => v.chapter === 13)
    .map(v => ({ ...v, book: 'SUS' }));

  const bel = dagVerses
    .filter(v => v.chapter === 14)
    .map(v => ({ ...v, book: 'BEL' }));

  return { s3y, sus, bel };
}

/**
 * Extract Letter of Jeremiah from Baruch chapter 6
 */
function extractLetterJeremiah(barVerses) {
  const lje = barVerses
    .filter(v => v.chapter === 6)
    .map(v => ({ ...v, book: 'LJE', chapter: 1 }));

  return lje;
}

/**
 * Get manuscript ID for WEB
 */
async function getManuscriptId() {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', MANUSCRIPT_CODE)
    .single();

  if (error || !data) {
    throw new Error(`WEB manuscript not found: ${error?.message}`);
  }

  console.log(`✅ Found WEB manuscript (ID: ${data.id})`);
  return data.id;
}

/**
 * Insert verses into database (batch operation)
 */
async function insertVerses(verses, manuscriptId) {
  const batchSize = 100;
  let totalInserted = 0;

  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);

    const records = batch.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text
    }));

    const { data, error } = await supabase
      .from('verses')
      .upsert(records, {
        onConflict: 'manuscript_id,book,chapter,verse',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error);
      throw error;
    }

    totalInserted += batch.length;
    process.stdout.write(`\r  Inserted ${totalInserted}/${verses.length} verses...`);
  }

  console.log(`\n✅ Inserted ${totalInserted} verses`);
  return totalInserted;
}

/**
 * Import a single book
 */
async function importBook(bookPrefix, bookCode, manuscriptId) {
  const fileName = `${bookPrefix}-${bookCode === 'DAG' ? 'DAG' : bookCode}eng-web.usfm`;
  const filePath = path.join(USFM_DIR, fileName);

  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${fileName}`);
    return 0;
  }

  console.log(`\n📖 Parsing ${bookCode} (${fileName})...`);
  const verses = parseUSFMFile(filePath);

  // Handle special cases
  let allVerses = verses;

  if (bookCode === 'DAG') {
    // Extract Daniel Greek additions
    const { s3y, sus, bel } = extractDanielAdditions(verses);
    allVerses = [...s3y, ...sus, ...bel];
    console.log(`  ├─ S3Y: ${s3y.length} verses`);
    console.log(`  ├─ SUS: ${sus.length} verses`);
    console.log(`  └─ BEL: ${bel.length} verses`);
  } else if (bookCode === 'BAR') {
    // Extract Letter of Jeremiah
    const lje = extractLetterJeremiah(verses);
    allVerses = [...verses, ...lje];
    console.log(`  ├─ BAR: ${verses.length - lje.length} verses`);
    console.log(`  └─ LJE: ${lje.length} verses`);
  } else {
    console.log(`  └─ ${bookCode}: ${verses.length} verses`);
  }

  // Insert verses
  const inserted = await insertVerses(allVerses, manuscriptId);
  return inserted;
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');
  const bookIndex = args.indexOf('--book');
  const singleBook = bookIndex >= 0 ? args[bookIndex + 1] : null;

  console.log('🚀 WEB Deuterocanon Import Script\n');

  // Get manuscript ID
  const manuscriptId = await getManuscriptId();

  // Determine which books to import
  let booksToImport = [];

  if (testMode) {
    console.log('📋 Test Mode: Importing Wisdom of Solomon only\n');
    booksToImport = [['45', 'WIS']];
  } else if (singleBook) {
    const entry = Object.entries(DEUT_BOOKS).find(([_, code]) => code === singleBook);
    if (!entry) {
      console.error(`❌ Unknown book code: ${singleBook}`);
      process.exit(1);
    }
    console.log(`📋 Single Book Mode: Importing ${singleBook}\n`);
    booksToImport = [entry];
  } else if (fullMode) {
    console.log('📋 Full Mode: Importing all 18 deuterocanonical books\n');
    booksToImport = Object.entries(DEUT_BOOKS);
  } else {
    console.log('Usage:');
    console.log('  node import-web-deuterocanon.js --test      # Test with Wisdom only');
    console.log('  node import-web-deuterocanon.js --book WIS  # Import single book');
    console.log('  node import-web-deuterocanon.js --full      # Import all 18 books');
    process.exit(0);
  }

  // Import books
  let totalVerses = 0;
  const startTime = Date.now();

  for (const [prefix, code] of booksToImport) {
    const count = await importBook(prefix, code, manuscriptId);
    totalVerses += count;
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log(`✅ Import Complete!`);
  console.log(`   Total verses: ${totalVerses}`);
  console.log(`   Duration: ${duration}s`);
  console.log('='.repeat(60));
}

// Run main function
main().catch(error => {
  console.error('\n❌ Fatal Error:', error.message);
  console.error(error.stack);
  process.exit(1);
});
