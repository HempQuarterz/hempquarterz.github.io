/**
 * Run Migration: Expand book column from VARCHAR(3) to VARCHAR(50)
 *
 * This migration is required to support Dead Sea Scrolls with longer scroll names
 * like "4Q223_224", "Arugleviticus", "1QpHab", etc.
 *
 * Usage:
 *   node database/run-migration-expand-book.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📋 Database Migration: Expand book column');
  console.log('='.repeat(70));
  console.log('Purpose: Support Dead Sea Scrolls and other manuscripts with');
  console.log('         longer book/scroll names (e.g., "4Q223_224", "Arugleviticus")');
  console.log('Change:  verses.book VARCHAR(3) → VARCHAR(50)');
  console.log('='.repeat(70));
  console.log();

  // Check current column definition
  console.log('🔍 Checking current book column definition...');
  const { data: currentSchema, error: schemaError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'verses'
        AND column_name = 'book'
      `
    });

  if (schemaError) {
    // If RPC doesn't exist, try direct query
    console.log('   Using alternative schema check method...');
    const { data: altSchema, error: altError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, character_maximum_length')
      .eq('table_name', 'verses')
      .eq('column_name', 'book');

    if (altError) {
      console.log('⚠️  Cannot check current schema, proceeding with migration anyway...');
    } else if (altSchema && altSchema.length > 0) {
      console.log(`   Current: ${altSchema[0].data_type}(${altSchema[0].character_maximum_length})`);
    }
  } else if (currentSchema && currentSchema.length > 0) {
    console.log(`   Current: ${currentSchema[0].data_type}(${currentSchema[0].character_maximum_length})`);
  }

  console.log();

  // Run the migration
  console.log('🔄 Running migration...');
  console.log('   ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);');

  const { error: migrationError } = await supabase.rpc('exec_sql', {
    sql: 'ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);'
  });

  if (migrationError) {
    console.error('❌ Migration failed:', migrationError.message);
    console.error();
    console.error('💡 Trying alternative approach using Supabase SQL editor:');
    console.error('   1. Go to Supabase Dashboard > SQL Editor');
    console.error('   2. Run this SQL:');
    console.error('      ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);');
    console.error();
    console.error('   Or use apply_migration tool instead.');
    process.exit(1);
  }

  console.log('✅ Migration completed successfully!');
  console.log();

  // Verify the change
  console.log('🔍 Verifying migration...');
  const { data: verifySchema, error: verifyError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'verses'
        AND column_name = 'book'
      `
    });

  if (!verifyError && verifySchema && verifySchema.length > 0) {
    console.log(`   New schema: ${verifySchema[0].data_type}(${verifySchema[0].character_maximum_length})`);
  } else {
    console.log('⚠️  Could not verify schema change, but migration completed.');
  }

  console.log();
  console.log('='.repeat(70));
  console.log('✅ MIGRATION COMPLETE');
  console.log('='.repeat(70));
  console.log('✅ verses.book column expanded to VARCHAR(50)');
  console.log('✅ Database ready for Dead Sea Scrolls import');
  console.log();
  console.log('⏭️  Next step: Run DSS import');
  console.log('   node database/import-dead-sea-scrolls.js --full');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
