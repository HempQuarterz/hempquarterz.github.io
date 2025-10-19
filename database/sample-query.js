require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function sampleQuery() {
  console.log('📖 Sample Query: Genesis 1:1-3\n');

  const { data, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text, strong_numbers')
    .eq('book', 'GEN')
    .eq('chapter', 1)
    .lte('verse', 3)
    .order('verse');

  if (error) {
    console.error('❌ Query failed:', error);
    return;
  }

  data.forEach(verse => {
    console.log(`\n${verse.book} ${verse.chapter}:${verse.verse}`);
    console.log(`Hebrew: ${verse.text}`);
    console.log(`Strong's: ${verse.strong_numbers.join(', ')}`);
  });

  console.log('\n✅ Data structure verified!');
}

sampleQuery();
