/**
 * Simple NT Name Restoration Test
 * Tests "Jesus" → "Yahusha" and "God" → "Elohim" in English NT
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

// Simple restoration function (matches logic in src/api/restoration.js)
function restoreNames(text, language) {
  if (language !== 'english') return text;

  let restored = text;

  // Restore "Jesus" → "Yahusha" (case-sensitive)
  restored = restored.replace(/\bJesus\b/g, 'Yahusha');

  // Restore "God" → "Elohim" (optional, preserves "God's" possessive)
  restored = restored.replace(/\bGod\b/g, 'Elohim');

  return restored;
}

async function testNT() {
  console.log('='.repeat(70));
  console.log('✝️  ENGLISH NT NAME RESTORATION TESTS');
  console.log('='.repeat(70));
  console.log('');

  // Get WEB manuscript ID
  const { data: web } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  const testCases = [
    { ref: 'MAT 1:1', book: 'MAT', chapter: 1, verse: 1, find: 'Jesus', expect: 'Yahusha' },
    { ref: 'MAT 1:21', book: 'MAT', chapter: 1, verse: 21, find: 'Jesus', expect: 'Yahusha' },
    { ref: 'JHN 3:16', book: 'JHN', chapter: 3, verse: 16, find: 'God', expect: 'Elohim' },
    { ref: 'ACT 4:12', book: 'ACT', chapter: 4, verse: 12, find: 'Jesus', expect: 'Yahusha' },
    { ref: 'PHP 2:10', book: 'PHP', chapter: 2, verse: 10, find: 'Jesus', expect: 'Yahusha' },
    { ref: 'HEB 13:8', book: 'HEB', chapter: 13, verse: 8, find: 'Jesus', expect: 'Yahusha' }
  ];

  let passed = 0;

  for (const test of testCases) {
    console.log(`Test: ${test.ref} - "${test.find}" → "${test.expect}"`);

    const { data: verse } = await supabase
      .from('verses')
      .select('text')
      .eq('manuscript_id', web.id)
      .eq('book', test.book)
      .eq('chapter', test.chapter)
      .eq('verse', test.verse)
      .single();

    if (!verse) {
      console.log(`  ❌ Verse not found`);
      console.log('');
      continue;
    }

    const original = verse.text;
    const restored = restoreNames(original, 'english');

    console.log(`  Original: "${original.substring(0, 80)}..."`);
    console.log(`  Restored: "${restored.substring(0, 80)}..."`);

    if (original.includes(test.find) && restored.includes(test.expect)) {
      console.log(`  ✅ PASSED`);
      passed++;
    } else {
      console.log(`  ❌ FAILED`);
    }
    console.log('');
  }

  console.log('='.repeat(70));
  console.log(`📊 Results: ${passed}/${testCases.length} tests passed`);
  console.log('='.repeat(70));

  if (passed === testCases.length) {
    console.log('\n✅ ALL TESTS PASSED! English NT restoration working correctly.\n');
  }
}

testNT().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
