/**
 * Direct Database Migration: Expand book column using Node.js client
 * This ensures we're modifying the same database the import script uses
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log(`🔗 Connecting to: ${supabaseUrl}`);
const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('\n📋 Checking current manuscripts...');

  // First check what's in the database
  const { data: manuscripts, error: msError } = await supabase
    .from('manuscripts')
    .select('id, code, name')
    .order('code');

  if (msError) {
    console.error('❌ Error querying manuscripts:', msError.message);
  } else {
    console.log(`✅ Found ${manuscripts.length} manuscripts:`);
    manuscripts.forEach(m => console.log(`   - ${m.code}: ${m.name}`));
  }

  console.log('\n📋 Checking current book column schema...');

  // Check current schema using raw SQL via Supabase
  const { data: schemaData, error: schemaError } = await supabase
    .rpc('exec_sql', {
      sql: `
        SELECT
          column_name,
          data_type,
          character_maximum_length
        FROM information_schema.columns
        WHERE table_name = 'verses'
        AND column_name = 'book';
      `
    });

  if (schemaError) {
    console.log('⚠️  Cannot use exec_sql RPC. Trying alternative approach...');
    console.log('\n💡 You need to run this SQL manually in Supabase SQL Editor:');
    console.log('   ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);');
    console.log('\n   Then re-run the DSS import.');
  } else {
    if (schemaData && schemaData.length > 0) {
      const col = schemaData[0];
      console.log(`   Current: ${col.data_type}(${col.character_maximum_length})`);

      if (col.character_maximum_length < 50) {
        console.log('\n🔄 Running migration to expand column...');

        const { error: migError } = await supabase.rpc('exec_sql', {
          sql: 'ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);'
        });

        if (migError) {
          console.error('❌ Migration failed:', migError.message);
          console.log('\n💡 Manual SQL needed - run in Supabase Dashboard:');
          console.log('   ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);');
        } else {
          console.log('✅ Migration complete!');

          // Verify
          const { data: verify } = await supabase.rpc('exec_sql', {
            sql: `
              SELECT character_maximum_length
              FROM information_schema.columns
              WHERE table_name = 'verses' AND column_name = 'book';
            `
          });

          if (verify && verify.length > 0) {
            console.log(`✅ Verified: book column is now VARCHAR(${verify[0].character_maximum_length})`);
          }
        }
      } else {
        console.log('✅ Column already expanded to VARCHAR(50) or larger');
      }
    }
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
