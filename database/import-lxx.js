/**
 * Import Septuagint (LXX) - Greek Old Testament
 * Source: Rahlfs' Septuagint
 * License: Public Domain
 *
 * To use this script:
 * 1. Download LXX data from https://github.com/sleeptillseven/LXX-Swete
 * 2. Extract to ../../manuscripts/septuagint/lxx-swete/
 * 3. Run: node database/import-lxx.js [--test|--book NUM|--full]
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

// Supabase setup
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Book mapping (OT books only for LXX)
const BOOK_MAPPING = {
  'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
  'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT', '1Sam': '1SA', '2Sam': '2SA',
  '1Kgs': '1KI', '2Kgs': '2KI', '1Chr': '1CH', '2Chr': '2CH',
  'Ezra': 'EZR', 'Neh': 'NEH', 'Esth': 'EST',
  'Job': 'JOB', 'Ps': 'PSA', 'Prov': 'PRO', 'Eccl': 'ECC', 'Song': 'SNG',
  'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM', 'Ezek': 'EZK', 'Dan': 'DAN',
  'Hos': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obad': 'OBA', 'Jonah': 'JON',
  'Mic': 'MIC', 'Nah': 'NAM', 'Hab': 'HAB', 'Zeph': 'ZEP', 'Hag': 'HAG',
  'Zech': 'ZEC', 'Mal': 'MAL'
};

/**
 * Parse LXX verse from text format
 * Expected format varies by source, this is a generic parser
 */
function parseLXXVerse(line) {
  // Example format: "Gen 1:1 Ἐν ἀρχῇ ἐποίησεν ὁ θεὸς τὸν οὐρανὸν καὶ τὴν γῆν."
  const match = line.match(/^(\w+)\s+(\d+):(\d+)\s+(.+)$/);

  if (!match) {
    return null;
  }

  const [, book, chapter, verse, text] = match;
  const bookCode = BOOK_MAPPING[book];

  if (!bookCode) {
    return null;
  }

  return {
    book: bookCode,
    chapter: parseInt(chapter),
    verse: parseInt(verse),
    text: text.trim()
  };
}

/**
 * Import LXX manuscript metadata
 */
async function createManuscriptRecord() {
  console.log('📖 Creating LXX manuscript record...');

  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'LXX')
    .single();

  if (existing) {
    console.log('✅ LXX manuscript already exists:', existing.id);
    return existing.id;
  }

  const { data, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'LXX',
      name: 'Septuagint (Rahlfs)',
      language: 'greek',
      description: 'Greek translation of the Hebrew Bible (Old Testament), c. 3rd century BCE',
      source_url: 'https://github.com/sleeptillseven/LXX-Swete',
      license: 'Public Domain',
      date_range: '250 BCE - 100 BCE'
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create manuscript: ${error.message}`);
  }

  console.log('✅ Created LXX manuscript:', data.id);
  return data.id;
}

/**
 * Import verses from LXX files
 */
async function importVerses(manuscriptId, options = {}) {
  const { testMode = false, bookFilter = null } = options;

  console.log('📥 Starting LXX verse import...');
  console.log(`   Mode: ${testMode ? 'TEST (Genesis 1 only)' : bookFilter ? `Book filter: ${bookFilter}` : 'FULL IMPORT'}`);

  // Path to LXX data directory
  const lxxDir = path.join(__dirname, '../../manuscripts/septuagint/lxx-swete');

  if (!fs.existsSync(lxxDir)) {
    throw new Error(`LXX directory not found: ${lxxDir}\nPlease download and extract LXX data first.`);
  }

  // For this example, we assume text files named by book (e.g., Genesis.txt)
  const books = testMode
    ? ['Genesis.txt']
    : bookFilter
    ? [`${bookFilter}.txt`]
    : Object.keys(BOOK_MAPPING).map(b => `${b}.txt`);

  let totalVerses = 0;

  for (const bookFile of books) {
    const filePath = path.join(lxxDir, bookFile);

    if (!fs.existsSync(filePath)) {
      console.log(`⚠️  File not found, skipping: ${bookFile}`);
      continue;
    }

    console.log(`\n📖 Processing ${bookFile}...`);

    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n').filter(l => l.trim());

    const verses = [];

    for (const line of lines) {
      const parsed = parseLXXVerse(line);

      if (parsed) {
        verses.push({
          manuscript_id: manuscriptId,
          book: parsed.book,
          chapter: parsed.chapter,
          verse: parsed.verse,
          text: parsed.text,
          strong_numbers: null, // LXX may not have Strong's numbers readily available
          morphology: null
        });
      }

      // Batch insert every 100 verses
      if (verses.length >= 100) {
        const { error } = await supabase
          .from('verses')
          .insert(verses);

        if (error) {
          console.error('Error inserting batch:', error.message);
        } else {
          totalVerses += verses.length;
          process.stdout.write(`   Imported: ${totalVerses} verses\r`);
        }

        verses.length = 0; // Clear batch
      }
    }

    // Insert remaining verses
    if (verses.length > 0) {
      const { error } = await supabase
        .from('verses')
        .insert(verses);

      if (error) {
        console.error('Error inserting final batch:', error.message);
      } else {
        totalVerses += verses.length;
      }
    }

    console.log(`   ✅ Completed ${bookFile}: ${verses.length} verses`);
  }

  console.log(`\n🎉 Import complete! Total verses imported: ${totalVerses}`);
  return totalVerses;
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');
  const bookArg = args.find(arg => arg.startsWith('--book='));
  const bookFilter = bookArg ? bookArg.split('=')[1] : null;

  console.log('🔥 Septuagint (LXX) Import Script');
  console.log('==================================\n');

  try {
    // Create manuscript record
    const manuscriptId = await createManuscriptRecord();

    // Import verses
    const count = await importVerses(manuscriptId, {
      testMode,
      bookFilter
    });

    console.log('\n✅ LXX import completed successfully!');
    console.log(`   Total verses: ${count}`);

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { importVerses, createManuscriptRecord };
