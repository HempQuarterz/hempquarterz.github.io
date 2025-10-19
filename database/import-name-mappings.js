/**
 * Import Name Mappings
 * Populates the name_mappings table with divine name restoration rules
 *
 * Core mappings:
 * - יהוה (YHWH) → Yahuah
 * - LORD → Yahuah
 * - יהושע (Yahushua) → Yahusha
 * - Jesus → Yahusha
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

/**
 * Name mapping definitions
 */
const NAME_MAPPINGS = [
  {
    original_text: 'יהוה',
    traditional_rendering: 'LORD, Yahweh, Jehovah',
    restored_rendering: 'Yahuah',
    strong_number: 'H3068',
    context_rules: {
      language: 'hebrew',
      apply_to: ['WLC'],
      case_sensitive: true,
      whole_word: true
    },
    notes: 'The Tetragrammaton (יהוה) - The most sacred name of the Creator. Traditionally rendered as "LORD" (all caps) in English or "Adonai" in spoken Hebrew. The restoration "Yahuah" preserves the original pronunciation based on linguistic analysis of the Hebrew letters Yod-Hey-Waw-Hey and ancient Hebrew pronunciation patterns.'
  },
  {
    original_text: 'LORD',
    traditional_rendering: 'LORD',
    restored_rendering: 'Yahuah',
    strong_number: 'H3068',
    context_rules: {
      language: 'english',
      apply_to: ['WEB'],
      case_sensitive: true,
      whole_word: true,
      pattern: /\bLORD\b/g  // All caps LORD only, not "Lord"
    },
    notes: 'English translation convention where "LORD" (all capitals) represents the Hebrew Tetragrammaton יהוה (H3068). This is distinct from "Lord" (title case) which represents Adonai (H136). The restoration replaces "LORD" with "Yahuah" to preserve the original divine name.'
  },
  {
    original_text: 'יהושע',
    traditional_rendering: 'Joshua, Yehoshua',
    restored_rendering: 'Yahusha',
    strong_number: 'H3091',
    context_rules: {
      language: 'hebrew',
      apply_to: ['WLC'],
      case_sensitive: true,
      whole_word: true
    },
    notes: 'The Hebrew name meaning "Yahuah saves" or "Yahuah is salvation". This is the original Hebrew name of both Joshua (Old Testament) and Jesus (New Testament - Greek: Ἰησοῦς). The restoration "Yahusha" preserves the connection to the divine name Yahuah.'
  },
  {
    original_text: 'Jesus',
    traditional_rendering: 'Jesus',
    restored_rendering: 'Yahusha',
    strong_number: 'G2424',
    context_rules: {
      language: 'english',
      apply_to: ['WEB'],
      case_sensitive: false,
      whole_word: true,
      pattern: /\bJesus\b/gi
    },
    notes: 'The Greek name Ἰησοῦς (Iesous) is a transliteration of the Hebrew יהושע (Yahusha). The restoration returns to the original Hebrew pronunciation which contains the divine name Yahuah, meaning "Yahuah saves".'
  },
  {
    original_text: 'God',
    traditional_rendering: 'God',
    restored_rendering: 'Elohim',
    strong_number: 'H430',
    context_rules: {
      language: 'english',
      apply_to: ['WEB'],
      case_sensitive: false,
      whole_word: true,
      pattern: /\bGod\b/g,
      optional: true  // This is an optional restoration
    },
    notes: 'The Hebrew word אלהים (Elohim) is traditionally translated as "God" in English. While not a personal name like Yahuah, Elohim is the Hebrew term for the Creator. This restoration is optional and helps readers connect English text back to the original Hebrew terminology.'
  }
];

async function importNameMappings() {
  console.log('🔥 Importing Name Restoration Mappings\n');

  // Clear existing mappings
  console.log('📝 Clearing existing name mappings...');
  const { error: deleteError } = await supabase
    .from('name_mappings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');

  if (deleteError) {
    console.error('❌ Failed to clear existing mappings:', deleteError);
  } else {
    console.log('✅ Cleared existing mappings\n');
  }

  // Insert new mappings
  console.log('📚 Inserting name restoration mappings:\n');

  for (const mapping of NAME_MAPPINGS) {
    // Convert regex to string for storage
    const contextRules = { ...mapping.context_rules };
    if (contextRules.pattern) {
      contextRules.pattern = contextRules.pattern.toString();
    }

    const { error } = await supabase
      .from('name_mappings')
      .insert({
        original_text: mapping.original_text,
        traditional_rendering: mapping.traditional_rendering,
        restored_rendering: mapping.restored_rendering,
        strong_number: mapping.strong_number,
        context_rules: contextRules,
        notes: mapping.notes
      });

    if (error) {
      console.error(`❌ Failed to insert mapping for "${mapping.original_text}":`, error.message);
    } else {
      console.log(`✅ ${mapping.original_text} → ${mapping.restored_rendering} (${mapping.strong_number})`);
    }
  }

  // Verify import
  console.log('\n📊 Verifying import...');
  const { count, error: countError } = await supabase
    .from('name_mappings')
    .select('*', { count: 'exact', head: true });

  if (countError) {
    console.error('❌ Failed to count mappings:', countError);
  } else {
    console.log(`✅ Total mappings in database: ${count}`);
  }

  console.log('\n' + '='.repeat(60));
  console.log('🎉 NAME MAPPINGS IMPORTED');
  console.log('='.repeat(60));
  console.log('\nCore Restorations:');
  console.log('  • יהוה (YHWH) → Yahuah');
  console.log('  • LORD → Yahuah');
  console.log('  • יהושע (Yahushua) → Yahusha');
  console.log('  • Jesus → Yahusha');
  console.log('  • God → Elohim (optional)');
  console.log('\n📝 Next Steps:');
  console.log('  1. Build restoration algorithm');
  console.log('  2. Test on sample verses');
  console.log('  3. Create API endpoint for restored text');
}

importNameMappings().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
