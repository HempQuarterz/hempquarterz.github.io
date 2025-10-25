/**
 * SBLGNT Greek New Testament Verification Script
 * Verifies the integrity of imported Greek NT data
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Expected verse counts for each NT book (standard Greek NT)
const EXPECTED_COUNTS = {
  'MAT': 1071,  // Matthew
  'MRK': 678,   // Mark
  'LUK': 1151,  // Luke
  'JHN': 879,   // John
  'ACT': 1007,  // Acts
  'ROM': 433,   // Romans
  '1CO': 437,   // 1 Corinthians
  '2CO': 257,   // 2 Corinthians
  'GAL': 149,   // Galatians
  'EPH': 155,   // Ephesians
  'PHP': 104,   // Philippians
  'COL': 95,    // Colossians
  '1TH': 89,    // 1 Thessalonians
  '2TH': 47,    // 2 Thessalonians
  '1TI': 113,   // 1 Timothy
  '2TI': 83,    // 2 Timothy
  'TIT': 46,    // Titus
  'PHM': 25,    // Philemon
  'HEB': 303,   // Hebrews
  'JAS': 108,   // James
  '1PE': 105,   // 1 Peter
  '2PE': 61,    // 2 Peter
  '1JN': 105,   // 1 John
  '2JN': 13,    // 2 John
  '3JN': 15,    // 3 John (corrected from 14)
  'JUD': 25,    // Jude
  'REV': 404    // Revelation
};

const BOOK_NAMES = {
  'MAT': 'Matthew',
  'MRK': 'Mark',
  'LUK': 'Luke',
  'JHN': 'John',
  'ACT': 'Acts',
  'ROM': 'Romans',
  '1CO': '1 Corinthians',
  '2CO': '2 Corinthians',
  'GAL': 'Galatians',
  'EPH': 'Ephesians',
  'PHP': 'Philippians',
  'COL': 'Colossians',
  '1TH': '1 Thessalonians',
  '2TH': '2 Thessalonians',
  '1TI': '1 Timothy',
  '2TI': '2 Timothy',
  'TIT': 'Titus',
  'PHM': 'Philemon',
  'HEB': 'Hebrews',
  'JAS': 'James',
  '1PE': '1 Peter',
  '2PE': '2 Peter',
  '1JN': '1 John',
  '2JN': '2 John',
  '3JN': '3 John',
  'JUD': 'Jude',
  'REV': 'Revelation'
};

async function getManuscriptId() {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'SBLGNT')
    .single();

  if (error || !data) {
    throw new Error('SBLGNT manuscript not found');
  }

  return data.id;
}

async function verifyBookCount(manuscriptId, bookCode, expectedCount) {
  const { count, error } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId)
    .eq('book', bookCode);

  if (error) {
    throw new Error(`Failed to count verses for ${bookCode}: ${error.message}`);
  }

  const status = count === expectedCount ? '✓' : '⚠️';
  const diff = count - expectedCount;
  const diffStr = diff !== 0 ? ` (${diff > 0 ? '+' : ''}${diff})` : '';

  console.log(`${status} ${BOOK_NAMES[bookCode].padEnd(20)} ${bookCode.padEnd(5)} ${count.toString().padStart(4)} verses${diffStr}`);

  return count === expectedCount;
}

async function sampleVerse(manuscriptId, book, chapter, verse, expectedSnippet) {
  const { data, error } = await supabase
    .from('verses')
    .select('text, morphology')
    .eq('manuscript_id', manuscriptId)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .single();

  if (error) {
    console.log(`⚠️  ${book} ${chapter}:${verse} - Not found`);
    return false;
  }

  const hasExpected = data.text.includes(expectedSnippet);
  const status = hasExpected ? '✓' : '⚠️';

  console.log(`${status} ${book} ${chapter}:${verse} - ${data.text.substring(0, 60)}...`);

  if (!hasExpected) {
    console.log(`   Expected snippet: "${expectedSnippet}"`);
  }

  // Verify morphology is valid JSON
  try {
    const morphData = JSON.parse(data.morphology);
    if (!Array.isArray(morphData) || morphData.length === 0) {
      console.log(`   ⚠️  Invalid morphology data`);
      return false;
    }
  } catch (err) {
    console.log(`   ⚠️  Morphology parsing error: ${err.message}`);
    return false;
  }

  return hasExpected;
}

async function main() {
  console.log('🔥 SBLGNT Greek New Testament Verification\n');
  console.log('='.repeat(70));

  const manuscriptId = await getManuscriptId();
  console.log('✓ SBLGNT manuscript found\n');

  // Total verse count
  const { count: totalCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId);

  console.log(`Total verses: ${totalCount}\n`);

  // Verify each book
  console.log('📖 Book-by-Book Verification:\n');

  let allPassed = true;
  let totalExpected = 0;

  for (const [bookCode, expectedCount] of Object.entries(EXPECTED_COUNTS)) {
    const passed = await verifyBookCount(manuscriptId, bookCode, expectedCount);
    if (!passed) allPassed = false;
    totalExpected += expectedCount;
  }

  console.log('\n' + '='.repeat(70));
  console.log(`Expected total: ${totalExpected} verses`);
  console.log(`Actual total:   ${totalCount} verses`);
  console.log('='.repeat(70));

  // Sample key verses
  console.log('\n📝 Sample Verse Verification:\n');

  const samples = [
    ['JHN', 1, 1, 'Ἐν ἀρχῇ ἦν ὁ λόγος'], // In the beginning was the Word
    ['JHN', 3, 16, 'οὕτως γὰρ ἠγάπησεν'], // For God so loved
    ['MAT', 1, 1, 'Βίβλος γενέσεως'], // The book of the genealogy
    ['MAT', 28, 19, 'πορευθέντες'], // Go therefore
    ['LUK', 2, 14, 'Δόξα ἐν ὑψίστοις'], // Glory to God in the highest
    ['ROM', 8, 28, 'πάντα συνεργεῖ'], // All things work together
    ['1CO', 13, 13, 'πίστις ἐλπὶς ἀγάπη'], // Faith, hope, love
    ['REV', 22, 21, 'χάρις τοῦ κυρίου'] // The grace of the Lord
  ];

  let samplesPassed = 0;
  for (const [book, chapter, verse, snippet] of samples) {
    const passed = await sampleVerse(manuscriptId, book, chapter, verse, snippet);
    if (passed) samplesPassed++;
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(70));
  console.log(`Book counts: ${allPassed ? '✓ All books verified' : '⚠️  Some books have unexpected counts'}`);
  console.log(`Sample verses: ${samplesPassed}/${samples.length} passed`);
  console.log(`Total verses: ${totalCount} (expected ~7,957)`);

  if (allPassed && samplesPassed === samples.length) {
    console.log('\n🎉 ALL VERIFICATIONS PASSED!');
    console.log('\n✨ Greek New Testament import is verified and ready to use!');
    console.log('\nDatabase Summary:');
    console.log('  • 27 NT books imported');
    console.log('  • All verse counts verified');
    console.log('  • Morphological data intact');
    console.log('  • Sample verses confirmed');
    console.log('\n📝 Next Steps:');
    console.log('  1. Extend API to support Greek NT queries');
    console.log('  2. Add name restoration for Greek (Ἰησοῦς → Yahusha)');
    console.log('  3. Create parallel display (Hebrew OT + Greek NT)');
  } else {
    console.log('\n⚠️  Some verifications failed. Please review errors above.');
  }
}

main().catch(err => {
  console.error('💥 Verification failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
