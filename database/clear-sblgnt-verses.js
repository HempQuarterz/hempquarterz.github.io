/**
 * Clear SBLGNT verses from database
 * Use this before re-importing the Greek NT
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function clearSBLGNTVerses() {
  console.log('🗑️  Clearing SBLGNT verses...\n');

  // Get SBLGNT manuscript ID
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'SBLGNT')
    .single();

  if (!manuscript) {
    console.log('ℹ️  No SBLGNT manuscript found. Nothing to clear.');
    return;
  }

  // Count verses before deletion
  const { count: beforeCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscript.id);

  console.log(`Found ${beforeCount} SBLGNT verses to delete`);

  // Delete all SBLGNT verses
  const { error } = await supabase
    .from('verses')
    .delete()
    .eq('manuscript_id', manuscript.id);

  if (error) {
    console.error('❌ Error deleting verses:', error.message);
    process.exit(1);
  }

  // Verify deletion
  const { count: afterCount } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscript.id);

  console.log(`✓ Deleted ${beforeCount - afterCount} verses`);
  console.log(`Remaining SBLGNT verses: ${afterCount}`);
  console.log('\n✅ Clear complete! You can now run --full import.');
}

clearSBLGNTVerses().catch(err => {
  console.error('💥 Error:', err.message);
  process.exit(1);
});
