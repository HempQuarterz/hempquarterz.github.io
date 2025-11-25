/**
 * Import Peshitta (Aramaic Old Testament)
 *
 * The Peshitta is the standard Syriac/Aramaic translation of the Bible,
 * used by Syriac Christians since the 2nd century CE.
 *
 * This script imports the OT from the Text-Fabric Peshitta corpus.
 *
 * Usage:
 *   node database/import-peshitta.js [--test] [--book GEN] [--full]
 *
 * Options:
 *   --test: Only import Genesis 1 (for testing)
 *   --book: Import specific book (GEN, EXO, etc.)
 *   --full: Import all books
 */

const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Supabase client
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Book mapping: File name -> All4Yah code
const BOOK_MAP = {
  // Torah (Pentateuch)
  'Genesis.txt': 'GEN',
  'Exodus.txt': 'EXO',
  'Leviticus.txt': 'LEV',
  'Numbers.txt': 'NUM',
  'Deuteronomy.txt': 'DEU',

  // Historical Books
  'Joshua.txt': 'JOS',
  'Judges.txt': 'JDG',
  'Ruth.txt': 'RUT',
  'Samuel_1.txt': '1SA',
  'Samuel_2.txt': '2SA',
  'Kings_1.txt': '1KI',
  'Kings_2.txt': '2KI',
  'Chronicles_1.txt': '1CH',
  'Chronicles_2.txt': '2CH',
  'Ezra.txt': 'EZR',
  'Nehemia.txt': 'NEH',
  'Esther.txt': 'EST',

  // Wisdom & Poetry
  'Job.txt': 'JOB',
  'Psalms.txt': 'PSA',
  'Proverbs.txt': 'PRO',
  'Ecclesiastes.txt': 'ECC',
  'Song_of_Songs.txt': 'SNG',

  // Major Prophets
  'Isaiah.txt': 'ISA',
  'Jeremiah.txt': 'JER',
  'Lamentations.txt': 'LAM',
  'Ezekiel.txt': 'EZK',
  'Daniel.txt': 'DAN',

  // Minor Prophets
  'Hosea.txt': 'HOS',
  'Joel.txt': 'JOL',
  'Amos.txt': 'AMO',
  'Obadiah.txt': 'OBA',
  'Jonah.txt': 'JON',
  'Micah.txt': 'MIC',
  'Nahum.txt': 'NAM',
  'Habakkuk.txt': 'HAB',
  'Zephaniah.txt': 'ZEP',
  'Haggai.txt': 'HAG',
  'Zechariah.txt': 'ZEC',
  'Malachi.txt': 'MAL',

  // Deuterocanonical / Apocrypha
  'Tobit_A.txt': 'TOB',
  'Judith.txt': 'JDT',
  'Wisdom_of_Solomon.txt': 'WIS',
  'Sirach.txt': 'SIR',
  'Baruch.txt': 'BAR',
  'Letter_of_Jeremiah.txt': 'LJE',
  'Maccabees_1_A.txt': '1MA',
  'Maccabees_2.txt': '2MA',
  'Maccabees_3.txt': '3MA',
  'Maccabees_4.txt': '4MA',
  'Esdras_3.txt': '1ES',
  'Esdras_4.txt': '2ES',
  'Prayer_of_Manasseh_A.txt': 'MAN',
  'Psalms_of_Solomon.txt': 'PSS',
  'Susanna.txt': 'SUS',
  'Bel_and_the_Dragon.txt': 'BEL'
};

// Path to Peshitta text files
const PESHITTA_DIR = path.join(__dirname, '..', 'manuscripts', 'peshitta', 'peshitta', 'plain', '0.2');

// Statistics
const stats = {
  books: 0,
  chapters: 0,
  verses: 0,
  errors: 0
};

/**
 * Parse Peshitta text file
 * Format:
 *   Chapter 1
 *
 *   1 ܒܪܫܝܬ ܒܪܐ ܐܠܗܐ...
 *   2 ܐܪܥܐ ܗܘܬ ܬܘܗ...
 */
function parsePeshittaFile(filePath, bookCode) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  const verses = [];
  let currentChapter = null;

  for (const line of lines) {
    const trimmed = line.trim();

    // Skip empty lines
    if (!trimmed) continue;

    // Check for chapter header: "Chapter 1", "Chapter 2", etc.
    const chapterMatch = trimmed.match(/^Chapter (\d+)$/);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1]);
      continue;
    }

    // Check for verse: starts with number followed by Syriac text
    // Format: "1 ܒܪܫܝܬ..." or "12 ܘܐܡ̣ܪ..."
    const verseMatch = trimmed.match(/^(\d+)\s+([\u0700-\u074F].+)$/);
    if (verseMatch && currentChapter !== null) {
      const verseNum = parseInt(verseMatch[1]);
      const verseText = verseMatch[2].trim();

      verses.push({
        book: bookCode,
        chapter: currentChapter,
        verse: verseNum,
        text: verseText
      });
    }
  }

  return verses;
}

/**
 * Get or create manuscript record
 */
async function ensureManuscript() {
  // Check if PESHITTA already exists
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'PESHITTA')
    .single();

  if (existing) {
    console.log('✓ Manuscript PESHITTA already exists (ID: ' + existing.id + ')');
    return existing.id;
  }

  // Insert new manuscript
  const { data, error} = await supabase
    .from('manuscripts')
    .insert([{
      code: 'PESHITTA',
      name: 'Peshitta (Syriac/Aramaic OT)',
      language: 'aramaic',
      date_range: '2nd-5th century CE',
      description: 'The standard Syriac/Aramaic translation of the Old Testament, used by Syriac Christians since the 2nd century CE.',
      source_url: 'https://github.com/ETCBC/peshitta',
      license: 'CC BY 4.0'
    }])
    .select('id')
    .single();

  if (error) throw error;

  console.log('✓ Created manuscript PESHITTA (ID: ' + data.id + ')');
  return data.id;
}

/**
 * Import verses for a book
 */
async function importBook(bookCode, manuscriptId) {
  // Find the file for this book
  const fileName = Object.keys(BOOK_MAP).find(key => BOOK_MAP[key] === bookCode);
  if (!fileName) {
    console.error(`✗ No file mapping for book code: ${bookCode}`);
    return;
  }

  const filePath = path.join(PESHITTA_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.error(`✗ File not found: ${filePath}`);
    return;
  }

  console.log(`\n📖 Importing ${bookCode} from ${fileName}...`);

  // Parse the file
  const verses = parsePeshittaFile(filePath, bookCode);

  if (verses.length === 0) {
    console.log(`  ⚠️  No verses found in ${fileName}`);
    return;
  }

  // Get unique chapters
  const chapters = new Set(verses.map(v => v.chapter));
  console.log(`  Found ${verses.length} verses across ${chapters.size} chapters`);

  // Batch insert (1000 verses at a time)
  const batchSize = 1000;
  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);
    const rows = batch.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      morphology: null
    }));

    const { error } = await supabase
      .from('verses')
      .insert(rows);

    if (error) {
      console.error(`  ✗ Error inserting batch ${i}-${i + batch.length}:`, error.message);
      stats.errors++;
    } else {
      console.log(`  ✓ Inserted verses ${i + 1}-${Math.min(i + batchSize, verses.length)}`);
    }
  }

  stats.books++;
  stats.chapters += chapters.size;
  stats.verses += verses.length;

  console.log(`✓ Completed ${bookCode}: ${verses.length} verses`);
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const isFull = args.includes('--full');
  const bookArg = args.find(arg => arg.startsWith('--book='));
  const specificBook = bookArg ? bookArg.split('=')[1] : null;

  console.log('='.repeat(60));
  console.log('PESHITTA (ARAMAIC OT) IMPORT');
  console.log('='.repeat(60));

  // Ensure manuscript record exists
  const manuscriptId = await ensureManuscript();

  if (isTest) {
    console.log('\n🧪 TEST MODE: Importing Genesis 1 only\n');

    // Parse just Genesis
    const filePath = path.join(PESHITTA_DIR, 'Genesis.txt');
    const allVerses = parsePeshittaFile(filePath, 'GEN');
    const testVerses = allVerses.filter(v => v.chapter === 1);

    console.log(`Found ${testVerses.length} verses in Genesis 1`);

    const rows = testVerses.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      morphology: null
    }));

    const { error } = await supabase
      .from('verses')
      .insert(rows);

    if (error) {
      console.error('✗ Error:', error.message);
    } else {
      console.log(`✓ Successfully imported ${testVerses.length} verses`);
      console.log('\nSample verse (Genesis 1:1):');
      console.log(testVerses[0].text);
    }

  } else if (specificBook) {
    console.log(`\n📚 Importing specific book: ${specificBook}\n`);
    await importBook(specificBook, manuscriptId);

  } else if (isFull) {
    console.log('\n📚 FULL IMPORT: All Peshitta books\n');

    const bookCodes = Object.values(BOOK_MAP);
    console.log(`Total books to import: ${bookCodes.length}\n`);

    for (const bookCode of bookCodes) {
      await importBook(bookCode, manuscriptId);
      // Small delay to avoid overwhelming database
      await new Promise(resolve => setTimeout(resolve, 100));
    }

  } else {
    console.log('\nUsage:');
    console.log('  node database/import-peshitta.js --test        # Import Genesis 1 only');
    console.log('  node database/import-peshitta.js --book=GEN    # Import specific book');
    console.log('  node database/import-peshitta.js --full        # Import all books');
    process.exit(0);
  }

  console.log('\n' + '='.repeat(60));
  console.log('IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Books imported:    ${stats.books}`);
  console.log(`Chapters imported: ${stats.chapters}`);
  console.log(`Verses imported:   ${stats.verses}`);
  console.log(`Errors:            ${stats.errors}`);
  console.log('='.repeat(60));
}

// Run import
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
