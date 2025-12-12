/**
 * Vulgate Latin Bible Import Script
 * Imports the Latin Vulgate from JSON format
 *
 * Source: emilekm2142/vulgate-bible-full-text
 * License: Public Domain
 * Format: JSON with structure: {"BookName": [[chapter1_verses], [chapter2_verses]]}
 *
 * Usage:
 *   node database/import-vulgate.js --test    # Import first 5 verses from Genesis
 *   node database/import-vulgate.js --book Genesis  # Import one book
 *   node database/import-vulgate.js --full    # Import entire Vulgate
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

// English book names to WEB-style abbreviations mapping
const BOOK_MAP = {
  // Old Testament
  'Genesis': 'GEN',
  'Exodus': 'EXO',
  'Leviticus': 'LEV',
  'Numbers': 'NUM',
  'Deuteronomy': 'DEU',
  'Joshua': 'JOS',
  'Judges': 'JDG',
  'Ruth': 'RUT',
  '1 Samuel': '1SA',
  '2 Samuel': '2SA',
  '1 Kings': '1KI',
  '2 Kings': '2KI',
  '1 Chronicles': '1CH',
  '2 Chronicles': '2CH',
  'Ezra': 'EZR',
  'Nehemiah': 'NEH',
  'Tobias': 'TOB',  // Tobit
  'Judith': 'JDT',
  'Esther': 'EST',
  'Job': 'JOB',
  'Psalms': 'PSA',
  'Proverbs': 'PRO',
  'Ecclesiastes': 'ECC',
  'Song of Solomon': 'SNG',
  'Wisdom': 'WIS',
  'Sirach': 'SIR',
  'Isaiah': 'ISA',
  'Jeremiah': 'JER',
  'Lamentations': 'LAM',
  'Baruch': 'BAR',
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
  'Malachi': 'MAL',
  '1 Macabees': '1MA',  // 1 Maccabees
  '2 Macabees': '2MA',  // 2 Maccabees

  // New Testament
  'Matthew': 'MAT',
  'Mark': 'MRK',
  'Luke': 'LUK',
  'John': 'JHN',
  'Acts': 'ACT',
  'Romans': 'ROM',
  '1 Corinthians': '1CO',
  '2 Corinthians': '2CO',
  'Galatians': 'GAL',
  'Ephesians': 'EPH',
  'Philippians': 'PHP',
  'Colossians': 'COL',
  '1 Thessalonians': '1TH',
  '2 Thessalonians': '2TH',
  '1 Timothy': '1TI',
  '2 Timothy': '2TI',
  'Titus': 'TIT',
  'Philemon': 'PHM',
  'Hebrews': 'HEB',
  'James': 'JAS',
  '1 Peter': '1PE',
  '2 Peter': '2PE',
  '1 John': '1JN',
  '2 John': '2JN',
  '3 John': '3JN',
  'Jude': 'JUD',
  'Revelation': 'REV'
};

/**
 * Get or create Vulgate manuscript entry
 */
async function getManuscriptId() {
  console.log('📚 Checking for Vulgate manuscript entry...');

  const { data: existing, error: fetchError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'VUL')
    .single();

  if (existing) {
    console.log(`✅ Found existing Vulgate manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry
  const { data: newManuscript, error: insertError } = await supabase
    .from('manuscripts')
    .insert({
      code: 'VUL',
      name: 'Clementine Vulgate',
      language: 'latin',
      date_range: '~400 CE',
      license: 'Public Domain',
      description: 'Jerome\'s Latin translation of the Bible, Clementine edition'
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create manuscript: ${insertError.message}`);
  }

  console.log(`✅ Created Vulgate manuscript entry (ID: ${newManuscript.id})`);
  return newManuscript.id;
}

/**
 * Parse Vulgate JSON and extract verses
 */
function parseVulgateJSON(jsonPath, bookFilter = null) {
  console.log(`📖 Reading Vulgate JSON from ${jsonPath}...`);

  const rawData = fs.readFileSync(jsonPath, 'utf8');
  const bibleData = JSON.parse(rawData);

  const verses = [];
  let totalVerses = 0;

  for (const [bookName, chapters] of Object.entries(bibleData)) {
    // Skip if filtering by book and this isn't the target
    if (bookFilter && bookName !== bookFilter) {
      continue;
    }

    // Try to find book code
    const bookCode = BOOK_MAP[bookName];
    if (!bookCode) {
      console.log(`⚠️  Unknown book name: "${bookName}" - skipping`);
      continue;
    }

    console.log(`\n📕 Processing ${bookName} (${bookCode})...`);

    // Process each chapter
    chapters.forEach((chapterVerses, chapterIndex) => {
      const chapterNum = chapterIndex + 1;  // 0-indexed to 1-indexed

      // Process each verse in the chapter
      chapterVerses.forEach((verseText, verseIndex) => {
        const verseNum = verseIndex + 1;  // 0-indexed to 1-indexed

        // Skip empty verses (some chapters end with empty string)
        if (!verseText.trim()) {
          return;
        }

        verses.push({
          book: bookCode,
          chapter: chapterNum,
          verse: verseNum,
          text: verseText.trim()
        });

        totalVerses++;
      });
    });

    console.log(`   ✅ Extracted ${verses.length} verses from ${bookName}`);
  }

  console.log(`\n📊 Total verses extracted: ${totalVerses}`);
  return verses;
}

/**
 * Import verses to database
 */
async function importVerses(manuscriptId, verses) {
  console.log(`\n📥 Importing ${verses.length} verses to database...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    // Add manuscript_id to each verse
    const versesWithManuscript = batch.map(v => ({
      ...v,
      manuscript_id: manuscriptId,
      morphology: null  // Vulgate doesn't have morphology data
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(versesWithManuscript, {
        onConflict: 'manuscript_id,book,chapter,verse'
      });

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n\n✅ Import complete: ${imported} verses imported, ${failed} failed`);
  return { imported, failed };
}

/**
 * Verify import
 */
async function verifyImport(manuscriptId) {
  console.log('\n🔍 Verifying import...');

  const { count, error } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId);

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  console.log(`✅ Total Vulgate verses in database: ${count}`);

  // Sample some verses
  const { data: samples, error: sampleError } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .in('book', ['GEN', 'MAT', 'JHN'])
    .eq('chapter', 1)
    .lte('verse', 3)
    .order('book')
    .order('chapter')
    .order('verse');

  if (!sampleError && samples) {
    console.log('\n📋 Sample verses:');
    samples.forEach(v => {
      const displayText = v.text.length > 80 ? v.text.substring(0, 80) + '...' : v.text;
      console.log(`${v.book} ${v.chapter}:${v.verse} - ${displayText}`);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');
  const bookIndex = args.indexOf('--book');
  const bookFilter = bookIndex !== -1 ? args[bookIndex + 1] : null;

  console.log('📖 Vulgate Latin Bible Import Tool');
  console.log('='.repeat(70));

  if (testMode) {
    console.log('🧪 TEST MODE: Will import first 5 verses from Genesis only\n');
  } else if (bookFilter) {
    console.log(`📕 BOOK MODE: Will import ${bookFilter} only\n`);
  } else if (fullMode) {
    console.log('🌍 FULL MODE: Will import entire Vulgate (~31,000 verses)\n');
  } else {
    console.log('ℹ️  Usage:');
    console.log('  --test          Import first 5 verses (Genesis 1:1-5)');
    console.log('  --book Genesis  Import one book');
    console.log('  --full          Import entire Vulgate\n');
    process.exit(0);
  }

  // Get manuscript ID
  const manuscriptId = await getManuscriptId();

  // Parse JSON
  const jsonPath = path.join(__dirname, '../../manuscripts/vulgate/vulgate-bible-full-text/bible.json');
  const verses = parseVulgateJSON(jsonPath, bookFilter);

  if (verses.length === 0) {
    console.log('\n⚠️  No verses found. Check book name or JSON file.');
    process.exit(1);
  }

  // Limit to 5 verses in test mode
  const versesToImport = testMode ? verses.slice(0, 5) : verses;

  // Import verses
  const { imported, failed } = await importVerses(manuscriptId, versesToImport);

  // Verify
  await verifyImport(manuscriptId);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Manuscript: Clementine Vulgate (Latin)`);
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log(`📚 Database now contains Vulgate Latin text`);

  if (testMode) {
    console.log('\n⏭️  Next: Run with --full to import entire Vulgate');
  } else if (bookFilter) {
    console.log('\n⏭️  Next: Run with --full to import all books');
  } else {
    console.log('\n🎉 Vulgate import complete!');
    console.log('⏭️  Next steps:');
    console.log('1. Import Textus Receptus (Greek NT)');
    console.log('2. Import LXX Septuagint (Greek OT)');
    console.log('3. Update MANUSCRIPT_SOURCES_STATUS.md');
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
