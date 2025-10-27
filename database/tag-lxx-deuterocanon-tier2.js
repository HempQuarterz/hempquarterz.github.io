#!/usr/bin/env node

/**
 * Tag LXX Deuterocanonical Books as Tier 2
 *
 * Updates canonical_tier for deuterocanonical books in the verses table
 *
 * Usage:
 *   node database/tag-lxx-deuterocanon-tier2.js [--dry-run]
 *
 * Environment:
 *   Requires SUPABASE_SERVICE_ROLE_KEY in .env
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Deuterocanonical book codes (Tier 2)
const DEUTEROCANONICAL_BOOKS = [
  'TOB',   // Tobit
  'JDT',   // Judith
  'ESG',   // Additions to Esther
  'WIS',   // Wisdom of Solomon
  'SIR',   // Sirach (Ecclesiasticus)
  'BAR',   // Baruch
  'LJE',   // Letter of Jeremiah
  'S3Y',   // Prayer of Azariah and Song of the Three
  'SUS',   // Susanna
  'BEL',   // Bel and the Dragon
  '1MA',   // 1 Maccabees
  '2MA',   // 2 Maccabees
  '3MA',   // 3 Maccabees
  '4MA',   // 4 Maccabees
  'PS2',   // Psalm 151
  'MAN',   // Prayer of Manasseh
  '1ES',   // 1 Esdras
  '2ES',   // 2 Esdras
  'ODE'    // Odes (Psalms appendix)
];

// Check for dry-run flag
const isDryRun = process.argv.includes('--dry-run');

/**
 * Tag LXX deuterocanonical verses
 */
async function tagDeuterocanonicalVerses() {
  console.log('\n🔵 Tagging LXX Deuterocanonical Books as Tier 2\n');
  console.log('━'.repeat(80));

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made\n');
  }

  // Get LXX manuscript ID
  const { data: lxxData, error: lxxError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'LXX')
    .single();

  if (lxxError || !lxxData) {
    console.error('❌ Failed to find LXX manuscript:', lxxError?.message);
    process.exit(1);
  }

  const lxxManuscriptId = lxxData.id;
  console.log(`✅ Found LXX manuscript: ${lxxManuscriptId}\n`);

  let totalUpdated = 0;
  const bookResults = [];

  // Process each deuterocanonical book
  for (const bookCode of DEUTEROCANONICAL_BOOKS) {
    // Count verses for this book
    const { count, error: countError } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', lxxManuscriptId)
      .eq('book', bookCode);

    if (countError) {
      console.error(`❌ ${bookCode}: Failed to count verses:`, countError.message);
      bookResults.push({ book: bookCode, count: 0, updated: 0, error: true });
      continue;
    }

    if (count === 0) {
      console.log(`⚠️  ${bookCode}: No verses found (book may not be in LXX import)`);
      bookResults.push({ book: bookCode, count: 0, updated: 0, skipped: true });
      continue;
    }

    if (!isDryRun) {
      // Update canonical_tier to 2 for this book
      const { data: updateData, error: updateError } = await supabase
        .from('verses')
        .update({ canonical_tier: 2 })
        .eq('manuscript_id', lxxManuscriptId)
        .eq('book', bookCode)
        .select('id');

      if (updateError) {
        console.error(`❌ ${bookCode}: Failed to update:`, updateError.message);
        bookResults.push({ book: bookCode, count, updated: 0, error: true });
        continue;
      }

      const updatedCount = updateData?.length || 0;
      console.log(`✅ ${bookCode.padEnd(5)} | Tier 2 | ${updatedCount.toString().padStart(5)} verses tagged`);
      totalUpdated += updatedCount;
      bookResults.push({ book: bookCode, count, updated: updatedCount });
    } else {
      console.log(`🔍 ${bookCode.padEnd(5)} | Tier 2 | ${count.toString().padStart(5)} verses (dry run - would update)`);
      bookResults.push({ book: bookCode, count, updated: 0, dryRun: true });
    }
  }

  console.log('\n' + '━'.repeat(80));
  console.log('\n📊 Tagging Summary:\n');

  if (!isDryRun) {
    console.log(`   Total Verses Tagged: ${totalUpdated}`);
    console.log(`   Books Processed:     ${DEUTEROCANONICAL_BOOKS.length}`);

    const successful = bookResults.filter(r => r.updated > 0).length;
    const failed = bookResults.filter(r => r.error).length;
    const skipped = bookResults.filter(r => r.skipped).length;

    console.log(`   ✅ Successfully Tagged: ${successful} books`);
    console.log(`   ❌ Failed:              ${failed} books`);
    console.log(`   ⚠️  Skipped (no data):  ${skipped} books`);
  } else {
    const totalCount = bookResults.reduce((sum, r) => sum + r.count, 0);
    console.log(`   Total Verses Found:  ${totalCount}`);
    console.log(`   Books Analyzed:      ${DEUTEROCANONICAL_BOOKS.length}`);
    console.log('\n   🔍 This was a DRY RUN - no changes were made');
    console.log('   Run without --dry-run to apply changes');
  }

  console.log('\n' + '━'.repeat(80));

  return { totalUpdated, bookResults };
}

/**
 * Update LXX manuscript tier
 */
async function updateLXXManuscriptTier() {
  console.log('\n🔵 Updating LXX Manuscript Metadata\n');
  console.log('━'.repeat(80));

  if (isDryRun) {
    console.log('🔍 DRY RUN MODE - Manuscript tier would be set to 2\n');
    return;
  }

  const { data, error } = await supabase
    .from('manuscripts')
    .update({
      canonical_tier: 2,  // LXX contains both canonical and deuterocanonical
      canonical_status: 'canonical-and-deuterocanonical',
      era: '3rd-1st c. BCE (translation)',
      provenance_confidence: 0.95,
      manuscript_attestation: [
        'Codex Vaticanus (4th c. CE)',
        'Codex Sinaiticus (4th c. CE)',
        'Codex Alexandrinus (5th c. CE)',
        'Papyri fragments (2nd c. BCE - 4th c. CE)'
      ]
    })
    .eq('code', 'LXX')
    .select();

  if (error) {
    console.error('❌ Failed to update LXX manuscript:', error.message);
    return;
  }

  console.log('✅ LXX manuscript metadata updated:\n');
  console.log('   canonical_tier: 2');
  console.log('   canonical_status: canonical-and-deuterocanonical');
  console.log('   provenance_confidence: 0.95');
  console.log('   manuscript_attestation: 4 major codices/papyri');
  console.log('\n' + '━'.repeat(80));
}

/**
 * Verify tagging
 */
async function verifyTagging() {
  console.log('\n🔍 Verifying Tier 2 Tagging...\n');

  const { data: lxxData, error: lxxError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'LXX')
    .single();

  if (lxxError || !lxxData) {
    console.error('❌ Failed to find LXX manuscript');
    return;
  }

  // Count verses by tier
  const { data, error } = await supabase
    .from('verses')
    .select('book, canonical_tier')
    .eq('manuscript_id', lxxData.id)
    .in('book', DEUTEROCANONICAL_BOOKS);

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  const tier2Count = data.filter(v => v.canonical_tier === 2).length;
  const tier1Count = data.filter(v => v.canonical_tier === 1).length;
  const nullCount = data.filter(v => v.canonical_tier === null).length;

  console.log(`   Deuterocanonical books in LXX:`);
  console.log(`   📗 Tier 2 (correct):  ${tier2Count} verses`);
  console.log(`   📘 Tier 1 (incorrect):${tier1Count} verses`);
  console.log(`   ⚠️  NULL (incorrect):  ${nullCount} verses\n`);

  if (tier1Count > 0 || nullCount > 0) {
    console.log('⚠️  Some verses not properly tagged as Tier 2');
  } else {
    console.log('✅ All deuterocanonical verses properly tagged as Tier 2');
  }

  // Show breakdown by book
  console.log('\n📖 Breakdown by Book:\n');

  const bookCounts = data.reduce((acc, v) => {
    if (!acc[v.book]) {
      acc[v.book] = { tier1: 0, tier2: 0, null: 0 };
    }
    if (v.canonical_tier === 1) acc[v.book].tier1++;
    else if (v.canonical_tier === 2) acc[v.book].tier2++;
    else acc[v.book].null++;
    return acc;
  }, {});

  for (const [book, counts] of Object.entries(bookCounts)) {
    const total = counts.tier1 + counts.tier2 + counts.null;
    const status = counts.tier2 === total ? '✅' : '⚠️';
    console.log(`   ${status} ${book.padEnd(5)} | Tier 2: ${counts.tier2.toString().padStart(4)} / ${total}`);
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await tagDeuterocanonicalVerses();

    if (!isDryRun) {
      await updateLXXManuscriptTier();
      await verifyTagging();
      console.log('\n✅ LXX Deuterocanon Tier 2 Tagging Complete!\n');
    } else {
      console.log('\n🔍 Dry run complete. Run without --dry-run to apply changes.\n');
    }

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}

module.exports = { tagDeuterocanonicalVerses, updateLXXManuscriptTier, verifyTagging };
