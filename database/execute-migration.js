#!/usr/bin/env node

/**
 * Execute Database Migration: Expand book column for DSS
 *
 * Attempts to execute the migration directly using Supabase connection.
 * Falls back to manual instructions if automated approach fails.
 */

const { createClient } = require('@supabase/supabase-js');

// All4Yah Supabase configuration (hardcoded for reliability)
const SUPABASE_URL = 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function executeMigration() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     Database Migration: Expand book column for DSS           ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 Database: ${SUPABASE_URL}`);
  console.log('🔑 Using service role key\n');

  try {
    // First, check current schema
    console.log('1️⃣  Checking current schema...\n');

    const { data: currentSchema, error: schemaError } = await supabase
      .from('verses')
      .select('book')
      .limit(1);

    if (schemaError) {
      console.error('❌ Error checking schema:', schemaError.message);
      showManualInstructions();
      return;
    }

    console.log('   ✅ Connected to database successfully\n');

    // Attempt migration via RPC (might not exist)
    console.log('2️⃣  Attempting migration via RPC...\n');

    const { data, error } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);'
    });

    if (error) {
      if (error.message.includes('function') && error.message.includes('does not exist')) {
        console.log('   ⚠️  RPC function not available (expected)\n');
        showManualInstructions();
      } else {
        console.error('   ❌ Migration error:', error.message);
        showManualInstructions();
      }
      return;
    }

    console.log('   ✅ Migration executed successfully!\n');

    // Verify the change
    await verifyMigration();

  } catch (error) {
    console.error('\n❌ Unexpected error:', error.message);
    showManualInstructions();
  }
}

async function verifyMigration() {
  console.log('3️⃣  Verifying migration...\n');

  try {
    // Try to query information schema (might not work via JS client)
    const { data, error } = await supabase.rpc('exec_sql', {
      sql: `SELECT column_name, data_type, character_maximum_length
            FROM information_schema.columns
            WHERE table_name = 'verses' AND column_name = 'book';`
    });

    if (error) {
      console.log('   ⚠️  Cannot verify via RPC, but migration likely succeeded\n');
      showNextSteps();
      return;
    }

    if (data && data[0] && data[0].character_maximum_length === 50) {
      console.log('   ✅ MIGRATION VERIFIED!');
      console.log(`   ✅ book column is now VARCHAR(50)\n`);
      showNextSteps();
    } else {
      console.log('   ⚠️  Verification inconclusive\n');
      showManualInstructions();
    }

  } catch (error) {
    console.log('   ⚠️  Cannot verify automatically\n');
    showManualInstructions();
  }
}

function showManualInstructions() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║          MANUAL MIGRATION REQUIRED                            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('The automated migration cannot execute DDL statements.');
  console.log('Please execute the migration manually via Supabase Dashboard:\n');

  console.log('📋 STEPS:\n');
  console.log('1. Open Supabase SQL Editor:');
  console.log('   https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql/new\n');

  console.log('2. Paste this SQL and click "Run":\n');
  console.log('   ' + '─'.repeat(68));
  console.log('   ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);');
  console.log('   ' + '─'.repeat(68));

  console.log('\n3. Verify with this query:\n');
  console.log('   ' + '─'.repeat(68));
  console.log('   SELECT column_name, data_type, character_maximum_length');
  console.log('   FROM information_schema.columns');
  console.log('   WHERE table_name = \'verses\' AND column_name = \'book\';');
  console.log('   ' + '─'.repeat(68));

  console.log('\n   Expected result: character_maximum_length = 50\n');

  showNextSteps();
}

function showNextSteps() {
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    NEXT STEPS                                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log('After migration completes successfully:\n');

  console.log('📥 Import Dead Sea Scrolls:');
  console.log('   cd hempquarterz.github.io');
  console.log('   node database/import-dead-sea-scrolls.js --full\n');

  console.log('✨ This will:');
  console.log('   • Import 997 scrolls (52,769 lines)');
  console.log('   • Complete the "Authentic 10" milestone');
  console.log('   • Bring total to ~220,066 verses across 10 manuscripts\n');

  console.log('🎯 Mission: "Restoring truth, one name at a time."\n');
  console.log('═'.repeat(70));
}

// Run the migration
executeMigration().catch(error => {
  console.error('\n💥 Fatal error:', error);
  process.exit(1);
});
