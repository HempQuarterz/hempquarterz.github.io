/**
 * Check Lexicon Table Schema
 * Inspects the actual columns in the lexicon table
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSchema() {
  console.log('🔍 Checking lexicon table schema...\n');

  // Try to insert a test row to see what columns are expected
  const testEntry = {
    strong_number: 'TEST001',
    language: 'hebrew',
    original_word: 'test',
    transliteration: 'test',
    pronunciation: 'test',
    definition: 'test',
    kjv_definition: 'test',
    derivation: 'test',
    see_also: null
  };

  const { data, error } = await supabase
    .from('lexicon')
    .insert([testEntry])
    .select();

  if (error) {
    console.log('❌ Insert failed:', error.message);
    console.log('\nDetails:', error.details);
    console.log('\nHint:', error.hint);

    // Try to get schema from error message
    if (error.message.includes('column')) {
      console.log('\n💡 The lexicon table likely has different columns than expected.');
      console.log('Let me try a minimal insert to discover the schema...\n');

      const minimal = {
        strong_number: 'TEST002',
        language: 'hebrew'
      };

      const { error: minError } = await supabase
        .from('lexicon')
        .insert([minimal])
        .select();

      if (minError) {
        console.log('Minimal insert also failed:', minError.message);
      } else {
        console.log('✅ Minimal insert succeeded! Required columns: strong_number, language');
        // Clean up test entry
        await supabase.from('lexicon').delete().eq('strong_number', 'TEST002');
      }
    }
  } else {
    console.log('✅ Test insert successful!');
    console.log('Schema appears to match our expectations.');
    // Clean up test entry
    await supabase.from('lexicon').delete().eq('strong_number', 'TEST001');
  }

  // Try to fetch one existing row to see the structure
  const { data: existing, error: fetchError } = await supabase
    .from('lexicon')
    .select('*')
    .limit(1);

  if (!fetchError && existing && existing.length > 0) {
    console.log('\n📋 Sample row structure:');
    console.log(JSON.stringify(existing[0], null, 2));
  } else if (!fetchError && (!existing || existing.length === 0)) {
    console.log('\n📋 No existing rows in lexicon table (empty table)');
  }
}

checkSchema().catch(err => {
  console.error('Error:', err);
});
