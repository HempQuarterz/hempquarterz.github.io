/**
 * Textus Receptus Greek New Testament Import Script
 * Imports Greek NT from Textus Receptus (Scrivener 1894 edition)
 * Source: https://github.com/byztxt/byzantine-majority-text
 * License: Public Domain
 *
 * To use this script:
 * 1. Download TR data from the source repository
 * 2. Extract to ../../manuscripts/greek_nt/textus_receptus/
 * 3. Run: node database/import-textus-receptus.js [--test|--book NUM|--full]
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Greek NT book mapping
const BOOK_MAP = {
  61: 'MAT', 62: 'MRK', 63: 'LUK', 64: 'JHN', 65: 'ACT', 66: 'ROM',
  67: '1CO', 68: '2CO', 69: 'GAL', 70: 'EPH', 71: 'PHP', 72: 'COL',
  73: '1TH', 74: '2TH', 75: '1TI', 76: '2TI', 77: 'TIT', 78: 'PHM',
  79: 'HEB', 80: 'JAS', 81: '1PE', 82: '2PE', 83: '1JN', 84: '2JN',
  85: '3JN', 86: 'JUD', 87: 'REV'
};

const BOOK_NAMES = {
  61: 'Matthew', 62: 'Mark', 63: 'Luke', 64: 'John', 65: 'Acts', 66: 'Romans',
  67: '1 Corinthians', 68: '2 Corinthians', 69: 'Galatians', 70: 'Ephesians',
  71: 'Philippians', 72: 'Colossians', 73: '1 Thessalonians', 74: '2 Thessalonians',
  75: '1 Timothy', 76: '2 Timothy', 77: 'Titus', 78: 'Philemon',
  79: 'Hebrews', 80: 'James', 81: '1 Peter', 82: '2 Peter',
  83: '1 John', 84: '2 John', 85: '3 John', 86: 'Jude', 87: 'Revelation'
};

/**
 * Create Textus Receptus manuscript record
 */
async function createManuscriptRecord() {
  console.log('📖 Creating Textus Receptus manuscript record...');

  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'TR')
    .single();

  if (existing) {
    console.log('✅ Textus Receptus manuscript already exists:', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'TR',
      name: 'Textus Receptus (Scrivener 1894)',
      language: 'greek',
      description: 'Traditional Greek New Testament text underlying the King James Version',
      source_url: 'https://github.com/byztxt/byzantine-majority-text',
      license: 'Public Domain',
      date_range: '1894 CE (compilation of earlier texts)'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create manuscript: ${error.message}`);
  }

  console.log('✅ Created Textus Receptus manuscript:', data.id);
  return data.id;
}

/**
 * Parse TR verse line
 * Format varies by source, this handles common formats
 */
function parseTRLine(line, currentBook) {
  // Skip empty lines and headers
  if (!line || line.startsWith('#') || line.trim() === '') {
    return null;
  }

  // Try to parse reference and text
  // Example formats:
  // "Mat 1:1 Βίβλος γενέσεως..."
  // "1:1 Βίβλος γενέσεως..." (book is in context)

  let match = line.match(/^(\w+)\s+(\d+):(\d+)\s+(.+)$/);
  if (match) {
    const [, book, chapter, verse, text] = match;
    return {
      book: book.toUpperCase(),
      chapter: parseInt(chapter),
      verse: parseInt(verse),
      text: text.trim()
    };
  }

  // Try format without book name (using currentBook)
  match = line.match(/^(\d+):(\d+)\s+(.+)$/);
  if (match && currentBook) {
    const [, chapter, verse, text] = match;
    return {
      book: currentBook,
      chapter: parseInt(chapter),
      verse: parseInt(verse),
      text: text.trim()
    };
  }

  return null;
}

/**
 * Import verses for a single book
 */
async function importBook(manuscriptId, bookNumber) {
  const bookCode = BOOK_MAP[bookNumber];
  const bookName = BOOK_NAMES[bookNumber];

  console.log(`\n📖 Importing ${bookName} (${bookCode})...`);

  // Path to TR data - adjust based on actual file structure
  const trDir = path.join(__dirname, '../../manuscripts/greek_nt/textus_receptus');
  const bookFile = path.join(trDir, `${bookCode}.txt`);

  if (!fs.existsSync(bookFile)) {
    console.log(`⚠️  File not found, skipping: ${bookFile}`);
    return 0;
  }

  const content = fs.readFileSync(bookFile, 'utf-8');
  const lines = content.split('\n');

  const versesByChapter = {};
  let currentChapter = 1;

  // Parse all verses
  for (const line of lines) {
    const parsed = parseTRLine(line, bookCode);

    if (parsed) {
      const { chapter, verse, text } = parsed;

      if (!versesByChapter[chapter]) {
        versesByChapter[chapter] = {};
      }

      versesByChapter[chapter][verse] = text;
      currentChapter = chapter;
    }
  }

  // Insert verses in batches
  let totalVerses = 0;
  let batch = [];

  for (const [chapter, verses] of Object.entries(versesByChapter)) {
    for (const [verse, text] of Object.entries(verses)) {
      batch.push({
        manuscript_id: manuscriptId,
        book: bookCode,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        text: text,
        strong_numbers: null,
        morphology: null
      });

      // Insert in batches of 100
      if (batch.length >= 100) {
        const { error } = await supabase
          .from('verses')
          .insert(batch);

        if (error) {
          console.error(`Error inserting batch:`, error.message);
        } else {
          totalVerses += batch.length;
          process.stdout.write(`   Imported: ${totalVerses} verses\r`);
        }

        batch = [];
      }
    }
  }

  // Insert remaining verses
  if (batch.length > 0) {
    const { error } = await supabase
      .from('verses')
      .insert(batch);

    if (error) {
      console.error(`Error inserting final batch:`, error.message);
    } else {
      totalVerses += batch.length;
    }
  }

  console.log(`   ✅ Completed ${bookName}: ${totalVerses} verses`);
  return totalVerses;
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');
  const bookArg = args.find(arg => arg.startsWith('--book'));
  const bookNumber = bookArg ? parseInt(bookArg.split('=')[1]) : null;

  console.log('🔥 Textus Receptus Import Script');
  console.log('===================================\n');

  try {
    // Create manuscript record
    const manuscriptId = await createManuscriptRecord();

    // Determine books to import
    let booksToImport;
    if (testMode) {
      booksToImport = [64]; // John for testing
    } else if (bookNumber) {
      booksToImport = [bookNumber];
    } else {
      booksToImport = Object.keys(BOOK_MAP).map(Number);
    }

    let totalVerses = 0;

    for (const bookNum of booksToImport) {
      const count = await importBook(manuscriptId, bookNum);
      totalVerses += count;
    }

    console.log('\n✅ Textus Receptus import completed successfully!');
    console.log(`   Total verses: ${totalVerses}`);
    console.log(`   Books: ${booksToImport.length}/27`);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importBook, createManuscriptRecord };
