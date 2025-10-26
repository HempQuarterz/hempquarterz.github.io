#!/usr/bin/env node
/**
 * Dead Sea Scrolls Data Quality Analyzer
 *
 * Analyzes the DSS JSON file for data quality issues:
 * - Duplicate entries (same book/chapter/verse)
 * - Invalid verse numbers (≤ 0)
 * - Invalid chapter numbers (≤ 0)
 * - Generates detailed report
 *
 * Usage:
 *   node database/analyze-dss-data-quality.js
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('Dead Sea Scrolls Data Quality Analyzer');
console.log('═══════════════════════════════════════════════════════════════\n');

// Load DSS data
const jsonPath = path.join(__dirname, '../manuscripts/dead-sea-scrolls/dss-full.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ File not found: ${jsonPath}`);
  process.exit(1);
}

console.log(`📖 Loading data from: ${jsonPath}`);
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const verses = data.verses;

console.log(`📊 Total verses: ${verses.length}\n`);

// =====================================================================
// ANALYSIS 1: Find Duplicates
// =====================================================================

console.log('🔍 ANALYSIS 1: Checking for duplicates...');

const seen = new Map();
const duplicates = [];

verses.forEach((verse, index) => {
  const key = `${verse.book}|${verse.chapter}|${verse.verse}`;

  if (seen.has(key)) {
    duplicates.push({
      key,
      first_occurrence: seen.get(key),
      duplicate_occurrence: index,
      book: verse.book,
      chapter: verse.chapter,
      verse: verse.verse
    });
  } else {
    seen.set(key, index);
  }
});

console.log(`   Found ${duplicates.length} duplicate entries`);

if (duplicates.length > 0) {
  console.log('\n   Sample duplicates (first 10):');
  duplicates.slice(0, 10).forEach(dup => {
    console.log(`   - ${dup.book} ${dup.chapter}:${dup.verse} (indices: ${dup.first_occurrence}, ${dup.duplicate_occurrence})`);
  });

  // Group duplicates by book
  const dupsByBook = {};
  duplicates.forEach(dup => {
    if (!dupsByBook[dup.book]) dupsByBook[dup.book] = 0;
    dupsByBook[dup.book]++;
  });

  console.log('\n   Duplicates by scroll:');
  Object.entries(dupsByBook)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .forEach(([book, count]) => {
      console.log(`   - ${book}: ${count} duplicates`);
    });
}

// =====================================================================
// ANALYSIS 2: Invalid Verse Numbers
// =====================================================================

console.log('\n🔍 ANALYSIS 2: Checking for invalid verse numbers (≤ 0)...');

const invalidVerses = verses
  .map((v, index) => ({ ...v, index }))
  .filter(v => v.verse <= 0);

console.log(`   Found ${invalidVerses.length} invalid verse numbers`);

if (invalidVerses.length > 0) {
  console.log('\n   Sample invalid verses (first 10):');
  invalidVerses.slice(0, 10).forEach(v => {
    console.log(`   - Index ${v.index}: ${v.book} ${v.chapter}:${v.verse}`);
  });

  // Group by verse value
  const verseValueCounts = {};
  invalidVerses.forEach(v => {
    const val = v.verse;
    if (!verseValueCounts[val]) verseValueCounts[val] = 0;
    verseValueCounts[val]++;
  });

  console.log('\n   Breakdown by verse value:');
  Object.entries(verseValueCounts)
    .sort((a, b) => a[0] - b[0])
    .forEach(([val, count]) => {
      console.log(`   - Verse = ${val}: ${count} occurrences`);
    });
}

// =====================================================================
// ANALYSIS 3: Invalid Chapter Numbers
// =====================================================================

console.log('\n🔍 ANALYSIS 3: Checking for invalid chapter numbers (≤ 0)...');

const invalidChapters = verses
  .map((v, index) => ({ ...v, index }))
  .filter(v => v.chapter <= 0);

console.log(`   Found ${invalidChapters.length} invalid chapter numbers`);

if (invalidChapters.length > 0) {
  console.log('\n   Sample invalid chapters (first 10):');
  invalidChapters.slice(0, 10).forEach(v => {
    console.log(`   - Index ${v.index}: ${v.book} ${v.chapter}:${v.verse}`);
  });

  // Group by chapter value
  const chapterValueCounts = {};
  invalidChapters.forEach(v => {
    const val = v.chapter;
    if (!chapterValueCounts[val]) chapterValueCounts[val] = 0;
    chapterValueCounts[val]++;
  });

  console.log('\n   Breakdown by chapter value:');
  Object.entries(chapterValueCounts)
    .sort((a, b) => a[0] - b[0])
    .forEach(([val, count]) => {
      console.log(`   - Chapter = ${val}: ${count} occurrences`);
    });
}

// =====================================================================
// ANALYSIS 4: Batch Impact
// =====================================================================

console.log('\n🔍 ANALYSIS 4: Calculating batch import impact...');

const BATCH_SIZE = 100;
const totalBatches = Math.ceil(verses.length / BATCH_SIZE);

// Find which batches contain problematic entries
const problematicIndices = new Set([
  ...duplicates.map(d => d.duplicate_occurrence),
  ...invalidVerses.map(v => v.index),
  ...invalidChapters.map(v => v.index)
]);

const problematicBatches = new Set();
problematicIndices.forEach(index => {
  const batchNum = Math.floor(index / BATCH_SIZE);
  problematicBatches.add(batchNum);
});

const failedLines = problematicBatches.size * BATCH_SIZE;

console.log(`   Total batches: ${totalBatches}`);
console.log(`   Problematic batches: ${problematicBatches.size}`);
console.log(`   Estimated failed lines: ${failedLines} (${Math.round(failedLines/verses.length*100)}%)`);
console.log(`   Expected successful lines: ${verses.length - failedLines} (${Math.round((verses.length - failedLines)/verses.length*100)}%)`);

// =====================================================================
// SUMMARY
// =====================================================================

console.log('\n═══════════════════════════════════════════════════════════════');
console.log('SUMMARY');
console.log('═══════════════════════════════════════════════════════════════');

const totalProblems = duplicates.length + invalidVerses.length + invalidChapters.length;

console.log(`\n📊 Data Quality Issues:`);
console.log(`   - Duplicate entries: ${duplicates.length}`);
console.log(`   - Invalid verse numbers: ${invalidVerses.length}`);
console.log(`   - Invalid chapter numbers: ${invalidChapters.length}`);
console.log(`   - TOTAL PROBLEMATIC ENTRIES: ${totalProblems}`);

console.log(`\n📊 Import Impact:`);
console.log(`   - Problematic batches: ${problematicBatches.size} / ${totalBatches}`);
console.log(`   - Estimated failed lines: ${failedLines}`);
console.log(`   - Expected successful import: ${verses.length - failedLines} lines (${Math.round((verses.length - failedLines)/verses.length*100)}%)`);

console.log(`\n💡 Recommended Actions:`);
console.log(`   1. De-duplicate entries (keep first occurrence)`);
console.log(`   2. Fix invalid verse numbers (convert 0 → 1)`);
console.log(`   3. Fix invalid chapter numbers (convert 0 → 1)`);
console.log(`   4. Re-import cleaned data`);

console.log('\n═══════════════════════════════════════════════════════════════\n');

// Export detailed report
const report = {
  total_verses: verses.length,
  duplicates: {
    count: duplicates.length,
    examples: duplicates.slice(0, 20)
  },
  invalid_verses: {
    count: invalidVerses.length,
    examples: invalidVerses.slice(0, 20).map(v => ({
      index: v.index,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse
    }))
  },
  invalid_chapters: {
    count: invalidChapters.length,
    examples: invalidChapters.slice(0, 20).map(v => ({
      index: v.index,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse
    }))
  },
  batch_analysis: {
    batch_size: BATCH_SIZE,
    total_batches: totalBatches,
    problematic_batches: problematicBatches.size,
    estimated_failed_lines: failedLines,
    expected_success_rate: Math.round((verses.length - failedLines)/verses.length*100)
  }
};

const reportPath = path.join(__dirname, '../manuscripts/dead-sea-scrolls/dss-quality-report.json');
fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
console.log(`📄 Detailed report saved to: ${reportPath}\n`);
