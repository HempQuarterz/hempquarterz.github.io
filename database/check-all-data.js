/**
 * Check All Data - Complete database verification
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function checkAllData() {
  console.log('=' .repeat(60));
  console.log('📊 ALL4YAH DATABASE VERIFICATION REPORT');
  console.log('='.repeat(60));
  console.log('');

  // Check manuscripts
  const { data: manuscripts } = await supabase
    .from('manuscripts')
    .select('*')
    .order('code');

  console.log('📚 MANUSCRIPTS:\n');
  const versesByManuscript = {};

  for (const ms of manuscripts) {
    const { count } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', ms.id);

    versesByManuscript[ms.code] = count;
    const status = count > 0 ? '✅' : '❌';
    console.log(`${status} ${ms.code.padEnd(8)} - ${ms.name.padEnd(40)} - ${(count || 0).toLocaleString().padStart(6)} verses (${ms.language})`);
  }

  // Check expected verse counts
  console.log('\n📖 EXPECTED VERSE COUNTS:\n');
  const expected = {
    'WLC': 23145,   // Hebrew OT
    'WEB': 31102,   // Full Bible (OT+NT)
    'SBLGNT': 7957  // Greek NT
  };

  for (const [code, expectedCount] of Object.entries(expected)) {
    const actual = versesByManuscript[code] || 0;
    const percent = expectedCount > 0 ? ((actual / expectedCount) * 100).toFixed(1) : 0;
    const status = actual >= expectedCount * 0.95 ? '✅' : '⚠️';
    console.log(`${status} ${code}: ${actual.toLocaleString()}/${expectedCount.toLocaleString()} (${percent}%)`);
  }

  // Check name mappings
  const { data: mappings } = await supabase
    .from('name_mappings')
    .select('*')
    .order('language, strong_number');

  console.log(`\n🏷️  NAME MAPPINGS (${mappings.length} total):\n`);

  const byLang = {};
  mappings.forEach(m => {
    const lang = m.language || 'unknown';
    if (!byLang[lang]) byLang[lang] = [];
    byLang[lang].push(m);
  });

  for (const [lang, maps] of Object.entries(byLang)) {
    console.log(`${lang.toUpperCase()} (${maps.length} mappings):`);
    maps.forEach(m => {
      const strong = m.strong_number || 'N/A';
      console.log(`  ${strong.padEnd(8)}: ${m.original_text.padEnd(15)} → ${m.restored_text}`);
    });
    console.log('');
  }

  // Check for books in each manuscript
  console.log('📚 BOOKS BY MANUSCRIPT:\n');
  for (const ms of manuscripts) {
    const { data: books } = await supabase
      .from('verses')
      .select('book')
      .eq('manuscript_id', ms.id);

    const uniqueBooks = [...new Set(books.map(b => b.book))].sort();
    console.log(`${ms.code}: ${uniqueBooks.length} books`);
    console.log(`  ${uniqueBooks.join(', ')}`);
    console.log('');
  }

  console.log('='.repeat(60));
  console.log('✅ VERIFICATION COMPLETE');
  console.log('='.repeat(60));
}

checkAllData().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
