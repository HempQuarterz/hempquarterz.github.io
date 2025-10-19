require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function clearWebVerses() {
  console.log('🗑️  Clearing WEB test data...\n');

  // Get WEB manuscript ID
  const { data: webMeta } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  if (!webMeta) {
    console.log('No WEB manuscript found');
    return;
  }

  const { error } = await supabase
    .from('verses')
    .delete()
    .eq('manuscript_id', webMeta.id);

  if (error) {
    console.error('❌ Failed to clear WEB verses:', error);
    process.exit(1);
  }

  console.log('✅ WEB test data cleared\n');
}

clearWebVerses();
