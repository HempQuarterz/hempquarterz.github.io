/**
 * Apply Database Migration Script
 * Applies migration 001 to add provenance and theophoric tables
 *
 * Usage: node database/apply-migration.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  console.error('Required: REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log('📊 All4Yah Database Migration Tool');
console.log('='.repeat(60));
console.log(`🔗 Connecting to: ${supabaseUrl}`);
console.log(`🔑 Using key: ${supabaseKey.substring(0, 20)}...`);
console.log('='.repeat(60));

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Execute SQL migration file
 */
async function applyMigration() {
  const migrationPath = path.join(__dirname, 'migrations/001_add_provenance_and_theophoric_tables.sql');

  if (!fs.existsSync(migrationPath)) {
    console.error(`❌ Migration file not found: ${migrationPath}`);
    process.exit(1);
  }

  console.log(`\n📄 Reading migration: 001_add_provenance_and_theophoric_tables.sql`);
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  // Split into individual statements (basic splitting on semicolons)
  // Note: This is a simple approach and may not handle all SQL edge cases
  const statements = migrationSQL
    .split(';')
    .map(stmt => stmt.trim())
    .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

  console.log(`\n📝 Found ${statements.length} SQL statements to execute`);
  console.log('\n⏳ Applying migration...\n');

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < statements.length; i++) {
    const stmt = statements[i];

    // Skip comments and DO blocks (they need special handling)
    if (stmt.startsWith('--') || stmt.trim() === '') {
      continue;
    }

    // Extract table/operation name for logging
    const firstLine = stmt.split('\n')[0].substring(0, 80);
    process.stdout.write(`   [${i + 1}/${statements.length}] ${firstLine}... `);

    try {
      const { error } = await supabase.rpc('exec_sql', { sql_query: stmt + ';' });

      if (error) {
        // Try direct query approach if RPC doesn't work
        const result = await supabase.from('_temp').select('*').limit(0);

        // Since Supabase JS client doesn't support raw SQL directly,
        // we'll need to use a different approach
        console.log('⚠️  Skipped (requires psql)');
        failCount++;
      } else {
        console.log('✅');
        successCount++;
      }
    } catch (err) {
      console.log(`❌ ${err.message}`);
      failCount++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📊 MIGRATION SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Successful: ${successCount} statements`);
  console.log(`❌ Failed: ${failCount} statements`);

  if (failCount > 0) {
    console.log('\n⚠️  ALTERNATIVE APPROACH REQUIRED');
    console.log('The Supabase JavaScript client cannot execute raw SQL migrations.');
    console.log('\nPlease use ONE of these methods:\n');
    console.log('1. SUPABASE DASHBOARD (Easiest):');
    console.log('   • Go to: https://supabase.com/dashboard/project/txeeaekwhkdilycefczq');
    console.log('   • Click: SQL Editor');
    console.log('   • Copy contents of: database/migrations/001_add_provenance_and_theophoric_tables.sql');
    console.log('   • Paste into SQL Editor');
    console.log('   • Click: Run\n');
    console.log('2. PSQL COMMAND LINE:');
    console.log('   psql "postgresql://postgres:[PASSWORD]@db.txeeaekwhkdilycefczq.supabase.co:5432/postgres" \\');
    console.log('     -f database/migrations/001_add_provenance_and_theophoric_tables.sql\n');
    console.log('After applying migration, run:');
    console.log('   node database/import-strongs-lexicon.js --test');
  } else {
    console.log('\n🎉 Migration applied successfully!');
    console.log('\nNext steps:');
    console.log('   1. Test import: node database/import-strongs-lexicon.js --test');
    console.log('   2. Full import: node database/import-strongs-lexicon.js --all');
  }
}

// Verify database connection first
async function verifyConnection() {
  console.log('\n🔍 Verifying database connection...');

  try {
    const { data, error } = await supabase
      .from('manuscripts')
      .select('code, name')
      .limit(5);

    if (error) {
      console.error('❌ Database connection failed:', error.message);
      console.error('\nPossible issues:');
      console.error('  • Wrong SUPABASE_URL in .env');
      console.error('  • Invalid SUPABASE_SERVICE_ROLE_KEY');
      console.error('  • Network connectivity issues');
      console.error('\nCurrent configuration:');
      console.error(`  URL: ${supabaseUrl}`);
      console.error(`  Key: ${supabaseKey.substring(0, 20)}...`);
      process.exit(1);
    }

    console.log('✅ Database connection successful!');
    console.log(`📚 Found ${data.length} manuscripts in database:`);
    data.forEach(m => console.log(`   • ${m.code}: ${m.name}`));

    return true;
  } catch (err) {
    console.error('❌ Fatal error:', err.message);
    process.exit(1);
  }
}

// Main execution
async function main() {
  await verifyConnection();
  await applyMigration();
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
