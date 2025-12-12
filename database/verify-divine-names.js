/**
 * Verify Divine Name Entries in Lexicon
 * Checks if key divine name entries (H3068, H3091, G2424) are present
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyDivineNames() {
  console.log('🔍 Verifying Divine Name Lexicon Entries');
  console.log('='.repeat(60));

  const divineNames = ['H3068', 'H3091', 'G2424'];

  for (const strongNum of divineNames) {
    const { data, error } = await supabase
      .from('lexicon')
      .select('*')
      .eq('strong_number', strongNum)
      .single();

    if (error || !data) {
      console.log(`\n❌ ${strongNum}: NOT FOUND`);
      continue;
    }

    console.log(`\n✅ ${strongNum}: ${data.original_word}`);
    console.log(`   Language: ${data.language}`);
    console.log(`   Transliteration: ${data.transliteration || 'N/A'}`);
    console.log(`   Pronunciation: ${data.pronunciation || 'N/A'}`);
    console.log(`   Definition: ${data.definition?.substring(0, 100)}...`);
    console.log(`   KJV Usage: ${data.kjv_usage?.substring(0, 80) || 'N/A'}...`);
  }

  console.log('\n' + '='.repeat(60));
}

verifyDivineNames().catch(err => console.error('Error:', err));
