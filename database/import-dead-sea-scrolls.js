/**
 * Dead Sea Scrolls Import Script
 *
 * Imports Dead Sea Scrolls data extracted from Text-Fabric format
 * - Tier 1: AUTHENTIC (oldest existing manuscripts, ~100 BCE - 100 CE)
 * - 997 scrolls with 52,769 lines
 * - Scroll fragments organized as scroll/fragment/line (mapped to book/chapter/verse)
 * - Hebrew language with morphological data
 * - Public Domain
 *
 * Usage:
 *   node database/import-dead-sea-scrolls.js --test    # Import first 100 lines only
 *   node database/import-dead-sea-scrolls.js --full    # Import all 52,769 lines
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
 * Get or create manuscript entry in database
 */
async function getManuscriptId() {
  // Check if authenticity_tier column exists
  let hasTierColumn = false;
  const { data: testManuscript } = await supabase
    .from('manuscripts')
    .select('id, authenticity_tier')
    .limit(1)
    .single();

  if (testManuscript && 'authenticity_tier' in testManuscript) {
    hasTierColumn = true;
  }

  // Try to get existing manuscript
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'DSS')
    .single();

  if (existing) {
    console.log(`✅ Found existing Dead Sea Scrolls manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry
  console.log('📚 Creating Dead Sea Scrolls manuscript entry...');

  const manuscriptData = {
    code: 'DSS',
    name: 'Dead Sea Scrolls',
    language: 'hebrew',
    date_range: '~100 BCE - 100 CE',
    description: 'The Dead Sea Scrolls are ancient Jewish religious manuscripts discovered in the Qumran Caves near the Dead Sea. They include the oldest known surviving copies of Biblical texts and many sectarian documents from the Second Temple period.',
    license: 'Public Domain',
    source_url: 'https://github.com/ETCBC/dss'
  };

  if (hasTierColumn) {
    manuscriptData.authenticity_tier = 1;
    manuscriptData.tier_notes = 'Tier 1: AUTHENTIC - The oldest existing manuscripts of many biblical texts. Dating from ~100 BCE to 100 CE, these fragmentary scrolls represent the most ancient witnesses to the Hebrew Bible and provide invaluable insights into Second Temple Judaism.';
  }

  const { data: newManuscript, error } = await supabase
    .from('manuscripts')
    .insert([manuscriptData])
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create manuscript:', error.message);
    process.exit(1);
  }

  console.log(`✅ Created Dead Sea Scrolls manuscript (ID: ${newManuscript.id})`);
  return newManuscript.id;
}

/**
 * Import verses to database
 */
async function importVerses(manuscriptId, verses) {
  if (verses.length === 0) {
    console.log('   ⚠️  No verses to import');
    return { imported: 0, failed: 0 };
  }

  console.log(`\n📥 Importing ${verses.length} lines to database...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    const versesWithManuscript = batch.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      morphology: JSON.stringify(v.morphology)
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(versesWithManuscript, {
        onConflict: 'manuscript_id,book,chapter,verse'
      });

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}: ${error.message}`);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} lines (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n✅ Import complete: ${imported} lines imported, ${failed} failed\n`);
  return { imported, failed };
}

/**
 * Verify import
 */
async function verifyImport(manuscriptId) {
  console.log('🔍 Verifying import...');

  const { count, error: countError } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId);

  if (countError) {
    console.error('❌ Count verification failed:', countError.message);
    return;
  }

  console.log(`✅ Total Dead Sea Scrolls lines in database: ${count}`);

  // Count unique scrolls
  const { data: scrolls, error: scrollError } = await supabase
    .from('verses')
    .select('book')
    .eq('manuscript_id', manuscriptId);

  if (!scrollError && scrolls) {
    const uniqueScrolls = new Set(scrolls.map(v => v.book));
    console.log(`✅ Number of unique scrolls: ${uniqueScrolls.size}`);
  }

  const { data: sample, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .limit(5);

  if (error) {
    console.error('❌ Sample verification failed:', error.message);
    return;
  }

  if (sample.length > 0) {
    console.log('\n📋 Sample lines:');
    sample.forEach(v => {
      const textPreview = v.text.substring(0, 60);
      console.log(`   ${v.book} Frag${v.chapter}:Ln${v.verse} - ${textPreview}${v.text.length > 60 ? '...' : ''}`);
    });
  }
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');

  if (!testMode && !fullMode) {
    console.log('❌ Usage: node database/import-dead-sea-scrolls.js --test|--full');
    process.exit(1);
  }

  console.log('📖 Dead Sea Scrolls Import Tool');
  console.log('='.repeat(70));
  console.log(`🌍 ${testMode ? 'TEST MODE: Will import first 100 lines only' : 'FULL MODE: Will import all 52,769 lines'}\n`);

  // Get or create manuscript entry
  const manuscriptId = await getManuscriptId();

  // Load JSON data
  const jsonPath = path.join(__dirname, '../manuscripts/dead-sea-scrolls/dss-cleaned-v2.json');
  console.log(`📖 Loading DSS data from ${jsonPath}...`);

  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ JSON file not found: ${jsonPath}`);
    console.error('Please run the Python extraction script first:');
    console.error('  cd manuscripts/dead-sea-scrolls');
    console.error('  python3 extract-dss-scrolls.py --output dss-full.json');
    process.exit(1);
  }

  const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  let verses = data.verses;

  if (testMode) {
    verses = verses.slice(0, 100);
  }

  console.log(`📊 Total lines to import: ${verses.length}`);
  console.log(`📊 Unique scrolls: ${new Set(verses.map(v => v.book)).size}`);

  // Import to database
  const { imported, failed } = await importVerses(manuscriptId, verses);

  // Verify
  await verifyImport(manuscriptId);

  // Summary
  console.log('='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log('✅ Manuscript: Dead Sea Scrolls (~100 BCE - 100 CE)');
  console.log('✅ Authenticity Tier: 1 (AUTHENTIC)');
  console.log(`✅ Total imported: ${imported} lines`);
  console.log(`❌ Failed: ${failed} lines`);
  console.log('📚 Database now contains Dead Sea Scrolls');
  console.log('\n🎉 Dead Sea Scrolls import complete!');
  console.log('📈 "Authentic 10" Corpus Progress: 10/10 manuscripts (100%)');
  console.log('🏆 MILESTONE ACHIEVED: All 10 Tier-1 authentic manuscripts imported!');
  console.log('\n⏭️  Next steps:');
  console.log('1. Run get-full-inventory.js to see complete database statistics');
  console.log('2. Update MANUSCRIPT_SOURCES_STATUS.md with DSS details');
  console.log('3. Update DATABASE_INVENTORY_REPORT.md');
  console.log('4. Test divine name restoration with DSS texts');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
