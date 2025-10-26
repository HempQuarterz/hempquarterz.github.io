#!/usr/bin/env node
/**
 * Dead Sea Scrolls Data Cleaning Script
 *
 * Cleans the DSS JSON file by:
 * 1. Fixing invalid verse numbers (0 → 1)
 * 2. Fixing invalid chapter numbers (0 → 1)
 * 3. Removing duplicate entries AFTER fixing (keep first occurrence)
 *
 * Usage:
 *   node database/clean-dss-data.js
 *
 * Output:
 *   manuscripts/dead-sea-scrolls/dss-cleaned.json
 */

const fs = require('fs');
const path = require('path');

console.log('═══════════════════════════════════════════════════════════════');
console.log('Dead Sea Scrolls Data Cleaning Tool');
console.log('═══════════════════════════════════════════════════════════════\n');

// Load original data
const jsonPath = path.join(__dirname, '../manuscripts/dead-sea-scrolls/dss-full.json');

if (!fs.existsSync(jsonPath)) {
  console.error(`❌ File not found: ${jsonPath}`);
  process.exit(1);
}

console.log(`📖 Loading data from: ${jsonPath}`);
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
let verses = data.verses;

console.log(`📊 Original verses: ${verses.length}\n`);

// =====================================================================
// STEP 1: Fix Invalid Verse Numbers (0 → 1)
// =====================================================================

console.log('🔧 STEP 1: Fixing invalid verse numbers...');

let fixedVerseNumbers = 0;

verses.forEach(verse => {
  if (verse.verse <= 0) {
    verse.verse = 1;
    fixedVerseNumbers++;
  }
});

console.log(`   ✅ Fixed ${fixedVerseNumbers} invalid verse numbers (0 → 1)\n`);

// =====================================================================
// STEP 2: Fix Invalid Chapter Numbers (0 → 1)
// =====================================================================

console.log('🔧 STEP 2: Fixing invalid chapter numbers...');

let fixedChapterNumbers = 0;

verses.forEach(verse => {
  if (verse.chapter <= 0) {
    verse.chapter = 1;
    fixedChapterNumbers++;
  }
});

console.log(`   ✅ Fixed ${fixedChapterNumbers} invalid chapter numbers (0 → 1)\n`);

// =====================================================================
// STEP 3: Remove Duplicates AFTER fixing (keep first occurrence)
// =====================================================================

console.log('🧹 STEP 3: Removing duplicates (after fixing invalid values)...');

const seen = new Set();
const deduplicatedVerses = [];
let duplicatesRemoved = 0;

verses.forEach((verse, index) => {
  const key = `${verse.book}|${verse.chapter}|${verse.verse}`;

  if (seen.has(key)) {
    duplicatesRemoved++;
  } else {
    seen.add(key);
    deduplicatedVerses.push(verse);
  }
});

console.log(`   ✅ Removed ${duplicatesRemoved} duplicate entries`);
console.log(`   ✅ Remaining verses: ${deduplicatedVerses.length}\n`);

// =====================================================================
// STEP 4: Validate Cleaned Data
// =====================================================================

console.log('✅ STEP 4: Validating cleaned data...');

// Check for remaining duplicates
const finalSeen = new Set();
let remainingDuplicates = 0;

deduplicatedVerses.forEach(verse => {
  const key = `${verse.book}|${verse.chapter}|${verse.verse}`;
  if (finalSeen.has(key)) {
    remainingDuplicates++;
  } else {
    finalSeen.add(key);
  }
});

// Check for remaining invalid values
const remainingInvalidVerses = deduplicatedVerses.filter(v => v.verse <= 0).length;
const remainingInvalidChapters = deduplicatedVerses.filter(v => v.chapter <= 0).length;

console.log(`   - Remaining duplicates: ${remainingDuplicates}`);
console.log(`   - Remaining invalid verse numbers: ${remainingInvalidVerses}`);
console.log(`   - Remaining invalid chapters: ${remainingInvalidChapters}`);

if (remainingDuplicates > 0 || remainingInvalidVerses > 0 || remainingInvalidChapters > 0) {
  console.error('\n❌ WARNING: Data still contains issues!');
} else {
  console.log('\n   ✅ All data quality issues resolved!\n');
}

// =====================================================================
// STEP 5: Save Cleaned Data
// =====================================================================

console.log('💾 STEP 5: Saving cleaned data...');

const cleanedData = {
  ...data,
  verses: deduplicatedVerses,
  line_count: deduplicatedVerses.length,
  cleaning_metadata: {
    original_count: verses.length,
    cleaned_count: deduplicatedVerses.length,
    duplicates_removed: duplicatesRemoved,
    verse_numbers_fixed: fixedVerseNumbers,
    chapter_numbers_fixed: fixedChapterNumbers,
    cleaning_date: new Date().toISOString()
  }
};

const outputPath = path.join(__dirname, '../manuscripts/dead-sea-scrolls/dss-cleaned.json');
fs.writeFileSync(outputPath, JSON.stringify(cleanedData, null, 2));

const fileSizeMB = (fs.statSync(outputPath).size / (1024 * 1024)).toFixed(2);
console.log(`   ✅ Cleaned data saved to: ${outputPath}`);
console.log(`   ✅ File size: ${fileSizeMB} MB\n`);

// =====================================================================
// SUMMARY
// =====================================================================

console.log('═══════════════════════════════════════════════════════════════');
console.log('CLEANING SUMMARY');
console.log('═══════════════════════════════════════════════════════════════\n');

console.log(`📊 Before Cleaning:`);
console.log(`   - Total verses: ${verses.length}`);
console.log(`   - Invalid verse numbers: ${fixedVerseNumbers}`);
console.log(`   - Invalid chapter numbers: ${fixedChapterNumbers}`);
console.log(`   - Duplicate entries (after fixing): ${duplicatesRemoved}`);

console.log(`\n📊 After Cleaning:`);
console.log(`   - Total verses: ${deduplicatedVerses.length}`);
console.log(`   - Verses removed: ${verses.length - deduplicatedVerses.length}`);
console.log(`   - Data retained: ${Math.round((deduplicatedVerses.length / verses.length) * 100)}%`);

console.log(`\n📊 Quality Metrics:`);
console.log(`   - Remaining duplicates: ${remainingDuplicates} ${remainingDuplicates === 0 ? '✅' : '❌'}`);
console.log(`   - Remaining invalid verses: ${remainingInvalidVerses} ${remainingInvalidVerses === 0 ? '✅' : '❌'}`);
console.log(`   - Remaining invalid chapters: ${remainingInvalidChapters} ${remainingInvalidChapters === 0 ? '✅' : '❌'}`);

console.log(`\n💡 Next Steps:`);
console.log(`   1. Review cleaned data in: ${outputPath}`);
console.log(`   2. Clear existing DSS verses from database:`);
console.log(`      DELETE FROM verses WHERE manuscript_id = (SELECT id FROM manuscripts WHERE code = 'DSS');`);
console.log(`   3. Update import script to use cleaned data`);
console.log(`   4. Run import with cleaned data`);

console.log('\n═══════════════════════════════════════════════════════════════\n');
