/**
 * Theophoric Names Import Script
 * Extracts Hebrew names containing divine elements (Yahu-, -yahu, -yah, Yah-, El-, -el)
 * from the Strong's Lexicon and populates the theophoric_names table
 *
 * Theophoric = "bearing the name of a god" (Greek: θεός theos "god" + φέρειν pherein "to bear")
 *
 * Usage: node database/import-theophoric-names.js [--test]
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Identify theophoric element in a Hebrew name
 */
function identifyTheophoricElement(hebrewName, transliteration) {
  const name = hebrewName || '';
  const translit = (transliteration || '').toLowerCase();

  // Check for Yahu/Yah elements (most common)
  if (name.includes('יהו') || translit.includes('yehô') || translit.includes('yāhû')) {
    if (name.startsWith('יהו') || translit.startsWith('yeh')) {
      return 'Yahu-';
    } else if (name.endsWith('יהו') || translit.match(/(yāhû|yehô)$/)) {
      return '-yahu';
    }
  }

  if (name.includes('יה') || translit.includes('yāh') || translit.includes('yah')) {
    if (name.startsWith('יה')) {
      return 'Yah-';
    } else if (name.endsWith('יה')) {
      return '-yah';
    }
  }

  // Check for El elements
  if (name.includes('אל') || translit.includes('ʼêl') || translit.match(/\bel\b/i)) {
    if (name.startsWith('אל')) {
      return 'El-';
    } else if (name.endsWith('אל')) {
      return '-el';
    }
  }

  return null;
}

/**
 * Extract meaning related to divine name
 */
function extractMeaning(definition, kjvUsage, rootWord) {
  // Try to extract meaning from definition
  const sources = [definition, rootWord, kjvUsage].filter(Boolean).join(' ');

  // Look for common patterns
  if (sources.match(/Jehovah|Yahweh|Lord|God/i)) {
    const match = sources.match(/(?:means?|i\.e\.|from|signif(?:ies|ying))\s+[^;.]+/i);
    if (match) {
      return match[0].replace(/^(?:means?|i\.e\.|from|signif(?:ies|ying))\s+/i, '');
    }
  }

  return null;
}

/**
 * Find theophoric names in lexicon
 */
async function findTheophoricNames(testMode = false) {
  console.log('🔍 Searching for theophoric names in lexicon...\n');

  // Query Hebrew lexicon entries (fetch all with high limit)
  const { data: lexiconEntries, error } = await supabase
    .from('lexicon')
    .select('*')
    .eq('language', 'hebrew')
    .order('strong_number')
    .limit(10000); // Fetch up to 10,000 entries

  if (error) {
    throw new Error(`Failed to fetch lexicon: ${error.message}`);
  }

  console.log(`📚 Analyzing ${lexiconEntries.length} Hebrew lexicon entries...\n`);

  const theophoricNames = [];

  for (const entry of lexiconEntries) {
    const element = identifyTheophoricElement(entry.original_word, entry.transliteration);

    if (element) {
      const meaning = extractMeaning(entry.definition, entry.kjv_usage, entry.root_word);

      theophoricNames.push({
        name_hebrew: entry.original_word,
        name_transliteration: entry.transliteration,
        name_english: entry.kjv_usage?.split(',')[0]?.trim() || entry.transliteration,
        theophoric_element: element,
        strong_number: entry.strong_number,
        meaning: meaning || `Contains divine element: ${element}`,
        occurrences: 0, // Will be updated when we cross-reference with Bible
        notes: `From Strong's ${entry.strong_number}: ${entry.definition?.substring(0, 100)}`
      });
    }
  }

  console.log(`✅ Found ${theophoricNames.length} theophoric names`);

  // Group by element type
  const byElement = theophoricNames.reduce((acc, name) => {
    acc[name.theophoric_element] = (acc[name.theophoric_element] || 0) + 1;
    return acc;
  }, {});

  console.log('\n📊 Distribution by element:');
  for (const [element, count] of Object.entries(byElement)) {
    console.log(`   ${element.padEnd(10)} ${count} names`);
  }

  if (testMode) {
    console.log('\n🧪 TEST MODE: Returning first 20 names only');
    return theophoricNames.slice(0, 20);
  }

  return theophoricNames;
}

/**
 * Import theophoric names to database
 */
async function importTheophoricNames(names) {
  console.log(`\n📥 Importing ${names.length} theophoric names...\n`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < names.length; i += BATCH_SIZE) {
    const batch = names.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('theophoric_names')
      .upsert(batch, { onConflict: 'name_hebrew,name_english' });

    if (error) {
      console.error(`❌ Failed to import batch ${i}-${i + batch.length}:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${names.length} (${Math.round(imported/names.length*100)}%)`);
    }
  }

  console.log(`\n✅ Imported ${imported} theophoric names (${failed} failed)`);
  return { imported, failed };
}

/**
 * Display sample theophoric names
 */
async function displaySamples() {
  console.log('\n📋 Sample theophoric names from database:\n');

  const { data: samples, error } = await supabase
    .from('theophoric_names')
    .select('*')
    .order('name_english')
    .limit(10);

  if (error) {
    console.error('❌ Failed to fetch samples:', error.message);
    return;
  }

  for (const name of samples) {
    console.log(`${name.name_english} (${name.name_hebrew})`);
    console.log(`  • Strong's: ${name.strong_number}`);
    console.log(`  • Element: ${name.theophoric_element}`);
    console.log(`  • Meaning: ${name.meaning}`);
    console.log();
  }
}

/**
 * Main execution
 */
async function main() {
  const testMode = process.argv.includes('--test');

  console.log('📛 Theophoric Names Import Tool');
  console.log('='.repeat(60));

  if (testMode) {
    console.log('🧪 TEST MODE: Will import first 20 names only\n');
  }

  // Find theophoric names
  const names = await findTheophoricNames(testMode);

  if (names.length === 0) {
    console.log('\n⚠️  No theophoric names found. Check lexicon data.');
    process.exit(0);
  }

  // Import to database
  const { imported, failed } = await importTheophoricNames(names);

  // Display samples
  await displaySamples();

  // Summary
  console.log('='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total imported: ${imported} names`);
  console.log(`❌ Total failed: ${failed} names`);
  console.log('\n🎯 Theological Significance:');
  console.log('These names prove the pronunciation "Yahuah" (not "Yahweh")');
  console.log('because Hebrew theophoric names preserve the divine name:');
  console.log('  • Yahu- prefix (e.g., Jehu = Yahu)');
  console.log('  • -yahu suffix (e.g., Isaiah = Yesha-yahu)');
  console.log('  • -yah suffix (e.g., Elijah = Eli-yah)');
  console.log('\n⏭️  Next steps:');
  console.log('1. Cross-reference with Bible verses to count occurrences');
  console.log('2. Add confidence heuristics to restoration.js');
  console.log('3. Implement provenance logging');
  console.log('\n🎉 Theophoric names import complete!');
}

main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
