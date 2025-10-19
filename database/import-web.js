/**
 * World English Bible (WEB) Import Script
 * Imports English Old Testament into Supabase database
 *
 * Usage:
 *   node database/import-web.js --test              # Import Genesis 1 only
 *   node database/import-web.js --book Genesis      # Import specific book
 *   node database/import-web.js --full              # Import all books
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Book number to abbreviation mapping (based on WEB file naming)
const BOOK_MAPPING = {
  '002': 'GEN',
  '003': 'EXO',
  '004': 'LEV',
  '005': 'NUM',
  '006': 'DEU',
  '007': 'JOS',
  '008': 'JDG',
  '009': 'RUT',
  '010': '1SA',
  '011': '2SA',
  '012': '1KI',
  '013': '2KI',
  '014': '1CH',
  '015': '2CH',
  '016': 'EZR',
  '017': 'NEH',
  '018': 'EST',
  '019': 'JOB',
  '020': 'PSA',
  '021': 'PRO',
  '022': 'ECC',
  '023': 'SNG',
  '024': 'ISA',
  '025': 'JER',
  '026': 'LAM',
  '027': 'EZK',
  '028': 'DAN',
  '029': 'HOS',
  '030': 'JOL',
  '031': 'AMO',
  '032': 'OBA',
  '033': 'JON',
  '034': 'MIC',
  '035': 'NAM',
  '036': 'HAB',
  '037': 'ZEP',
  '038': 'HAG',
  '039': 'ZEC',
  '040': 'MAL'
};

const BOOK_NAMES = {
  'GEN': 'Genesis',
  'EXO': 'Exodus',
  'LEV': 'Leviticus',
  'NUM': 'Numbers',
  'DEU': 'Deuteronomy',
  'JOS': 'Joshua',
  'JDG': 'Judges',
  'RUT': 'Ruth',
  '1SA': '1 Samuel',
  '2SA': '2 Samuel',
  '1KI': '1 Kings',
  '2KI': '2 Kings',
  '1CH': '1 Chronicles',
  '2CH': '2 Chronicles',
  'EZR': 'Ezra',
  'NEH': 'Nehemiah',
  'EST': 'Esther',
  'JOB': 'Job',
  'PSA': 'Psalms',
  'PRO': 'Proverbs',
  'ECC': 'Ecclesiastes',
  'SNG': 'Song of Solomon',
  'ISA': 'Isaiah',
  'JER': 'Jeremiah',
  'LAM': 'Lamentations',
  'EZK': 'Ezekiel',
  'DAN': 'Daniel',
  'HOS': 'Hosea',
  'JOL': 'Joel',
  'AMO': 'Amos',
  'OBA': 'Obadiah',
  'JON': 'Jonah',
  'MIC': 'Micah',
  'NAM': 'Nahum',
  'HAB': 'Habakkuk',
  'ZEP': 'Zephaniah',
  'HAG': 'Haggai',
  'ZEC': 'Zechariah',
  'MAL': 'Malachi'
};

/**
 * Insert or get the WEB manuscript record
 */
async function ensureManuscript() {
  console.log('\n📚 Checking manuscript record...');

  // Check if WEB manuscript exists
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  if (existing) {
    console.log('✅ WEB manuscript record exists');
    return existing.id;
  }

  // Create manuscript record
  const { data, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'WEB',
      name: 'World English Bible',
      language: 'english',
      description: 'Modern English translation in the public domain, based on the ASV (1901) and updated to contemporary English',
      source_url: 'https://ebible.org/web/',
      license: 'Public Domain',
      date_range: '2000'
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to create manuscript record:', error);
    process.exit(1);
  }

  console.log('✅ Created WEB manuscript record');
  return data.id;
}

/**
 * Parse a WEB chapter file
 */
function parseChapterFile(filePath, bookCode, chapterNum) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const verses = [];
  let verseNum = 1;

  // Skip first 2 lines (book title and "Chapter X.")
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines
    if (!line) continue;

    verses.push({
      book: bookCode,
      chapter: chapterNum,
      verse: verseNum,
      text: line
    });

    verseNum++;
  }

  return verses;
}

/**
 * Import a single book
 */
async function importBook(manuscriptId, bookCode, webDataPath) {
  const bookName = BOOK_NAMES[bookCode];

  console.log(`\n📖 Importing ${bookName} (${bookCode})...`);

  let successCount = 0;
  let failedCount = 0;
  const allVerses = [];

  // Find all chapter files for this book
  const files = fs.readdirSync(webDataPath);
  const bookFiles = files
    .filter(f => f.includes(`_${bookCode}_`) && f.endsWith('_read.txt'))
    .sort();

  if (bookFiles.length === 0) {
    console.warn(`⚠️  No files found for ${bookCode}`);
    return { success: 0, failed: 0 };
  }

  // Parse each chapter file
  for (const filename of bookFiles) {
    // Extract chapter number from filename (e.g., engwebp_002_GEN_01_read.txt)
    const match = filename.match(/_(\d+)_read\.txt$/);
    if (!match) continue;

    const chapterNum = parseInt(match[1], 10);
    const filePath = path.join(webDataPath, filename);

    const verses = parseChapterFile(filePath, bookCode, chapterNum);

    // Add manuscript_id to each verse
    verses.forEach(v => {
      v.manuscript_id = manuscriptId;
      v.strong_numbers = []; // WEB doesn't have Strong's numbers
    });

    allVerses.push(...verses);
  }

  // Batch insert verses (chunks of 100 for performance)
  const BATCH_SIZE = 100;
  for (let i = 0; i < allVerses.length; i += BATCH_SIZE) {
    const batch = allVerses.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('verses')
      .insert(batch);

    if (error) {
      console.error(`❌ Failed to insert batch starting at verse ${i}:`, error.message);
      failedCount += batch.length;
    } else {
      successCount += batch.length;
      process.stdout.write(`\r   Progress: ${successCount}/${allVerses.length} verses`);
    }
  }

  console.log(`\n✅ Imported ${successCount} verses from ${bookName}`);

  return { success: successCount, failed: failedCount };
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--help';

  console.log('🌍 World English Bible Import Tool\n');

  if (mode === '--help' || !mode) {
    console.log('Usage:');
    console.log('  node database/import-web.js --test              # Import Genesis 1 only');
    console.log('  node database/import-web.js --book Genesis      # Import specific book');
    console.log('  node database/import-web.js --full              # Import all books');
    process.exit(0);
  }

  const webDataPath = path.join(__dirname, '../../manuscripts/english/web');

  if (!fs.existsSync(webDataPath)) {
    console.error(`❌ WEB data not found at: ${webDataPath}`);
    console.error('   Please download WEB data from https://ebible.org/web/');
    process.exit(1);
  }

  // Ensure manuscript record exists
  const manuscriptId = await ensureManuscript();

  let totalSuccess = 0;
  let totalFailed = 0;

  if (mode === '--test') {
    console.log('\n🧪 TEST MODE: Importing Genesis chapter 1 only\n');

    // Parse just Genesis 1
    const gen1File = 'engwebp_002_GEN_01_read.txt';
    const filePath = path.join(webDataPath, gen1File);

    if (!fs.existsSync(filePath)) {
      console.error(`❌ Genesis 1 file not found: ${filePath}`);
      process.exit(1);
    }

    const verses = parseChapterFile(filePath, 'GEN', 1);
    verses.forEach(v => {
      v.manuscript_id = manuscriptId;
      v.strong_numbers = [];
    });

    const { error } = await supabase.from('verses').insert(verses);

    if (error) {
      console.error('❌ Import failed:', error);
      totalFailed = verses.length;
    } else {
      console.log(`✅ Imported ${verses.length} verses from Genesis 1`);
      totalSuccess = verses.length;
    }

  } else if (mode === '--book') {
    const bookName = args[1];
    if (!bookName) {
      console.error('❌ Please specify a book name: --book Genesis');
      process.exit(1);
    }

    // Find book code by name
    const bookCode = Object.keys(BOOK_NAMES).find(
      code => BOOK_NAMES[code].toLowerCase() === bookName.toLowerCase()
    );

    if (!bookCode) {
      console.error(`❌ Book "${bookName}" not found`);
      console.log('\nAvailable books:', Object.values(BOOK_NAMES).join(', '));
      process.exit(1);
    }

    const stats = await importBook(manuscriptId, bookCode, webDataPath);
    totalSuccess = stats.success;
    totalFailed = stats.failed;

  } else if (mode === '--full') {
    console.log('\n📚 FULL IMPORT: Importing all 39 OT books\n');

    for (const bookCode of Object.keys(BOOK_NAMES)) {
      const stats = await importBook(manuscriptId, bookCode, webDataPath);

      totalSuccess += stats.success;
      totalFailed += stats.failed;
    }

  } else {
    console.error(`❌ Unknown mode: ${mode}`);
    console.log('Run with --help for usage information');
    process.exit(1);
  }

  // Final summary
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Successfully imported: ${totalSuccess} verses`);
  console.log(`❌ Failed: ${totalFailed} verses`);
  console.log('\n🎉 Import complete!');
  console.log('\nNext steps:');
  console.log('  1. Verify data: node database/verify-tables.js');
  console.log('  2. Compare with Hebrew: SELECT * FROM verses WHERE book = \'GEN\' AND chapter = 1;');
}

// Run the import
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
