/**
 * Import Aramaic Divine Name Mappings for Peshitta
 *
 * This script maps Aramaic/Syriac divine names in the Peshitta to restored Hebrew names.
 *
 * Key Aramaic Terms:
 * - ܡܪܝܐ (Marya) - "Lord" → Yahuah (when translating YHWH)
 * - ܐܠܗܐ (Alaha) - "God" → Elohim
 * - ܝܫܘܥ (Yeshua) - "Jesus" → Yahusha
 *
 * Usage:
 *   node database/import-aramaic-name-mappings.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Aramaic divine name mappings for Peshitta
const ARAMAIC_MAPPINGS = [
  {
    original_text: 'ܡܪܝܐ',
    traditional_rendering: 'Marya, Lord',
    restored_rendering: 'Yahuah',
    strong_number: 'H3068',
    context_rules: {
      language: 'aramaic',
      apply_to: ['PESHITTA', 'ONKELOS'],
      pattern: '/ܡܪܝܐ/g',
      whole_word: true,
      romanization: 'Marya',
      when_translating: 'Hebrew YHWH (יהוה)',
      usage: 'Old Testament contexts where YHWH appears in Hebrew manuscripts'
    },
    notes: 'The Peshitta uses ܡܪܝܐ (Marya/Morya) where the Hebrew has יהוה (YHWH). This follows the Jewish tradition of substituting the divine name with "Adonai" (Lord). Restoring ܡܪܝܐ to Yahuah reveals the personal name of the Creator in Aramaic Scripture.'
  },
  {
    original_text: 'ܐܠܗܐ',
    traditional_rendering: 'Alaha, God',
    restored_rendering: 'Elohim',
    strong_number: 'H430',
    context_rules: {
      language: 'aramaic',
      apply_to: ['PESHITTA', 'ONKELOS'],
      pattern: '/ܐܠܗܐ/g',
      whole_word: true,
      romanization: 'Alaha',
      cognate_relationship: 'Hebrew Elohim (אלהים)',
      linguistic_notes: 'Aramaic ܐܠܗܐ and Hebrew אלהים share common Semitic root'
    },
    notes: 'ܐܠܗܐ (Alaha) is the Aramaic cognate of Hebrew אלהים (Elohim). Both derive from the Semitic root ʾlh meaning "mighty one, deity". Maintaining Elohim emphasizes the connection between Aramaic and Hebrew Scripture.'
  },
  {
    original_text: 'ܝܫܘܥ',
    traditional_rendering: 'Yeshua, Jesus, Joshua',
    restored_rendering: 'Yahusha',
    strong_number: 'H3091',
    context_rules: {
      language: 'aramaic',
      apply_to: ['PESHITTA'],
      pattern: '/ܝܫܘܥ/g',
      whole_word: true,
      romanization: 'Yeshua',
      hebrew_source: 'יהושע (Yahusha/Yehoshua)',
      meaning: 'Yahuah saves',
      related_names: ['Joshua (OT)', 'Jesus (NT)']
    },
    notes: 'ܝܫܘܥ (Yeshua) is the contracted Aramaic form of Hebrew יהושע (Yahusha/Yehoshua), meaning "Yahuah saves". The shortened form was common in Second Temple Judaism. Restoring the full form Yahusha highlights the meaning "Yahuah saves" and connects to the Hebrew name Joshua.'
  },
  {
    original_text: 'ܡܪܐ',
    traditional_rendering: 'Mara, the Lord',
    restored_rendering: 'Yahuah',
    strong_number: 'H3068',
    context_rules: {
      language: 'aramaic',
      apply_to: ['PESHITTA', 'ONKELOS'],
      pattern: '/ܡܪܐ/g',
      whole_word: true,
      romanization: 'Mara',
      grammatical_form: 'Emphatic state of Marya',
      when_translating: 'YHWH with definite article'
    },
    notes: 'ܡܪܐ (Mara) is the emphatic state of ܡܪܝܐ (Marya), meaning "the Lord". Used in contexts where Hebrew has YHWH with the definite article. Another form of the divine name substitution that can be restored to Yahuah.'
  }
];

/**
 * Main import function
 */
async function main() {
  console.log('='.repeat(60));
  console.log('ARAMAIC DIVINE NAME MAPPINGS IMPORT');
  console.log('='.repeat(60));
  console.log();

  console.log(`Importing ${ARAMAIC_MAPPINGS.length} Aramaic name mappings...\n`);

  for (const mapping of ARAMAIC_MAPPINGS) {
    console.log(`📝 ${mapping.original_text} (${mapping.romanization}) → ${mapping.restored_name}`);

    // Check if mapping already exists
    const { data: existing } = await supabase
      .from('name_mappings')
      .select('id')
      .eq('original_text', mapping.original_text)
      .eq('language', 'aramaic')
      .single();

    if (existing) {
      console.log(`   ⚠️  Already exists, skipping...\n`);
      continue;
    }

    // Insert new mapping
    const { error } = await supabase
      .from('name_mappings')
      .insert([mapping]);

    if (error) {
      console.error(`   ✗ Error:`, error.message);
    } else {
      console.log(`   ✓ Imported successfully\n`);
    }
  }

  console.log('='.repeat(60));
  console.log('IMPORT COMPLETE');
  console.log('='.repeat(60));
  console.log();

  // Verify total count
  const { count } = await supabase
    .from('name_mappings')
    .select('*', { count: 'exact', head: true });

  console.log(`Total name mappings in database: ${count}`);
  console.log();

  // Show Aramaic mappings
  const { data: aramaicMappings } = await supabase
    .from('name_mappings')
    .select('original_text, traditional_rendering, restored_rendering, context_rules')
    .contains('context_rules', { language: 'aramaic' });

  console.log('Aramaic Mappings:');
  if (aramaicMappings && aramaicMappings.length > 0) {
    aramaicMappings.forEach(m => {
      const romanization = m.context_rules?.romanization || '';
      console.log(`  ${m.original_text} (${romanization}) → ${m.restored_rendering}`);
    });
  } else {
    console.log('  No Aramaic mappings found.');
  }
}

// Run import
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
