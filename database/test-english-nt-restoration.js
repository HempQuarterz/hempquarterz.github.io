/**
 * Test English Name Restoration on NT Verses
 * Tests "Jesus" → "Yahusha" restoration
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { restoreNames } = require('../src/api/restoration');
const { getVerse } = require('../src/api/verses');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function testNTRestoration() {
  console.log('=' .repeat(70));
  console.log('✝️  ENGLISH NT NAME RESTORATION TESTS');
  console.log('='.repeat(70));
  console.log('');

  let passedTests = 0;
  let totalTests = 0;

  // Test verses with "Jesus" that should be restored to "Yahusha"
  const testCases = [
    {
      name: 'Matthew 1:1 - First mention of Jesus',
      book: 'MAT',
      chapter: 1,
      verse: 1,
      shouldContain: 'Jesus',
      restoredContain: 'Yahusha'
    },
    {
      name: 'Matthew 1:21 - "you shall call his name Jesus"',
      book: 'MAT',
      chapter: 1,
      verse: 21,
      shouldContain: 'Jesus',
      restoredContain: 'Yahusha'
    },
    {
      name: 'John 3:16 - Most famous verse',
      book: 'JHN',
      chapter: 3,
      verse: 16,
      shouldContain: 'God',
      restoredContain: 'Elohim'
    },
    {
      name: 'Acts 4:12 - "no other name...but Jesus"',
      book: 'ACT',
      chapter: 4,
      verse: 12,
      shouldContain: 'Jesus',
      restoredContain: 'Yahusha'
    },
    {
      name: 'Philippians 2:10 - "name of Jesus"',
      book: 'PHP',
      chapter: 2,
      verse: 10,
      shouldContain: 'Jesus',
      restoredContain: 'Yahusha'
    },
    {
      name: 'Hebrews 13:8 - "Jesus Christ"',
      book: 'HEB',
      chapter: 13,
      verse: 8,
      shouldContain: 'Jesus',
      restoredContain: 'Yahusha'
    }
  ];

  for (const test of testCases) {
    totalTests++;
    console.log(`Test ${totalTests}: ${test.name}`);
    console.log(`  Reference: ${test.book} ${test.chapter}:${test.verse}`);

    try {
      // Get verse from API
      const verse = await getVerse('WEB', test.book, test.chapter, test.verse);

      if (!verse) {
        console.log('  ❌ FAILED: Verse not found in database');
        console.log('');
        continue;
      }

      console.log(`  Original: "${verse.text.substring(0, 100)}${verse.text.length > 100 ? '...' : ''}"`);

      // Check original contains expected text
      if (!verse.text.includes(test.shouldContain)) {
        console.log(`  ⚠️  WARNING: Original doesn't contain "${test.shouldContain}"`);
      }

      // Apply restoration
      const restored = restoreNames(verse.text, 'english');
      console.log(`  Restored: "${restored.substring(0, 100)}${restored.length > 100 ? '...' : ''}"`);

      // Check restoration worked
      if (restored.includes(test.restoredContain)) {
        console.log(`  ✅ PASSED: Contains "${test.restoredContain}"`);
        passedTests++;
      } else {
        console.log(`  ❌ FAILED: Missing "${test.restoredContain}"`);
      }

    } catch (error) {
      console.log(`  ❌ FAILED: ${error.message}`);
    }

    console.log('');
  }

  // Summary
  console.log('='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`Tests passed: ${passedTests}/${totalTests}`);
  console.log(`Success rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
  console.log('');

  if (passedTests === totalTests) {
    console.log('✅ ALL TESTS PASSED! English NT name restoration is working correctly.');
  } else {
    console.log(`⚠️  ${totalTests - passedTests} test(s) failed. Review restoration logic.`);
  }

  console.log('='.repeat(70));
}

testNTRestoration().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
