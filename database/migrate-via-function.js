/**
 * Apply Migration via Supabase Function
 * Creates a PostgreSQL function to execute the migration, then calls it
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log(`🔗 Connecting to: ${supabaseUrl}\n`);

  // First, create a migration function using raw SQL via RPC
  console.log('📝 Creating migration function...');

  const createFunctionSQL = `
    CREATE OR REPLACE FUNCTION migrate_expand_book_column()
    RETURNS TEXT AS $$
    BEGIN
      ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);
      RETURN 'Migration completed successfully';
    EXCEPTION
      WHEN OTHERS THEN
        RETURN 'Migration failed: ' || SQLERRM;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  // Try to create the function by calling a hypothetical admin function
  // If this doesn't work, we'll need to use the dashboard

  const { data: createData, error: createError } = await supabase.rpc('query', {
    query: createFunctionSQL
  });

  if (createError) {
    console.log('⚠️  Cannot create function via RPC:', createError.message);
    console.log('\n💡 Alternative: You need to run these SQL statements in Supabase Dashboard:\n');
    console.log('=' .repeat(70));
    console.log(createFunctionSQL);
    console.log('\nTHEN:\n');
    console.log('SELECT migrate_expand_book_column();');
    console.log('=' .repeat(70));
    console.log('\n📍 Dashboard URL: https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql/new\n');
    return;
  }

  console.log('✅ Function created\n');

  // Call the migration function
  console.log('🔄 Executing migration...');
  const { data: migData, error: migError } = await supabase.rpc('migrate_expand_book_column');

  if (migError) {
    console.error('❌ Migration failed:', migError.message);
  } else {
    console.log('✅ Migration result:', migData);
  }
}

main().catch(console.error);
