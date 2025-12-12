/**
 * TEMPLATE: Manuscript Import Script for All4Yah
 * Copy this template when creating new import scripts
 *
 * IMPORTANT: All imports must classify manuscripts using the Authenticity Tier System
 * See: MANUSCRIPT_AUTHENTICITY_CRITERIA.md
 *
 * Tier 1 (AUTHENTIC): Free & unaltered primary sources (Hebrew, Greek, Latin, etc.)
 * Tier 2 (FILTERED): Open but filtered through interpretation layers
 * Tier 3 (RESTRICTED): Proprietary or heavily edited (reference only)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get or create manuscript entry
 *
 * AUTHENTICITY TIER CLASSIFICATION:
 * Before importing, verify the manuscript qualifies for its tier:
 *
 * Tier 1 Checklist:
 * ✅ Public domain or open license (CC BY, CC BY-SA, CC BY-NC-SA, CC0)
 * ✅ Original language (Hebrew, Aramaic, Greek, Syriac, Latin)
 * ✅ Diplomatic/facsimile edition (minimal editorial interference)
 * ✅ No theological paraphrasing or smoothing
 * ✅ Divine names preserved as originally written
 *
 * Tier 2: Modern translations, filtered data, or has interpretation layers
 * Tier 3: Proprietary, behind paywall, or heavily reconstructed
 */
async function getManuscriptId() {
  console.log('📚 Checking for [MANUSCRIPT_NAME] manuscript entry...');

  const { data: existing, error: fetchError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'XXX') // CHANGE THIS: Your manuscript code (e.g., 'DSS', 'SIN', 'ALP')
    .single();

  if (existing) {
    console.log(`✅ Found existing [MANUSCRIPT_NAME] manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry with authenticity tier
  const { data: newManuscript, error: insertError } = await supabase
    .from('manuscripts')
    .insert({
      // REQUIRED FIELDS
      code: 'XXX',                        // CHANGE THIS: Unique manuscript code
      name: 'Full Manuscript Name',       // CHANGE THIS: Official name
      language: 'hebrew',                 // CHANGE THIS: 'hebrew', 'greek', 'aramaic', 'latin', 'syriac', 'english'
      date_range: '1000 CE',              // CHANGE THIS: Date or date range
      license: 'CC BY 4.0',               // CHANGE THIS: License type
      description: 'Description of this manuscript', // CHANGE THIS: Brief description

      // AUTHENTICITY TIER CLASSIFICATION (REQUIRED)
      authenticity_tier: 1,               // CHANGE THIS: 1 (Authentic), 2 (Filtered), 3 (Restricted)
      tier_notes: 'Why this manuscript is Tier 1: [Explain: public domain + original language + diplomatic edition + no paraphrasing]', // CHANGE THIS

      // OPTIONAL FIELDS
      source_url: 'https://github.com/...' // URL to data source
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create manuscript: ${insertError.message}`);
  }

  console.log(`✅ Created [MANUSCRIPT_NAME] manuscript entry (ID: ${newManuscript.id})`);
  console.log(`   Authenticity Tier: ${newManuscript.authenticity_tier === 1 ? 'Tier 1 (AUTHENTIC)' : newManuscript.authenticity_tier === 2 ? 'Tier 2 (FILTERED)' : 'Tier 3 (RESTRICTED)'}`);
  return newManuscript.id;
}

/**
 * Parse manuscript data
 * Implement your specific parsing logic here
 */
function parseManuscriptData(filePath) {
  console.log(`📖 Reading data from ${filePath}...`);

  // TODO: Implement your parsing logic
  // Example structure:
  const verses = [];

  // Parse your data and create verse objects like:
  // {
  //   book: 'GEN',
  //   chapter: 1,
  //   verse: 1,
  //   text: 'בְּרֵאשִׁית בָּרָא אֱלֹהִים...',
  //   morphology: [{ word: 'בְּרֵאשִׁית', strong: 'H7225', morph: '...' }] // Optional
  // }

  return verses;
}

/**
 * Import verses to database
 */
async function importVerses(manuscriptId, verses) {
  console.log(`\n📥 Importing ${verses.length} verses to database...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    // Add manuscript_id and convert morphology to JSON
    const versesWithManuscript = batch.map(v => ({
      ...v,
      manuscript_id: manuscriptId,
      morphology: v.morphology ? JSON.stringify(v.morphology) : null
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(versesWithManuscript, {
        onConflict: 'manuscript_id,book,chapter,verse'
      });

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n\n✅ Import complete: ${imported} verses imported, ${failed} failed`);
  return { imported, failed };
}

/**
 * Verify import
 */
async function verifyImport(manuscriptId) {
  console.log('\n🔍 Verifying import...');

  const { count, error } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId);

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  console.log(`✅ Total verses in database: ${count}`);

  // Sample some verses
  const { data: samples, error: sampleError } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .limit(5);

  if (!sampleError && samples) {
    console.log('\n📋 Sample verses:');
    samples.forEach(v => {
      const displayText = v.text.length > 80 ? v.text.substring(0, 80) + '...' : v.text;
      console.log(`${v.book} ${v.chapter}:${v.verse} - ${displayText}`);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');

  console.log('📖 [MANUSCRIPT_NAME] Import Tool');
  console.log('='.repeat(70));

  if (testMode) {
    console.log('🧪 TEST MODE: Will import sample data only\n');
  } else if (fullMode) {
    console.log('🌍 FULL MODE: Will import entire manuscript\n');
  } else {
    console.log('ℹ️  Usage:');
    console.log('  --test          Import sample data only');
    console.log('  --full          Import entire manuscript\n');
    process.exit(0);
  }

  // Get manuscript ID
  const manuscriptId = await getManuscriptId();

  // TODO: Parse your data
  const dataPath = path.join(__dirname, '../../manuscripts/YOUR_MANUSCRIPT_DIR/data.txt');
  const verses = parseManuscriptData(dataPath);

  if (verses.length === 0) {
    console.log('\n⚠️  No verses found. Check data path or parsing logic.');
    process.exit(1);
  }

  // Import verses
  const { imported, failed } = await importVerses(manuscriptId, verses);

  // Verify
  await verifyImport(manuscriptId);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Manuscript: [MANUSCRIPT_NAME]`);
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log(`📚 Database now contains [MANUSCRIPT_NAME] data`);

  console.log('\n⏭️  Next steps:');
  console.log('1. Update MANUSCRIPT_SOURCES_STATUS.md with import details');
  console.log('2. Run verification tests');
  console.log('3. Commit changes with descriptive message');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
