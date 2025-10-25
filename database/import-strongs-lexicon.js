/**
 * Strong's Lexicon Import Script
 * Imports Strong's Hebrew (8,674 entries) and Greek (5,624 entries) dictionaries
 *
 * Data source: OpenScriptures Strong's (CC-BY-SA)
 * https://github.com/openscriptures/strongs
 *
 * Usage:
 *   node database/import-strongs-lexicon.js --hebrew    # Import Hebrew only
 *   node database/import-strongs-lexicon.js --greek     # Import Greek only
 *   node database/import-strongs-lexicon.js --all       # Import both (default)
 *   node database/import-strongs-lexicon.js --test      # Test mode (10 entries each)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase connection
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Parse Hebrew Strong's dictionary from JavaScript file
 */
function parseHebrewDictionary(filePath) {
  console.log('\n📖 Parsing Hebrew Strong\'s Dictionary...');

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract the JavaScript object (it's defined as: var strongsHebrewDictionary = {...})
  const match = content.match(/var strongsHebrewDictionary = ({[\s\S]+});/);
  if (!match) {
    throw new Error('Could not parse Hebrew dictionary format');
  }

  // Use eval to parse the JavaScript object (safe since it's from trusted source)
  const dictData = eval('(' + match[1] + ')');

  const entries = [];
  for (const [strongsNum, entry] of Object.entries(dictData)) {
    entries.push({
      strong_number: strongsNum,
      language: 'hebrew',
      original_word: entry.lemma || 'Unknown',
      transliteration: entry.xlit || null,
      pronunciation: entry.pron || null,
      definition: entry.strongs_def || 'No definition available',
      kjv_usage: entry.kjv_def || null,
      root_word: entry.derivation || null,
      usage_notes: entry.see ? `See also: ${entry.see}` : null
    });
  }

  console.log(`✅ Parsed ${entries.length} Hebrew entries`);
  return entries;
}

/**
 * Parse Greek Strong's dictionary from JavaScript file
 */
function parseGreekDictionary(filePath) {
  console.log('\n📖 Parsing Greek Strong\'s Dictionary...');

  const content = fs.readFileSync(filePath, 'utf-8');

  // Extract the JavaScript object (it's defined as: var strongsGreekDictionary = {...})
  const match = content.match(/var strongsGreekDictionary = ({[\s\S]+});/);
  if (!match) {
    throw new Error('Could not parse Greek dictionary format');
  }

  // Use eval to parse the JavaScript object (safe since it's from trusted source)
  const dictData = eval('(' + match[1] + ')');

  const entries = [];
  for (const [strongsNum, entry] of Object.entries(dictData)) {
    entries.push({
      strong_number: strongsNum,
      language: 'greek',
      original_word: entry.lemma || 'Unknown',
      transliteration: entry.translit || null,
      pronunciation: entry.pronounce || null,
      definition: entry.strongs_def || 'No definition available',
      kjv_usage: entry.kjv_def || null,
      root_word: entry.derivation || null,
      usage_notes: entry.see ? `See also: ${entry.see}` : null
    });
  }

  console.log(`✅ Parsed ${entries.length} Greek entries`);
  return entries;
}

/**
 * Import lexicon entries to Supabase
 */
async function importLexicon(entries, language) {
  console.log(`\n📥 Importing ${entries.length} ${language} lexicon entries...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);

    const { error } = await supabase
      .from('lexicon')
      .upsert(batch, { onConflict: 'strong_number' });

    if (error) {
      console.error(`❌ Failed to import batch ${i}-${i + batch.length}:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${entries.length} (${Math.round(imported/entries.length*100)}%)`);
    }
  }

  console.log(`\n✅ Imported ${imported} ${language} entries (${failed} failed)`);
  return { imported, failed };
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--all';

  console.log('📚 Strong\'s Lexicon Import Tool');
  console.log('='.repeat(60));

  if (mode === '--help') {
    console.log('\nUsage:');
    console.log('  node database/import-strongs-lexicon.js --hebrew  # Hebrew only');
    console.log('  node database/import-strongs-lexicon.js --greek   # Greek only');
    console.log('  node database/import-strongs-lexicon.js --all     # Both (default)');
    console.log('  node database/import-strongs-lexicon.js --test    # Test mode');
    process.exit(0);
  }

  // Paths to Strong's data
  const hebrewPath = path.join(__dirname, '../../manuscripts/lexicon/strongs/hebrew/strongs-hebrew-dictionary.js');
  const greekPath = path.join(__dirname, '../../manuscripts/lexicon/strongs/greek/strongs-greek-dictionary.js');

  // Verify files exist
  if ((mode === '--hebrew' || mode === '--all' || mode === '--test') && !fs.existsSync(hebrewPath)) {
    console.error(`❌ Hebrew dictionary not found at: ${hebrewPath}`);
    process.exit(1);
  }

  if ((mode === '--greek' || mode === '--all' || mode === '--test') && !fs.existsSync(greekPath)) {
    console.error(`❌ Greek dictionary not found at: ${greekPath}`);
    process.exit(1);
  }

  let totalImported = 0;
  let totalFailed = 0;

  // Import Hebrew
  if (mode === '--hebrew' || mode === '--all' || mode === '--test') {
    let hebrewEntries = parseHebrewDictionary(hebrewPath);

    if (mode === '--test') {
      console.log('🧪 TEST MODE: Importing first 10 Hebrew entries only');
      hebrewEntries = hebrewEntries.slice(0, 10);
    }

    const result = await importLexicon(hebrewEntries, 'Hebrew');
    totalImported += result.imported;
    totalFailed += result.failed;
  }

  // Import Greek
  if (mode === '--greek' || mode === '--all' || mode === '--test') {
    let greekEntries = parseGreekDictionary(greekPath);

    if (mode === '--test') {
      console.log('🧪 TEST MODE: Importing first 10 Greek entries only');
      greekEntries = greekEntries.slice(0, 10);
    }

    const result = await importLexicon(greekEntries, 'Greek');
    totalImported += result.imported;
    totalFailed += result.failed;
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Total imported: ${totalImported} entries`);
  console.log(`❌ Total failed: ${totalFailed} entries`);
  console.log('\n🎉 Lexicon import complete!');

  // Verify counts
  const { count: hebrewCount } = await supabase
    .from('lexicon')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'hebrew');

  const { count: greekCount } = await supabase
    .from('lexicon')
    .select('*', { count: 'exact', head: true })
    .eq('language', 'greek');

  console.log('\n📈 Database verification:');
  console.log(`   Hebrew entries in database: ${hebrewCount}`);
  console.log(`   Greek entries in database: ${greekCount}`);
  console.log(`   Total lexicon entries: ${hebrewCount + greekCount}`);

  console.log('\nNext steps:');
  console.log('  1. Verify sample entries: SELECT * FROM lexicon WHERE strong_number IN (\'H3068\', \'H3091\', \'G2424\') LIMIT 10;');
  console.log('  2. Test lexicon API: node database/test-lexicon.js');
  console.log('  3. Update restoration.js to use lexicon data');
}

// Run import
main().catch(err => {
  console.error('💥 Fatal error:', err);
  process.exit(1);
});
