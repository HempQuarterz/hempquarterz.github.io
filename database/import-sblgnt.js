/**
 * SBLGNT (MorphGNT) Greek New Testament Import Script
 * Imports Greek NT from morphgnt.org (SBL Greek New Testament with morphological tagging)
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

// Greek NT book mapping (MorphGNT uses numbers 61-87)
const BOOK_MAP = {
  61: 'MAT', // Matthew
  62: 'MRK', // Mark
  63: 'LUK', // Luke
  64: 'JHN', // John
  65: 'ACT', // Acts
  66: 'ROM', // Romans
  67: '1CO', // 1 Corinthians
  68: '2CO', // 2 Corinthians
  69: 'GAL', // Galatians
  70: 'EPH', // Ephesians
  71: 'PHP', // Philippians
  72: 'COL', // Colossians
  73: '1TH', // 1 Thessalonians
  74: '2TH', // 2 Thessalonians
  75: '1TI', // 1 Timothy
  76: '2TI', // 2 Timothy
  77: 'TIT', // Titus
  78: 'PHM', // Philemon
  79: 'HEB', // Hebrews
  80: 'JAS', // James
  81: '1PE', // 1 Peter
  82: '2PE', // 2 Peter
  83: '1JN', // 1 John
  84: '2JN', // 2 John
  85: '3JN', // 3 John
  86: 'JUD', // Jude
  87: 'REV'  // Revelation
};

const BOOK_NAMES = {
  61: 'Matthew',
  62: 'Mark',
  63: 'Luke',
  64: 'John',
  65: 'Acts',
  66: 'Romans',
  67: '1 Corinthians',
  68: '2 Corinthians',
  69: 'Galatians',
  70: 'Ephesians',
  71: 'Philippians',
  72: 'Colossians',
  73: '1 Thessalonians',
  74: '2 Thessalonians',
  75: '1 Timothy',
  76: '2 Timothy',
  77: 'Titus',
  78: 'Philemon',
  79: 'Hebrews',
  80: 'James',
  81: '1 Peter',
  82: '2 Peter',
  83: '1 John',
  84: '2 John',
  85: '3 John',
  86: 'Jude',
  87: 'Revelation'
};

// File abbreviations used in MorphGNT filenames
const FILE_ABBR = {
  61: 'Mt',
  62: 'Mk',
  63: 'Lk',
  64: 'Jn',
  65: 'Ac',
  66: 'Ro',
  67: '1Co',
  68: '2Co',
  69: 'Ga',
  70: 'Eph',
  71: 'Php',
  72: 'Col',
  73: '1Th',
  74: '2Th',
  75: '1Ti',
  76: '2Ti',
  77: 'Tit',
  78: 'Phm',
  79: 'Heb',
  80: 'Jas',
  81: '1Pe',
  82: '2Pe',
  83: '1Jn',
  84: '2Jn',
  85: '3Jn',
  86: 'Jud',
  87: 'Re'
};

/**
 * Parse a MorphGNT file and extract verses
 * Format: reference pos parsing word normalized lemma lexeme
 */
function parseMorphGNTFile(filePath, bookNum) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const versesMap = new Map(); // Key: "chapter:verse", Value: { words: [], morphology: [] }

  for (const line of lines) {
    if (!line.trim()) continue;

    const parts = line.split(/\s+/);
    if (parts.length < 7) continue;

    const [reference, pos, parsing, word, normalized, lemma, lexeme] = parts;

    // Parse reference (BCCCVV format, but B is just 1 or 2 digit book indicator)
    // For book 61 (Matthew), reference is like "010101" where 01=chapter, 01=verse
    // Skip first 2 digits (book indicator within the file)
    const refStr = reference.padStart(6, '0');
    const chapter = parseInt(refStr.substring(2, 4), 10);
    const verse = parseInt(refStr.substring(4, 6), 10);

    const key = `${chapter}:${verse}`;

    if (!versesMap.has(key)) {
      versesMap.set(key, {
        chapter,
        verse,
        words: [],
        morphology: []
      });
    }

    const verseData = versesMap.get(key);
    verseData.words.push(word);
    verseData.morphology.push({
      word,
      normalized,
      lemma,
      lexeme,
      pos,
      parsing
    });
  }

  // Convert map to array of verse objects
  const verses = [];
  const bookCode = BOOK_MAP[bookNum];

  for (const [key, data] of versesMap) {
    verses.push({
      book: bookCode,
      chapter: data.chapter,
      verse: data.verse,
      text: data.words.join(' '),
      morphology: JSON.stringify(data.morphology)
    });
  }

  // Sort by chapter and verse
  verses.sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });

  return verses;
}

/**
 * Get or create SBLGNT manuscript record
 */
async function getOrCreateManuscript() {
  console.log('📖 Getting/Creating SBLGNT manuscript record...');

  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'SBLGNT')
    .single();

  if (existing) {
    console.log('✓ SBLGNT manuscript already exists');
    return existing.id;
  }

  const { data, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'SBLGNT',
      name: 'SBL Greek New Testament',
      language: 'greek',
      description: 'Society of Biblical Literature Greek New Testament with morphological tagging from MorphGNT project',
      date_range: '2010 CE',
      license: 'CC BY-SA 4.0',
      source_url: 'https://github.com/morphgnt/sblgnt'
    })
    .select('id')
    .single();

  if (error) {
    throw new Error(`Failed to create manuscript: ${error.message}`);
  }

  console.log('✓ Created SBLGNT manuscript record');
  return data.id;
}

/**
 * Import verses in batches
 */
async function importVerses(manuscriptId, verses) {
  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);

    const rows = batch.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      morphology: v.morphology
    }));

    const { error } = await supabase
      .from('verses')
      .insert(rows);

    if (error) {
      throw new Error(`Failed to insert batch: ${error.message}`);
    }

    imported += batch.length;
    process.stdout.write(`\r   Imported: ${imported}/${verses.length} verses`);
  }

  console.log(''); // New line after progress
}

/**
 * Import a single book
 */
async function importBook(manuscriptId, bookNum, bookName) {
  console.log(`\n📖 Importing ${bookName} (${BOOK_MAP[bookNum]})...`);

  const fileName = `${bookNum}-${FILE_ABBR[bookNum]}-morphgnt.txt`;
  const filePath = path.join(
    '/home/hempquarterz/projects/All4Yah/manuscripts/greek_nt/morphgnt',
    fileName
  );

  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    return 0;
  }

  const verses = parseMorphGNTFile(filePath, bookNum);
  console.log(`   Found ${verses.length} verses`);

  await importVerses(manuscriptId, verses);
  console.log(`✓ ${bookName} imported successfully`);

  return verses.length;
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--help';

  console.log('🔥 SBLGNT Greek New Testament Import\n');
  console.log('='.repeat(70));

  if (mode === '--help') {
    console.log('\nUsage:');
    console.log('  node database/import-sblgnt.js --test      # Import John 1 only');
    console.log('  node database/import-sblgnt.js --book 64   # Import specific book (64 = John)');
    console.log('  node database/import-sblgnt.js --full      # Import all 27 NT books');
    console.log('\nAvailable books:');
    for (const [num, name] of Object.entries(BOOK_NAMES)) {
      console.log(`  ${num}: ${name} (${BOOK_MAP[num]})`);
    }
    return;
  }

  const manuscriptId = await getOrCreateManuscript();

  if (mode === '--test') {
    console.log('\n🧪 TEST MODE: Importing John 1 only\n');
    await importBook(manuscriptId, 64, 'John');

    // Verify import
    const { count } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', manuscriptId)
      .eq('book', 'JHN')
      .eq('chapter', 1);

    console.log(`\n✓ Verification: ${count} verses in John 1`);
    console.log('\n🎉 Test import complete!');
    console.log('Run with --full to import all 27 NT books');
  }
  else if (mode === '--book') {
    const bookNum = parseInt(args[1], 10);
    if (!BOOK_MAP[bookNum]) {
      console.error(`❌ Invalid book number: ${bookNum}`);
      console.log('Use --help to see available books');
      process.exit(1);
    }

    await importBook(manuscriptId, bookNum, BOOK_NAMES[bookNum]);
    console.log('\n✓ Import complete!');
  }
  else if (mode === '--full') {
    console.log('\n📚 FULL IMPORT: All 27 New Testament books\n');

    let totalVerses = 0;

    for (const [bookNum, bookName] of Object.entries(BOOK_NAMES)) {
      const count = await importBook(manuscriptId, parseInt(bookNum), bookName);
      totalVerses += count;
    }

    console.log('\n' + '='.repeat(70));
    console.log('📊 IMPORT SUMMARY');
    console.log('='.repeat(70));
    console.log(`Total verses imported: ${totalVerses}`);

    // Verify total
    const { count } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', manuscriptId);

    console.log(`Database verification: ${count} verses`);
    console.log('\n🎉 Full Greek New Testament import complete!');
  }
  else {
    console.log('❌ Unknown mode. Use --help for usage information.');
    process.exit(1);
  }
}

// Run import
main().catch(err => {
  console.error('\n💥 Import failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
