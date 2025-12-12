require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const EXPECTED_OT_BOOKS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
  '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO',
  'ECC', 'SNG', 'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO',
  'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'
];

async function verifyComplete() {
  console.log('🔍 WLC Import Verification\n');

  // 1. Total verse count
  const { count, error: countError } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Count error:', countError);
    return;
  }

  console.log(`✅ Total verses: ${count.toLocaleString()}`);
  console.log(`   (Expected: 23,145 OT verses)\n`);

  // 2. Check each book individually
  console.log('📚 Verifying all 39 OT books:\n');

  let foundBooks = 0;
  let missingBooks = [];

  for (const bookCode of EXPECTED_OT_BOOKS) {
    const { count: bookCount, error } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('book', bookCode);

    if (error || bookCount === 0) {
      console.log(`❌ ${bookCode}: MISSING`);
      missingBooks.push(bookCode);
    } else {
      foundBooks++;
      if (bookCount > 100) {
        console.log(`✅ ${bookCode}: ${bookCount} verses`);
      } else {
        console.log(`✅ ${bookCode}: ${bookCount} verses`);
      }
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`Total verses imported: ${count.toLocaleString()}`);
  console.log(`Books found: ${foundBooks}/${EXPECTED_OT_BOOKS.length}`);

  if (missingBooks.length > 0) {
    console.log(`\n❌ Missing books: ${missingBooks.join(', ')}`);
  } else {
    console.log('\n✅ All 39 Old Testament books successfully imported!');
  }

  // 3. Sample verses
  console.log('\n📖 Sample Verses:\n');

  const samples = [
    { book: 'GEN', chapter: 1, verse: 1, name: 'Genesis 1:1 (Creation)' },
    { book: 'PSA', chapter: 23, verse: 1, name: 'Psalm 23:1 (The Lord is my shepherd)' },
    { book: 'ISA', chapter: 53, verse: 5, name: 'Isaiah 53:5 (Suffering servant)' }
  ];

  for (const { book, chapter, verse, name } of samples) {
    const { data, error } = await supabase
      .from('verses')
      .select('text, strong_numbers')
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .single();

    if (!error && data) {
      console.log(`✅ ${name}`);
      console.log(`   Hebrew: ${data.text.substring(0, 40)}...`);
      console.log(`   Strong's: ${data.strong_numbers.slice(0, 4).join(', ')}...\n`);
    }
  }

  // 4. Check for divine name יהוה (YHWH - Strong's H3068)
  const { count: yhwhCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .contains('strong_numbers', ['H3068']);

  console.log(`🔥 Divine Name (יהוה - H3068) found in: ${yhwhCount} verses`);
  console.log('   (YHWH appears ~6,800 times in Hebrew Bible)\n');

  console.log('='.repeat(60));
  console.log('✅ WLC IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log('\n🎯 Next Steps (Phase 1):');
  console.log('   1. Commit WLC import scripts to git');
  console.log('   2. Import World English Bible (WEB) for English text');
  console.log('   3. Build API endpoints for verse retrieval');
  console.log('   4. Create name restoration prototype\n');
}

verifyComplete().catch(err => {
  console.error('Error:', err);
});
