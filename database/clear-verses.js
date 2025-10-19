require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearVerses() {
  console.log('🗑️  Clearing existing verse data...\n');

  const { error } = await supabase
    .from('verses')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

  if (error) {
    console.error('❌ Failed to clear verses:', error);
    process.exit(1);
  }

  console.log('✅ Verse data cleared successfully\n');
}

clearVerses();
