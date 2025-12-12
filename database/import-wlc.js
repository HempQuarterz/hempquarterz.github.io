/**
 * Westminster Leningrad Codex (WLC) Import Script
 * Imports Hebrew Old Testament into Supabase database
 *
 * Usage:
 *   node database/import-wlc.js --test              # Import Genesis 1 only
 *   node database/import-wlc.js --book Genesis      # Import specific book
 *   node database/import-wlc.js --full              # Import all books
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

// Book name to abbreviation mapping (standard 3-letter codes)
const BOOK_ABBREVIATIONS = {
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  'I Samuel': '1SA',
  'II Samuel': '2SA',
  'I Kings': '1KI',
  'II Kings': '2KI',
  'I Chronicles': '1CH',
  'II Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Solomon': 'SNG',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Ezekiel': 'EZK',
  'Daniel': 'DAN',
  'Hosea': 'HOS',
  'Joel': 'JOL',
  'Amos': 'AMO',
  'Obadiah': 'OBA',
  'Jonah': 'JON',
  'Micah': 'MIC',
  'Nahum': 'NAM',
  'Habakkuk': 'HAB',
  'Zephaniah': 'ZEP',
  'Haggai': 'HAG',
  'Zechariah': 'ZEC',
  'Malachi': 'MAL'
};

/**
 * Load and parse the morphhb index.js file
 */
function loadWLCData() {
  console.log('📖 Loading WLC data from morphhb...');

  const wlcPath = path.join(__dirname, '../../manuscripts/hebrew/wlc/index.js');

  if (!fs.existsSync(wlcPath)) {
    console.error(`❌ WLC data not found at: ${wlcPath}`);
    console.error('   Please run: git clone https://github.com/openscriptures/morphhb.git manuscripts/hebrew/wlc');
    process.exit(1);
  }

  // Read and evaluate the JavaScript file
  const fileContent = fs.readFileSync(wlcPath, 'utf-8');

  // Extract the morphhb object (it's: var morphhb={...})
  // Use brace-matching to find the exact JSON object
  const startIndex = fileContent.indexOf('={') + 1; // Position of opening brace

  let braceCount = 0;
  let endIndex = startIndex;
  let foundStart = false;

  // Find the matching closing brace
  for (let i = startIndex; i < fileContent.length; i++) {
    const char = fileContent[i];

    if (char === '{') {
      braceCount++;
      foundStart = true;
    } else if (char === '}') {
      braceCount--;

      // When we return to 0, we've found the matching closing brace
      if (foundStart && braceCount === 0) {
        endIndex = i + 1; // Include the closing brace
        break;
      }
    }
  }

  const jsonString = fileContent.substring(startIndex, endIndex);

  // Parse the JSON
  let morphhb;
  try {
    morphhb = JSON.parse(jsonString);
  } catch (err) {
    console.error('❌ Could not parse morphhb JSON:', err.message);
    console.error(`   Extracted ${jsonString.length} characters`);
    console.error(`   First 100 chars: ${jsonString.substring(0, 100)}`);
    console.error(`   Last 100 chars: ${jsonString.substring(jsonString.length - 100)}`);
    process.exit(1);
  }

  console.log(`✅ Loaded ${Object.keys(morphhb).length} books from WLC`);

  return morphhb;
}

/**
 * Insert or get the WLC manuscript record
 */
async function ensureManuscript() {
  console.log('\n📚 Checking manuscript record...');

  // Check if WLC manuscript exists
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WLC')
    .single();

  if (existing) {
    console.log('✅ WLC manuscript record exists');
    return existing.id;
  }

  // Create manuscript record
  const { data, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'WLC',
      name: 'Westminster Leningrad Codex',
      language: 'hebrew',
      description: 'Masoretic Text of the Hebrew Bible based on the Leningrad Codex (~1008 CE)',
      source_url: 'https://github.com/openscriptures/morphhb',
      license: 'CC BY 4.0',
      date_range: '1000 CE'
    })
    .select('id')
    .single();

  if (error) {
    console.error('❌ Failed to create manuscript record:', error);
    process.exit(1);
  }

  console.log('✅ Created WLC manuscript record');
  return data.id;
}

/**
 * Parse a verse array into text and Strong's numbers
 */
function parseVerse(verseArray) {
  const words = [];
  const strongNumbers = [];

  for (const word of verseArray) {
    // Each word is: [hebrew_text, strong_number, morphology]
    const [hebrewText, strongNum] = word;

    words.push(hebrewText);

    // Extract Strong's numbers (can be compound like "H3068" or "Hc/H1961")
    const nums = strongNum.match(/H\d+/g);
    if (nums) {
      strongNumbers.push(...nums);
    }
  }

  return {
    text: words.join(' '),
    strongNumbers: [...new Set(strongNumbers)] // Remove duplicates
  };
}

/**
 * Import a single book
 */
async function importBook(manuscriptId, bookName, bookData) {
  const bookCode = BOOK_ABBREVIATIONS[bookName];

  if (!bookCode) {
    console.warn(`⚠️  Unknown book: ${bookName} (skipping)`);
    return { success: 0, failed: 0 };
  }

  console.log(`\n📖 Importing ${bookName} (${bookCode})...`);

  let successCount = 0;
  let failedCount = 0;
  const verses = [];

  // Iterate through chapters and verses
  for (let chapterIndex = 0; chapterIndex < bookData.length; chapterIndex++) {
    const chapter = bookData[chapterIndex];
    const chapterNum = chapterIndex + 1;

    for (let verseIndex = 0; verseIndex < chapter.length; verseIndex++) {
      const verseData = chapter[verseIndex];
      const verseNum = verseIndex + 1;

      const { text, strongNumbers } = parseVerse(verseData);

      verses.push({
        manuscript_id: manuscriptId,
        book: bookCode,
        chapter: chapterNum,
        verse: verseNum,
        text: text,
        strong_numbers: strongNumbers
      });
    }
  }

  // Batch insert verses (chunks of 100 for performance)
  const BATCH_SIZE = 100;
  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('verses')
      .insert(batch);

    if (error) {
      console.error(`❌ Failed to insert batch starting at verse ${i}:`, error.message);
      failedCount += batch.length;
    } else {
      successCount += batch.length;
      process.stdout.write(`\r   Progress: ${successCount}/${verses.length} verses`);
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

  console.log('🔥 Westminster Leningrad Codex Import Tool\n');

  if (mode === '--help' || !mode) {
    console.log('Usage:');
    console.log('  node database/import-wlc.js --test              # Import Genesis 1 only');
    console.log('  node database/import-wlc.js --book Genesis      # Import specific book');
    console.log('  node database/import-wlc.js --full              # Import all books');
    process.exit(0);
  }

  // Load WLC data
  const morphhb = loadWLCData();

  // Ensure manuscript record exists
  const manuscriptId = await ensureManuscript();

  let totalSuccess = 0;
  let totalFailed = 0;

  if (mode === '--test') {
    console.log('\n🧪 TEST MODE: Importing Genesis chapter 1 only\n');

    // Import just Genesis
    const genesisData = morphhb['Genesis'];
    if (!genesisData) {
      console.error('❌ Genesis not found in WLC data');
      process.exit(1);
    }

    // Limit to chapter 1
    const chapter1Only = [genesisData[0]];
    const stats = await importBook(manuscriptId, 'Genesis', chapter1Only);

    totalSuccess = stats.success;
    totalFailed = stats.failed;

  } else if (mode === '--book') {
    const bookName = args[1];
    if (!bookName) {
      console.error('❌ Please specify a book name: --book Genesis');
      process.exit(1);
    }

    const bookData = morphhb[bookName];
    if (!bookData) {
      console.error(`❌ Book "${bookName}" not found in WLC data`);
      console.log('\nAvailable books:', Object.keys(morphhb).join(', '));
      process.exit(1);
    }

    const stats = await importBook(manuscriptId, bookName, bookData);
    totalSuccess = stats.success;
    totalFailed = stats.failed;

  } else if (mode === '--full') {
    console.log('\n📚 FULL IMPORT: Importing all 39 OT books\n');

    const bookNames = Object.keys(morphhb);

    for (const bookName of bookNames) {
      const bookData = morphhb[bookName];
      const stats = await importBook(manuscriptId, bookName, bookData);

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
  console.log('  2. Test query: SELECT * FROM verses WHERE book = \'GEN\' AND chapter = 1 LIMIT 5;');
}

// Run the import
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
