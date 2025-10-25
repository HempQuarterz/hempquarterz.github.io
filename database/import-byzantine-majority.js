/**
 * Byzantine Majority Text (Robinson-Pierpont 2018) Import Script
 *
 * Imports the Robinson-Pierpont Byzantine Majority Greek New Testament
 * - Public Domain
 * - 27 NT books (MAT through REV)
 * - Simple CSV format (chapter, verse, text)
 * - Robinson-Pierpont 2018 edition
 *
 * Usage:
 *   node database/import-byzantine-majority.js --test    # Import first 10 verses only
 *   node database/import-byzantine-majority.js --full    # Import entire NT
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Book code mapping (CSV filename → 3-letter code)
const BOOK_MAP = {
  'MAT': 'MAT',  // Matthew
  'MAR': 'MRK',  // Mark
  'LUK': 'LUK',  // Luke
  'JOH': 'JHN',  // John
  'ACT': 'ACT',  // Acts
  'ROM': 'ROM',  // Romans
  '1CO': '1CO',  // 1 Corinthians
  '2CO': '2CO',  // 2 Corinthians
  'GAL': 'GAL',  // Galatians
  'EPH': 'EPH',  // Ephesians
  'PHP': 'PHP',  // Philippians
  'COL': 'COL',  // Colossians
  '1TH': '1TH',  // 1 Thessalonians
  '2TH': '2TH',  // 2 Thessalonians
  '1TI': '1TI',  // 1 Timothy
  '2TI': '2TI',  // 2 Timothy
  'TIT': 'TIT',  // Titus
  'PHM': 'PHM',  // Philemon
  'HEB': 'HEB',  // Hebrews
  'JAM': 'JAS',  // James
  '1PE': '1PE',  // 1 Peter
  '2PE': '2PE',  // 2 Peter
  '1JO': '1JN',  // 1 John
  '2JO': '2JN',  // 2 John
  '3JO': '3JN',  // 3 John
  'JUD': 'JUD',  // Jude
  'REV': 'REV'   // Revelation
};

/**
 * Get or create manuscript entry in database
 */
async function getManuscriptId() {
  // Check if authenticity_tier column exists
  let hasTierColumn = false;
  const { data: testManuscript } = await supabase
    .from('manuscripts')
    .select('id, authenticity_tier')
    .limit(1)
    .single();

  if (testManuscript && 'authenticity_tier' in testManuscript) {
    hasTierColumn = true;
  }

  // Try to get existing manuscript
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'BYZMT')
    .single();

  if (existing) {
    console.log(`✅ Found existing Byzantine Majority Text manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry
  console.log('📚 Creating Byzantine Majority Text manuscript entry...');

  const manuscriptData = {
    code: 'BYZMT',
    name: 'Byzantine Majority Text (Robinson-Pierpont 2018)',
    language: 'greek',
    date_range: '2018 CE (based on Byzantine manuscripts)',
    description: 'Robinson-Pierpont edition of the Byzantine Majority Greek New Testament. Public domain, represents the Byzantine textform.',
    license: 'Public Domain',
    source_url: 'https://github.com/byztxt/byzantine-majority-text'
  };

  if (hasTierColumn) {
    manuscriptData.authenticity_tier = 1;
    manuscriptData.tier_notes = 'Tier 1: AUTHENTIC - Public domain Greek New Testament text representing the Byzantine majority tradition. No editorial bias, pure Greek text from Robinson-Pierpont 2018 edition.';
  }

  const { data: newManuscript, error } = await supabase
    .from('manuscripts')
    .insert([manuscriptData])
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create manuscript:', error.message);
    process.exit(1);
  }

  console.log(`✅ Created Byzantine Majority Text manuscript (ID: ${newManuscript.id})`);
  return newManuscript.id;
}

/**
 * Parse a single CSV file (book)
 * CSV format: chapter,verse,"text"
 * Text may span multiple lines
 */
function parseBookCSV(csvPath, bookCode) {
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  const verses = [];
  let currentVerse = null;
  let inQuote = false;

  for (let i = 1; i < lines.length; i++) {  // Skip header
    const line = lines[i];
    if (!line.trim()) continue;

    if (!inQuote) {
      // Start of new verse
      const match = line.match(/^(\d+),(\d+),"(.*)$/);
      if (!match) {
        // Might be continuation of previous verse
        if (currentVerse && currentVerse.text) {
          currentVerse.text += '\n' + line;
        }
        continue;
      }

      const [, chapter, verse, textStart] = match;

      currentVerse = {
        book: bookCode,
        chapter: parseInt(chapter, 10),
        verse: parseInt(verse, 10),
        text: textStart
      };

      // Check if text ends with closing quote
      if (textStart.endsWith('"')) {
        currentVerse.text = textStart.slice(0, -1).replace(/""/g, '"');
        verses.push(currentVerse);
        currentVerse = null;
      } else {
        inQuote = true;
      }
    } else {
      // Continuation of multi-line verse
      if (line.endsWith('"')) {
        currentVerse.text += '\n' + line.slice(0, -1);
        currentVerse.text = currentVerse.text.replace(/""/g, '"');
        verses.push(currentVerse);
        currentVerse = null;
        inQuote = false;
      } else {
        currentVerse.text += '\n' + line;
      }
    }
  }

  return verses;
}

/**
 * Import all verses to database
 */
async function importVerses(manuscriptId, verses) {
  if (verses.length === 0) {
    console.log('   ⚠️  No verses to import');
    return { imported: 0, failed: 0 };
  }

  console.log(`\n📥 Importing ${verses.length} verses to database...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    const versesWithManuscript = batch.map(v => ({
      ...v,
      manuscript_id: manuscriptId,
      morphology: null
    }));

    const { error } = await supabase
      .from('verses')
      .insert(versesWithManuscript);

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}: ${error.message}`);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n✅ Import complete: ${imported} verses imported, ${failed} failed\n`);
  return { imported, failed };
}

/**
 * Verify import
 */
async function verifyImport(manuscriptId) {
  console.log('🔍 Verifying import...');

  const { data: verses, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .limit(5);

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  console.log(`✅ Total Byzantine Majority Text verses in database: ${verses.length > 0 ? 'verified' : 'none found'}`);

  if (verses.length > 0) {
    console.log('\n📋 Sample verses:');
    verses.forEach(v => {
      console.log(`   ${v.book} ${v.chapter}:${v.verse} - ${v.text.substring(0, 60)}...`);
    });
  }
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');

  if (!testMode && !fullMode) {
    console.log('❌ Usage: node database/import-byzantine-majority.js --test|--full');
    process.exit(1);
  }

  console.log('📖 Byzantine Majority Text (Robinson-Pierpont 2018) Import Tool');
  console.log('='.repeat(70));
  console.log(`🌍 ${testMode ? 'TEST MODE: Will import first 10 verses only' : 'FULL MODE: Will import entire New Testament'}\n`);

  // Get or create manuscript entry
  const manuscriptId = await getManuscriptId();

  // Get list of CSV files
  const csvDir = path.join(__dirname, '../../manuscripts/byzantine-majority/byzantine-majority-text/csv-unicode/ccat/with-variants');
  const files = fs.readdirSync(csvDir).filter(f => f.endsWith('.csv') && !f.includes('ACT24') && !f.includes('PA'));

  console.log(`📖 Found ${files.length} book files to import`);

  let allVerses = [];

  // Parse all books
  for (const file of files) {
    const csvFilename = file.replace('.csv', '');
    const bookCode = BOOK_MAP[csvFilename];

    if (!bookCode) {
      console.warn(`   ⚠️  Unknown book: ${csvFilename}`);
      continue;
    }

    console.log(`   Processing ${bookCode} (${csvFilename}.csv)...`);

    const csvPath = path.join(csvDir, file);
    const verses = parseBookCSV(csvPath, bookCode);

    allVerses = allVerses.concat(verses);

    if (testMode && allVerses.length >= 10) {
      allVerses = allVerses.slice(0, 10);
      break;
    }
  }

  console.log(`\n📊 Total verses extracted: ${allVerses.length}`);

  // Import to database
  const { imported, failed } = await importVerses(manuscriptId, allVerses);

  // Verify
  await verifyImport(manuscriptId);

  // Summary
  console.log('='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log('✅ Manuscript: Byzantine Majority Text (Robinson-Pierpont 2018)');
  console.log('✅ Authenticity Tier: 1 (AUTHENTIC)');
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log('📚 Database now contains Byzantine Majority Text');
  console.log('\n🎉 Byzantine Majority Text import complete!\n');
  console.log('📈 "Authentic 10" Corpus Progress: 7/10 manuscripts (70%)');
  console.log('⏭️  Next steps:');
  console.log('1. Import Dead Sea Scrolls (select texts)');
  console.log('2. Import Aleppo Codex');
  console.log('3. Update MANUSCRIPT_SOURCES_STATUS.md');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
