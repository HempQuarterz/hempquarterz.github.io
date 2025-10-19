/**
 * Import Greek Name Mappings
 * Extends the name restoration system to support Greek NT divine names
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

// Greek name mappings for divine name restoration
const GREEK_NAME_MAPPINGS = [
  {
    original_text: 'Ἰησοῦς',
    traditional_rendering: 'Jesus',
    restored_rendering: 'Yahusha',
    strong_number: 'G2424',
    context_rules: {
      language: 'greek',
      apply_to: ['SBLGNT'],
      case_sensitive: false,  // Greek has multiple case forms
      whole_word: true,
      pattern: '/Ἰησοῦ[ςνᾶ]/gu'  // Matches all Greek case forms of Jesus
    },
    notes: `The name Ἰησοῦς (Iēsous) is the Greek transliteration of the Hebrew name יהושע (Yahusha),
meaning "Yahuah saves" or "Yahuah is salvation". In Greek, this name appears in multiple case forms:
- Ἰησοῦς (nominative - subject)
- Ἰησοῦ (genitive - possessive)
- Ἰησοῦν (accusative - object)
- Ἰησοῦ (dative - indirect object)
- Ἰησοῦ (vocative - address)

The restoration to "Yahusha" reveals the connection to the Hebrew divine name יהוה (YHWH/Yahuah)
and shows that the Messiah's name literally means "Yahuah saves", fulfilling Matthew 1:21.

Historical Note: The name went through multiple transliterations:
Hebrew יהושע (Yahusha) → Greek Ἰησοῦς (Iēsous) → Latin Iesus → English Jesus

This restoration brings the name back to its Hebrew roots and reveals its divine meaning.`
  },
  {
    original_text: 'θεὸς',
    traditional_rendering: 'God',
    restored_rendering: 'Elohim',
    strong_number: 'G2316',
    context_rules: {
      language: 'greek',
      apply_to: ['SBLGNT'],
      case_sensitive: false,
      whole_word: true,
      pattern: '/θεο[ῦὸόςὺύὶίέ]/gu'  // Matches all Greek case forms
    },
    notes: `The Greek word θεός (theos) corresponds to the Hebrew אלהים (Elohim), meaning "Mighty One"
or "Creator". While θεός is a general term for deity in Greek, when used in the New Testament
context (written by Jewish authors), it often refers specifically to the Creator Elohim.

Greek case forms:
- θεός (nominative)
- θεοῦ (genitive)
- θεῷ (dative)
- θεόν (accusative)
- θεέ (vocative)

Optional restoration: Some users may prefer to see "Elohim" to maintain consistency with the
Hebrew Old Testament terminology, while others prefer the traditional "God". The All4Yah app
allows users to toggle this preference.`
  },
  {
    original_text: 'κύριος',
    traditional_rendering: 'Lord',
    restored_rendering: 'Yahuah',
    strong_number: 'G2962',
    context_rules: {
      language: 'greek',
      apply_to: ['SBLGNT'],
      case_sensitive: false,
      whole_word: true,
      pattern: '/κυρί[οεωαυ][υςνᾶ]?/gu',  // Matches all case forms
      contextual: true,  // Requires context analysis
      notes: 'Only restore when κύριος is used as a title for YHWH (often in OT quotes)'
    },
    notes: `The Greek word κύριος (kyrios) means "lord" or "master" and has multiple uses in the NT:

1. **As a title for YHWH** - When quoting the Hebrew Bible, κύριος translates יהוה (YHWH)
2. **As a title for the Messiah** - Acknowledging his divine authority
3. **As a general term** - Meaning "sir" or "master" in ordinary contexts

Case forms:
- κύριος (nominative)
- κυρίου (genitive)
- κυρίῳ (dative)
- κύριον (accusative)
- κύριε (vocative)

IMPORTANT: This restoration should be CONTEXTUAL. When κύριος appears in:
- Direct OT quotes → restore to "Yahuah" (e.g., Matthew 4:7 quoting Deuteronomy)
- References to the Messiah → keep as "Master" or show both meanings
- General usage → keep as "Lord" or "sir"

Future enhancement: Implement contextual analysis to determine when κύριος refers to YHWH vs.
when it's used as a general title.`
  }
];

async function importGreekNameMappings() {
  console.log('🔥 Importing Greek Name Mappings\n');
  console.log('='.repeat(70));

  let imported = 0;
  let skipped = 0;

  for (const mapping of GREEK_NAME_MAPPINGS) {
    console.log(`\n📝 ${mapping.original_text} → ${mapping.restored_rendering}`);
    console.log(`   Strong's: ${mapping.strong_number}`);
    console.log(`   Traditional: ${mapping.traditional_rendering}`);

    // Check if mapping already exists
    const { data: existing } = await supabase
      .from('name_mappings')
      .select('id')
      .eq('original_text', mapping.original_text)
      .eq('strong_number', mapping.strong_number)
      .eq('context_rules->>language', 'greek');

    if (existing && existing.length > 0) {
      console.log('   ⏭️  Already exists, skipping');
      skipped++;
      continue;
    }

    // Insert mapping
    const { error } = await supabase
      .from('name_mappings')
      .insert(mapping);

    if (error) {
      console.error(`   ❌ Error: ${error.message}`);
    } else {
      console.log('   ✓ Imported');
      imported++;
    }
  }

  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`Imported: ${imported}`);
  console.log(`Skipped:  ${skipped}`);
  console.log(`Total:    ${imported + skipped}`);

  if (imported > 0) {
    console.log('\n🎉 Greek name mappings imported successfully!');
    console.log('\nMappings added:');
    console.log('  • Ἰησοῦς (G2424) → Yahusha (all case forms)');
    console.log('  • θεός (G2316) → Elohim (optional)');
    console.log('  • κύριος (G2962) → Yahuah (contextual, in OT quotes)');
    console.log('\n📝 Next Steps:');
    console.log('  1. Update restoration API to support Greek language');
    console.log('  2. Test restoration on Greek NT verses');
    console.log('  3. Implement contextual restoration for κύριος');
  } else {
    console.log('\nℹ️  All mappings already exist.');
  }
}

importGreekNameMappings().catch(err => {
  console.error('💥 Import failed:', err.message);
  console.error(err.stack);
  process.exit(1);
});
