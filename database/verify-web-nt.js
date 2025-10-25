/**
 * Verify WEB New Testament Import
 * Checks all 27 NT books were imported correctly
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function verifyWEBNT() {
  console.log('=' .repeat(60));
  console.log('📖 WEB NEW TESTAMENT VERIFICATION');
  console.log('='.repeat(60));
  console.log('');

  // Get WEB manuscript ID
  const { data: web } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  if (!web) {
    console.error('❌ WEB manuscript not found');
    process.exit(1);
  }

  // NT Books to check
  const ntBooks = [
    { code: 'MAT', name: 'Matthew', expectedMin: 1000 },
    { code: 'MRK', name: 'Mark', expectedMin: 600 },
    { code: 'LUK', name: 'Luke', expectedMin: 1100 },
    { code: 'JHN', name: 'John', expectedMin: 850 },
    { code: 'ACT', name: 'Acts', expectedMin: 1000 },
    { code: 'ROM', name: 'Romans', expectedMin: 400 },
    { code: '1CO', name: '1 Corinthians', expectedMin: 400 },
    { code: '2CO', name: '2 Corinthians', expectedMin: 250 },
    { code: 'GAL', name: 'Galatians', expectedMin: 140 },
    { code: 'EPH', name: 'Ephesians', expectedMin: 150 },
    { code: 'PHP', name: 'Philippians', expectedMin: 100 },
    { code: 'COL', name: 'Colossians', expectedMin: 90 },
    { code: '1TH', name: '1 Thessalonians', expectedMin: 85 },
    { code: '2TH', name: '2 Thessalonians', expectedMin: 45 },
    { code: '1TI', name: '1 Timothy', expectedMin: 110 },
    { code: '2TI', name: '2 Timothy', expectedMin: 80 },
    { code: 'TIT', name: 'Titus', expectedMin: 45 },
    { code: 'PHM', name: 'Philemon', expectedMin: 25 },
    { code: 'HEB', name: 'Hebrews', expectedMin: 300 },
    { code: 'JAS', name: 'James', expectedMin: 105 },
    { code: '1PE', name: '1 Peter', expectedMin: 105 },
    { code: '2PE', name: '2 Peter', expectedMin: 60 },
    { code: '1JN', name: '1 John', expectedMin: 105 },
    { code: '2JN', name: '2 John', expectedMin: 13 },
    { code: '3JN', name: '3 John', expectedMin: 14 },
    { code: 'JUD', name: 'Jude', expectedMin: 25 },
    { code: 'REV', name: 'Revelation', expectedMin: 400 }
  ];

  let totalVerses = 0;
  let allPassed = true;

  for (const book of ntBooks) {
    const { count } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', web.id)
      .eq('book', book.code);

    const status = count >= book.expectedMin ? '✅' : '❌';
    if (count < book.expectedMin) allPassed = false;

    console.log(`${status} ${book.code.padEnd(5)} ${book.name.padEnd(20)} - ${count.toString().padStart(4)} verses`);
    totalVerses += count;
  }

  console.log('');
  console.log('='.repeat(60));
  console.log(`📊 TOTAL NT VERSES: ${totalVerses}`);
  console.log(`${allPassed ? '✅' : '❌'} All NT books: ${allPassed ? 'VERIFIED' : 'INCOMPLETE'}`);
  console.log('='.repeat(60));

  // Sample some verses
  console.log('\n📝 SAMPLE VERSES:\n');

  const samples = [
    { book: 'MAT', chapter: 1, verse: 1 },   // Matthew 1:1
    { book: 'JHN', chapter: 3, verse: 16 },  // John 3:16
    { book: 'ROM', chapter: 3, verse: 23 },  // Romans 3:23
    { book: 'REV', chapter: 22, verse: 21 }  // Last verse of Bible
  ];

  for (const sample of samples) {
    const { data: verse } = await supabase
      .from('verses')
      .select('text')
      .eq('manuscript_id', web.id)
      .eq('book', sample.book)
      .eq('chapter', sample.chapter)
      .eq('verse', sample.verse)
      .single();

    if (verse) {
      const preview = verse.text.substring(0, 80) + (verse.text.length > 80 ? '...' : '');
      console.log(`✅ ${sample.book} ${sample.chapter}:${sample.verse}`);
      console.log(`   "${preview}"`);
      console.log('');
    } else {
      console.log(`❌ ${sample.book} ${sample.chapter}:${sample.verse} - NOT FOUND`);
    }
  }
}

verifyWEBNT().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
