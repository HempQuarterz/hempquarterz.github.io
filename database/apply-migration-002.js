/**
 * Apply Migration 002: Add Authenticity Tier columns
 * Run this before importing new manuscripts
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function applyMigration() {
  console.log('📝 Applying Migration 002: Add Authenticity Tier');
  console.log('='.repeat(70));
  console.log(`📍 Project: ${supabaseUrl}\n`);

  try {
    // Step 1: Add authenticity_tier column
    console.log('1️⃣  Adding authenticity_tier column...');
    const { error: error1 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS authenticity_tier INTEGER CHECK (authenticity_tier IN (1, 2, 3));'
    });

    if (error1) {
      // Column might already exist, check if we can query it
      const { data, error: checkError } = await supabase
        .from('manuscripts')
        .select('id, authenticity_tier')
        .limit(1);

      if (checkError && !checkError.message.includes('does not exist')) {
        console.log('   ⚠️  Column may already exist, continuing...');
      }
    } else {
      console.log('   ✅ authenticity_tier column added');
    }

    // Step 2: Add tier_notes column
    console.log('2️⃣  Adding tier_notes column...');
    const { error: error2 } = await supabase.rpc('exec_sql', {
      sql: 'ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS tier_notes TEXT;'
    });

    if (!error2) {
      console.log('   ✅ tier_notes column added');
    }

    // Step 3: Verify columns exist
    console.log('3️⃣  Verifying migration...');
    const { data: testData, error: testError } = await supabase
      .from('manuscripts')
      .select('id, code, authenticity_tier, tier_notes')
      .limit(1);

    if (testError) {
      console.error('   ❌ Verification failed:', testError.message);
      console.log('\n💡 Note: Supabase client might have cached schema.');
      console.log('   Try refreshing the Supabase dashboard or wait a moment.');
      process.exit(1);
    }

    console.log('   ✅ Columns verified successfully\n');

    console.log('✅ Migration 002 applied successfully!');
    console.log('\n📊 You can now import manuscripts with authenticity tier classification.');

  } catch (err) {
    console.error('\n💥 Migration failed:', err.message);
    process.exit(1);
  }
}

applyMigration();
