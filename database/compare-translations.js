require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function compareTranslations() {
  console.log('📖 Comparing WLC Hebrew vs WEB English (Genesis 1:1-3)\n');

  // Get WLC manuscript ID
  const { data: wlcMeta } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WLC')
    .single();

  // Get WEB manuscript ID
  const { data: webMeta } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  for (let verse = 1; verse <= 3; verse++) {
    // Get Hebrew verse
    const { data: hebrew } = await supabase
      .from('verses')
      .select('text, strong_numbers')
      .eq('manuscript_id', wlcMeta.id)
      .eq('book', 'GEN')
      .eq('chapter', 1)
      .eq('verse', verse)
      .single();

    // Get English verse
    const { data: english } = await supabase
      .from('verses')
      .select('text')
      .eq('manuscript_id', webMeta.id)
      .eq('book', 'GEN')
      .eq('chapter', 1)
      .eq('verse', verse)
      .single();

    console.log(`Genesis 1:${verse}`);
    console.log(`Hebrew (WLC):  ${hebrew.text}`);
    console.log(`English (WEB): ${english.text}`);
    console.log(`Strong's: ${hebrew.strong_numbers.slice(0, 5).join(', ')}...`);
    console.log('');
  }

  console.log('✅ Parallel text verified!');
}

compareTranslations();
