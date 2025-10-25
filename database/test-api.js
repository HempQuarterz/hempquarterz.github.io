/**
 * All4Yah API Endpoint Tests
 * Tests all verse retrieval functions
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

// API Functions (mirrored from src/api/verses.js for testing)

async function getManuscriptId(code) {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', code)
    .single();

  if (error) {
    throw new Error(`Failed to get manuscript ${code}: ${error.message}`);
  }

  return data.id;
}

async function getVerse(manuscript, book, chapter, verse) {
  const manuscriptId = await getManuscriptId(manuscript);

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', manuscriptId)
    .eq('book', book)
    .eq('chapter', chapter)
    .eq('verse', verse)
    .single();

  if (error) {
    throw new Error(`Failed to get verse: ${error.message}`);
  }

  return { manuscript, ...data };
}

async function getParallelVerse(book, chapter, verse) {
  const [hebrew, english] = await Promise.all([
    getVerse('WLC', book, chapter, verse),
    getVerse('WEB', book, chapter, verse)
  ]);

  return {
    reference: `${book} ${chapter}:${verse}`,
    hebrew,
    english
  };
}

async function getChapter(manuscript, book, chapter) {
  const manuscriptId = await getManuscriptId(manuscript);

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', manuscriptId)
    .eq('book', book)
    .eq('chapter', chapter)
    .order('verse');

  if (error) {
    throw new Error(`Failed to get chapter: ${error.message}`);
  }

  return data.map(v => ({ manuscript, ...v }));
}

async function searchByStrongsNumber(strongNumber, limit = 10) {
  const manuscriptId = await getManuscriptId('WLC');

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', manuscriptId)
    .contains('strong_numbers', [strongNumber])
    .limit(limit);

  if (error) {
    throw new Error(`Failed to search by Strong's number: ${error.message}`);
  }

  return data.map(v => ({
    manuscript: 'WLC',
    reference: `${v.book} ${v.chapter}:${v.verse}`,
    ...v
  }));
}

async function searchByText(manuscript, searchText, limit = 10) {
  const manuscriptId = await getManuscriptId(manuscript);

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('manuscript_id', manuscriptId)
    .ilike('text', `%${searchText}%`)
    .limit(limit);

  if (error) {
    throw new Error(`Failed to search by text: ${error.message}`);
  }

  return data.map(v => ({
    manuscript,
    reference: `${v.book} ${v.chapter}:${v.verse}`,
    ...v
  }));
}

// Test Suite

async function runTests() {
  console.log('🧪 All4Yah API Endpoint Tests\n');
  console.log('='.repeat(60));

  let passed = 0;
  let failed = 0;

  // Test 1: Get single verse (Hebrew)
  try {
    console.log('\n📖 Test 1: Get Single Verse (Hebrew WLC)');
    const verse = await getVerse('WLC', 'GEN', 1, 1);

    if (verse.text && verse.strong_numbers && verse.strong_numbers.length > 0) {
      console.log(`✅ PASSED`);
      console.log(`   Genesis 1:1 (Hebrew): ${verse.text.substring(0, 50)}...`);
      console.log(`   Strong's: ${verse.strong_numbers.slice(0, 5).join(', ')}...`);
      passed++;
    } else {
      console.log('❌ FAILED: Missing data');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 2: Get single verse (English)
  try {
    console.log('\n📖 Test 2: Get Single Verse (English WEB)');
    const verse = await getVerse('WEB', 'GEN', 1, 1);

    if (verse.text && verse.text.includes('beginning')) {
      console.log(`✅ PASSED`);
      console.log(`   Genesis 1:1 (English): ${verse.text}`);
      passed++;
    } else {
      console.log('❌ FAILED: Missing or incorrect data');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 3: Get parallel verse
  try {
    console.log('\n📖 Test 3: Get Parallel Verse (Hebrew + English)');
    const parallel = await getParallelVerse('PSA', 23, 1);

    if (parallel.hebrew && parallel.english &&
        parallel.hebrew.strong_numbers.includes('H3068')) {
      console.log(`✅ PASSED`);
      console.log(`   Reference: ${parallel.reference}`);
      console.log(`   Hebrew: ${parallel.hebrew.text.substring(0, 40)}...`);
      console.log(`   English: ${parallel.english.text.substring(0, 50)}...`);
      console.log(`   Contains YHWH (H3068): ✓`);
      passed++;
    } else {
      console.log('❌ FAILED: Missing parallel data');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 4: Get chapter
  try {
    console.log('\n📖 Test 4: Get Full Chapter (Genesis 1 - English)');
    const chapter = await getChapter('WEB', 'GEN', 1);

    if (chapter.length === 31) {
      console.log(`✅ PASSED`);
      console.log(`   Chapter: Genesis 1`);
      console.log(`   Verses: ${chapter.length}`);
      console.log(`   First verse: ${chapter[0].text.substring(0, 50)}...`);
      console.log(`   Last verse: ${chapter[30].text.substring(0, 50)}...`);
      passed++;
    } else {
      console.log(`❌ FAILED: Expected 31 verses, got ${chapter.length}`);
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 5: Search by Strong's number (YHWH)
  try {
    console.log('\n📖 Test 5: Search by Strong\'s Number (H3068 - YHWH)');
    const results = await searchByStrongsNumber('H3068', 5);

    if (results.length === 5 && results.every(v => v.strong_numbers.includes('H3068'))) {
      console.log(`✅ PASSED`);
      console.log(`   Found ${results.length} verses with יהוה (YHWH)`);
      results.forEach(v => {
        console.log(`   - ${v.reference}: ${v.text.substring(0, 40)}...`);
      });
      passed++;
    } else {
      console.log('❌ FAILED: Incorrect search results');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 6: Search by text (English)
  try {
    console.log('\n📖 Test 6: Search by Text (English - "shepherd")');
    const results = await searchByText('WEB', 'shepherd', 5);

    if (results.length > 0 && results.every(v => v.text.toLowerCase().includes('shepherd'))) {
      console.log(`✅ PASSED`);
      console.log(`   Found ${results.length} verses containing "shepherd"`);
      results.forEach(v => {
        console.log(`   - ${v.reference}: ${v.text.substring(0, 50)}...`);
      });
      passed++;
    } else {
      console.log('❌ FAILED: Incorrect search results');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 7: Search by text (Hebrew)
  try {
    console.log('\n📖 Test 7: Search by Text (Hebrew - "אלהים" Elohim)');
    const results = await searchByText('WLC', 'אלהים', 5);

    if (results.length > 0 && results.every(v => v.text.includes('אלהים'))) {
      console.log(`✅ PASSED`);
      console.log(`   Found ${results.length} verses containing "אלהים" (Elohim)`);
      results.forEach(v => {
        console.log(`   - ${v.reference}: ${v.text.substring(0, 40)}...`);
      });
      passed++;
    } else {
      console.log('❌ FAILED: Incorrect search results');
      failed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: ${err.message}`);
    failed++;
  }

  // Test 8: Error handling (non-existent verse)
  try {
    console.log('\n📖 Test 8: Error Handling (Non-existent verse)');
    try {
      await getVerse('WLC', 'GEN', 999, 999);
      console.log('❌ FAILED: Should have thrown an error');
      failed++;
    } catch (err) {
      console.log(`✅ PASSED`);
      console.log(`   Correctly threw error: ${err.message.substring(0, 60)}...`);
      passed++;
    }
  } catch (err) {
    console.log(`❌ FAILED: Unexpected error: ${err.message}`);
    failed++;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Passed: ${passed}/8 tests`);
  console.log(`❌ Failed: ${failed}/8 tests`);

  if (failed === 0) {
    console.log('\n🎉 All API endpoints working correctly!');
    console.log('\n📝 Available API Functions:');
    console.log('   • getVerse(manuscript, book, chapter, verse)');
    console.log('   • getParallelVerse(book, chapter, verse)');
    console.log('   • getChapter(manuscript, book, chapter)');
    console.log('   • searchByStrongsNumber(strongNumber, limit)');
    console.log('   • searchByText(manuscript, searchText, limit)');
    console.log('\n✨ Ready for frontend integration!');
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
