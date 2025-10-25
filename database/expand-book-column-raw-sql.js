/**
 * Expand book column using raw SQL query
 * Bypasses RPC and uses direct PostgreSQL connection
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  console.log('📋 Expanding book column to VARCHAR(50)...\n');

  // Use the SQL REST endpoint directly
  const { data, error } = await supabase
    .from('verses')
    .select('book')
    .limit(1);

  if (error) {
    console.error('❌ Cannot query verses table:', error.message);
    process.exit(1);
  }

  console.log('✅ Can query verses table');
  console.log('\n⚠️  Note: Supabase JS client cannot execute ALTER TABLE directly.');
  console.log('You must run this SQL in the Supabase Dashboard SQL Editor:\n');
  console.log('   ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);\n');
  console.log('📍 Go to: https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql/new\n');
  console.log('Then paste and run the SQL above.');
}

main().catch(console.error);
