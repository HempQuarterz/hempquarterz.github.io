/**
 * Name Restoration Test Suite
 * Tests the divine name restoration algorithm
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

// Restoration functions (mirrored from src/api/restoration.js for Node testing)

async function loadNameMappings() {
  const { data, error } = await supabase
    .from('name_mappings')
    .select('*')
    .order('original_text');

  if (error) {
    throw new Error(`Failed to load name mappings: ${error.message}`);
  }

  return data;
}

async function restoreByStrongsNumbers(text, strongNumbers, language) {
  const mappings = await loadNameMappings();

  const relevantMappings = mappings.filter(m =>
    m.context_rules &&
    m.context_rules.language === language &&
    m.strong_number &&
    strongNumbers && strongNumbers.includes(m.strong_number)
  );

  if (relevantMappings.length === 0) {
    return {
      text,
      restored: false,
      restorations: []
    };
  }

  let restoredText = text;
  const restorations = [];

  for (const mapping of relevantMappings) {
    const original = mapping.original_text;
    const restored = mapping.restored_rendering;

    if (language === 'hebrew') {
      if (restoredText.includes(original)) {
        restoredText = restoredText.replace(new RegExp(original, 'g'), restored);
        restorations.push({
          original,
          restored,
          strongNumber: mapping.strong_number,
          count: (text.match(new RegExp(original, 'g')) || []).length
        });
      }
    } else if (language === 'english' && mapping.context_rules.pattern) {
      const patternStr = mapping.context_rules.pattern;
      const pattern = eval(patternStr);
      const matches = restoredText.match(pattern);

      if (matches) {
        restoredText = restoredText.replace(pattern, restored);
        restorations.push({
          original,
          restored,
          strongNumber: mapping.strong_number,
          count: matches.length
        });
      }
    }
  }

  return {
    text: restoredText,
    original: text,
    restored: restorations.length > 0,
    restorations,
    method: 'strongs_numbers'
  };
}

async function getVerse(manuscript, book, chapter, verse) {
  const { data: msMeta } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', manuscript)
    .single();

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', msMeta.id)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .single();

  if (error) {
    throw new Error(`Failed to get verse: ${error.message}`);
  }

  return { manuscript, ...data };
}

// Test Suite

async function runTests() {
  console.log('🔥 Divine Name Restoration Tests\n');
  console.log('='.repeat(70));

  let passed = 0;
  let failed = 0;

  // Test 1: Hebrew restoration (Psalm 23:1 - contains יהוה)
  try {
    console.log('\n📖 Test 1: Hebrew Name Restoration (Psalm 23:1)');

    const verse = await getVerse('WLC', 'PSA', 23, 1);
    const result = await restoreByStrongsNumbers(verse.text, verse.strong_numbers, 'hebrew');

    console.log(`   Original:  ${verse.text}`);
    console.log(`   Restored:  ${result.text}`);
    console.log(`   Restored?: ${result.restored ? '✓' : '✗'}`);

    if (result.restored && result.text.includes('Yahuah')) {
      console.log(`✅ PASSED - Successfully restored יהוה → Yahuah`);
      result.restorations.forEach(r => {
        console.log(`   • ${r.original} → ${r.restored} (${r.count}x, ${r.strongNumber})`);
      });
      passed++;
    } else {
      console.log(`❌ FAILED - Did not find restoration`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 2: English restoration (Psalm 23:1 - contains "LORD")
  try {
    console.log('\n📖 Test 2: English Name Restoration (Psalm 23:1)');

    const verse = await getVerse('WEB', 'PSA', 23, 1);
    const result = await restoreByStrongsNumbers(verse.text, ['H3068'], 'english');

    console.log(`   Original:  ${verse.text}`);
    console.log(`   Restored:  ${result.text}`);
    console.log(`   Restored?: ${result.restored ? '✓' : '✗'}`);

    if (result.restored && result.text.includes('Yahuah') && !result.text.includes('LORD')) {
      console.log(`✅ PASSED - Successfully restored LORD → Yahuah`);
      result.restorations.forEach(r => {
        console.log(`   • "${r.original}" → "${r.restored}" (${r.count}x, ${r.strongNumber})`);
      });
      passed++;
    } else {
      console.log(`❌ FAILED - Did not restore LORD to Yahuah`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 3: Genesis 2:4 (first occurrence of יהוה in Torah)
  try {
    console.log('\n📖 Test 3: First YHWH in Torah (Genesis 2:4)');

    const hebrewVerse = await getVerse('WLC', 'GEN', 2, 4);
    const englishVerse = await getVerse('WEB', 'GEN', 2, 4);

    const hebrewResult = await restoreByStrongsNumbers(
      hebrewVerse.text,
      hebrewVerse.strong_numbers,
      'hebrew'
    );

    const englishResult = await restoreByStrongsNumbers(
      englishVerse.text,
      ['H3068'],
      'english'
    );

    console.log(`   Hebrew Original:  ${hebrewVerse.text.substring(0, 60)}...`);
    console.log(`   Hebrew Restored:  ${hebrewResult.text.substring(0, 60)}...`);
    console.log(`   English Original: ${englishVerse.text.substring(0, 60)}...`);
    console.log(`   English Restored: ${englishResult.text.substring(0, 60)}...`);

    if (hebrewResult.restored && englishResult.restored &&
        hebrewResult.text.includes('Yahuah') && englishResult.text.includes('Yahuah')) {
      console.log(`✅ PASSED - Both languages restored correctly`);
      passed++;
    } else {
      console.log(`❌ FAILED - Restoration incomplete`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 4: Isaiah 53:5 (Suffering Servant passage)
  try {
    console.log('\n📖 Test 4: Isaiah 53:5 (No YHWH - should not restore)');

    const verse = await getVerse('WLC', 'ISA', 53, 5);
    const result = await restoreByStrongsNumbers(verse.text, verse.strong_numbers, 'hebrew');

    console.log(`   Text: ${verse.text.substring(0, 60)}...`);
    console.log(`   Contains YHWH?: ${verse.strong_numbers.includes('H3068') ? 'Yes' : 'No'}`);
    console.log(`   Restored?: ${result.restored ? 'Yes' : 'No'}`);

    if (!result.restored && !verse.strong_numbers.includes('H3068')) {
      console.log(`✅ PASSED - Correctly did not restore (no YHWH in verse)`);
      passed++;
    } else if (result.restored && verse.strong_numbers.includes('H3068')) {
      console.log(`✅ PASSED - Found and restored YHWH`);
      passed++;
    } else {
      console.log(`❌ FAILED - Unexpected restoration behavior`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 5: Multiple occurrences (Exodus 3:15 - YHWH appears multiple times)
  try {
    console.log('\n📖 Test 5: Multiple YHWH Occurrences (Exodus 3:15)');

    const verse = await getVerse('WLC', 'EXO', 3, 15);
    const result = await restoreByStrongsNumbers(verse.text, verse.strong_numbers, 'hebrew');

    const originalCount = (verse.text.match(/יהוה/g) || []).length;
    const restoredCount = (result.text.match(/Yahuah/g) || []).length;

    console.log(`   Original text: ${verse.text.substring(0, 70)}...`);
    console.log(`   יהוה count in original: ${originalCount}`);
    console.log(`   Yahuah count in restored: ${restoredCount}`);

    if (originalCount > 0 && originalCount === restoredCount) {
      console.log(`✅ PASSED - All ${originalCount} occurrences restored`);
      passed++;
    } else {
      console.log(`❌ FAILED - Count mismatch`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 6: Verify name mappings are loaded
  try {
    console.log('\n📖 Test 6: Name Mappings Database Verification');

    const mappings = await loadNameMappings();

    console.log(`   Total mappings: ${mappings.length}`);

    const yhwhMapping = mappings.find(m => m.strong_number === 'H3068' && m.context_rules.language === 'hebrew');
    const lordMapping = mappings.find(m => m.strong_number === 'H3068' && m.context_rules.language === 'english');

    console.log(`   Hebrew יהוה mapping: ${yhwhMapping ? '✓' : '✗'}`);
    console.log(`   English LORD mapping: ${lordMapping ? '✓' : '✗'}`);

    if (yhwhMapping && lordMapping && mappings.length >= 4) {
      console.log(`✅ PASSED - Name mappings loaded correctly`);
      passed++;
    } else {
      console.log(`❌ FAILED - Missing expected mappings`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Passed: ${passed}/6 tests`);
  console.log(`❌ Failed: ${failed}/6 tests`);

  if (failed === 0) {
    console.log('\n🎉 ALL NAME RESTORATION TESTS PASSED!');
    console.log('\n✨ Divine Name Restoration is working correctly!');
    console.log('\nRestorations verified:');
    console.log('  • יהוה (YHWH) → Yahuah (Hebrew)');
    console.log('  • LORD → Yahuah (English)');
    console.log('  • Multiple occurrences handled correctly');
    console.log('  • Strong\'s number matching works');
    console.log('\n📝 Next Steps:');
    console.log('  1. Integrate with verse API');
    console.log('  2. Create frontend display component');
    console.log('  3. Add user toggle for restored vs traditional');
  } else {
    console.log('\n⚠️  Some tests failed. Please review errors above.');
    process.exit(1);
  }
}

// Run tests
runTests().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
