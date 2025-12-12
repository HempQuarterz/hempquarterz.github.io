/**
 * Verify Migration 001 Applied Successfully
 * Checks if provenance and theophoric tables exist
 *
 * Usage: node database/verify-migration.js
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

async function verifyMigration() {
  console.log('🔍 All4Yah Migration Verification');
  console.log('='.repeat(60));

  const requiredTables = [
    'manuscripts',
    'verses',
    'lexicon',
    'name_mappings',
    'provenance_ledger',
    'theophoric_names',
    'verse_alignments',
    'textual_variants'
  ];

  console.log('\n📋 Checking for required tables...\n');

  const results = {};
  let allTablesExist = true;

  for (const table of requiredTables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${table.padEnd(25)} - NOT FOUND`);
        results[table] = { exists: false, error: error.message };
        allTablesExist = false;
      } else {
        const rowCount = count || 0;
        console.log(`✅ ${table.padEnd(25)} - EXISTS (${rowCount} rows)`);
        results[table] = { exists: true, rows: rowCount };
      }
    } catch (err) {
      console.log(`❌ ${table.padEnd(25)} - ERROR: ${err.message}`);
      results[table] = { exists: false, error: err.message };
      allTablesExist = false;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(60));

  const baseTablesExist = results.manuscripts?.exists && results.verses?.exists &&
                          results.lexicon?.exists && results.name_mappings?.exists;
  const migrationTablesExist = results.provenance_ledger?.exists &&
                               results.theophoric_names?.exists &&
                               results.verse_alignments?.exists &&
                               results.textual_variants?.exists;

  console.log(`\n📚 Base Tables: ${baseTablesExist ? '✅ ALL EXIST' : '❌ MISSING'}`);
  console.log(`🆕 Migration 001 Tables: ${migrationTablesExist ? '✅ ALL EXIST' : '❌ MISSING'}`);

  if (!baseTablesExist) {
    console.log('\n⚠️  WARNING: Base tables missing!');
    console.log('You may need to apply the base schema first:');
    console.log('   database/schema.sql');
  }

  if (!migrationTablesExist) {
    console.log('\n❌ Migration 001 NOT YET APPLIED');
    console.log('\nTo apply migration:');
    console.log('1. Go to: https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql');
    console.log('2. Paste contents of: database/migrations/001_add_provenance_and_theophoric_tables.sql');
    console.log('3. Click Run');
    console.log('\nOr run: node database/apply-migration-rest.js (for instructions)');
  } else {
    console.log('\n✅ Migration 001 SUCCESSFULLY APPLIED!');
    console.log('\n📈 Current Data Status:');
    console.log(`   • Manuscripts: ${results.manuscripts?.rows || 0} entries`);
    console.log(`   • Verses: ${results.verses?.rows || 0} entries`);
    console.log(`   • Lexicon: ${results.lexicon?.rows || 0} entries ${results.lexicon?.rows === 0 ? '(ready for import)' : ''}`);
    console.log(`   • Name Mappings: ${results.name_mappings?.rows || 0} entries`);
    console.log(`   • Provenance Ledger: ${results.provenance_ledger?.rows || 0} entries`);
    console.log(`   • Theophoric Names: ${results.theophoric_names?.rows || 0} entries`);
    console.log(`   • Verse Alignments: ${results.verse_alignments?.rows || 0} entries`);
    console.log(`   • Textual Variants: ${results.textual_variants?.rows || 0} entries`);

    if (results.lexicon?.rows === 0) {
      console.log('\n⏭️  NEXT STEPS:');
      console.log('1. Import Strong\'s Lexicon:');
      console.log('   node database/import-strongs-lexicon.js --test    # Test with 20 entries');
      console.log('   node database/import-strongs-lexicon.js --all     # Full import (14,298 entries)');
      console.log('\n2. Populate theophoric names:');
      console.log('   node database/import-theophoric-names.js');
    }
  }

  console.log('\n' + '='.repeat(60));

  return migrationTablesExist;
}

// Run verification
verifyMigration()
  .then(success => process.exit(success ? 0 : 1))
  .catch(err => {
    console.error('💥 Fatal error:', err);
    process.exit(1);
  });
