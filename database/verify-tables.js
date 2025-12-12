/**
 * Verify Database Tables
 * Checks that all expected tables were created successfully
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const EXPECTED_TABLES = [
  'manuscripts',
  'verses',
  'lexicon',
  'name_mappings',
  'translations',
  'annotations'
];

async function verifyTables() {
  console.log('🔍 Verifying All4Yah Database Tables...\n');

  const results = {
    success: [],
    failed: []
  };

  for (const tableName of EXPECTED_TABLES) {
    try {
      // Try to query each table (just count, no actual data needed)
      const { data, error, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });

      if (error) {
        console.log(`❌ ${tableName}: FAILED`);
        console.log(`   Error: ${error.message}\n`);
        results.failed.push({ table: tableName, error: error.message });
      } else {
        console.log(`✅ ${tableName}: EXISTS (${count || 0} rows)`);
        results.success.push({ table: tableName, count: count || 0 });
      }
    } catch (err) {
      console.log(`❌ ${tableName}: ERROR`);
      console.log(`   ${err.message}\n`);
      results.failed.push({ table: tableName, error: err.message });
    }
  }

  console.log('\n' + '='.repeat(50));
  console.log('📊 VERIFICATION SUMMARY');
  console.log('='.repeat(50));
  console.log(`✅ Tables created: ${results.success.length}/${EXPECTED_TABLES.length}`);
  console.log(`❌ Tables missing: ${results.failed.length}/${EXPECTED_TABLES.length}`);

  if (results.failed.length > 0) {
    console.log('\n⚠️  Missing or failed tables:');
    results.failed.forEach(({ table, error }) => {
      console.log(`   - ${table}: ${error}`);
    });
    console.log('\n💡 Fix: Re-run the schema.sql in Supabase SQL Editor');
    process.exit(1);
  } else {
    console.log('\n🎉 All tables created successfully!');
    console.log('\n📝 Next steps:');
    console.log('   1. Import Westminster Leningrad Codex (WLC) data');
    console.log('   2. Import World English Bible (WEB) data');
    console.log('   3. Test data retrieval through API');
    process.exit(0);
  }
}

verifyTables().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
