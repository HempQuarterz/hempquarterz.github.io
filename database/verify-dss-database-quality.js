#!/usr/bin/env node
/**
 * Verify DSS Database Quality
 *
 * Checks if the DSS data currently in the database has quality issues
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDatabaseQuality() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('DSS Database Quality Verification');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // Get DSS manuscript ID
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'DSS')
    .single();

  if (!manuscript) {
    console.error('❌ DSS manuscript not found in database');
    process.exit(1);
  }

  const manuscriptId = manuscript.id;

  // Get all DSS verses
  console.log('📊 Fetching all DSS verses from database...');

  let allVerses = [];
  let offset = 0;
  const limit = 1000;

  while (true) {
    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse')
      .eq('manuscript_id', manuscriptId)
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('❌ Error fetching verses:', error.message);
      process.exit(1);
    }

    if (data.length === 0) break;

    allVerses = allVerses.concat(data);
    offset += limit;
    process.stdout.write(`\r   Fetched ${allVerses.length} verses...`);
  }

  console.log(`\n   ✅ Total verses fetched: ${allVerses.length}\n`);

  // Check for duplicates
  console.log('🔍 Checking for duplicates...');
  const seen = new Set();
  const duplicates = [];

  allVerses.forEach(verse => {
    const key = `${verse.book}|${verse.chapter}|${verse.verse}`;
    if (seen.has(key)) {
      duplicates.push(verse);
    } else {
      seen.add(key);
    }
  });

  console.log(`   Found ${duplicates.length} duplicates`);

  // Check for invalid verse numbers
  console.log('\n🔍 Checking for invalid verse numbers (≤ 0)...');
  const invalidVerses = allVerses.filter(v => v.verse <= 0);
  console.log(`   Found ${invalidVerses.length} invalid verse numbers`);

  // Check for invalid chapter numbers
  console.log('\n🔍 Checking for invalid chapter numbers (≤ 0)...');
  const invalidChapters = allVerses.filter(v => v.chapter <= 0);
  console.log(`   Found ${invalidChapters.length} invalid chapter numbers`);

  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════\n');

  console.log(`📊 Database Quality:`);
  console.log(`   - Total verses: ${allVerses.length}`);
  console.log(`   - Duplicates: ${duplicates.length} ${duplicates.length === 0 ? '✅' : '❌'}`);
  console.log(`   - Invalid verse numbers: ${invalidVerses.length} ${invalidVerses.length === 0 ? '✅' : '❌'}`);
  console.log(`   - Invalid chapter numbers: ${invalidChapters.length} ${invalidChapters.length === 0 ? '✅' : '❌'}`);

  if (duplicates.length === 0 && invalidVerses.length === 0 && invalidChapters.length === 0) {
    console.log('\n✅ DATABASE IS CLEAN! No re-import needed.');
  } else {
    console.log('\n❌ DATABASE HAS QUALITY ISSUES! Re-import recommended.');
    console.log('\n💡 Next steps:');
    console.log('   1. Clear DSS verses from database');
    console.log('   2. Import cleaned data from dss-cleaned.json');
  }

  console.log('\n═══════════════════════════════════════════════════════════════\n');
}

verifyDatabaseQuality().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
