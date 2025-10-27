#!/usr/bin/env node

/**
 * Import Canonical Books Tier Mapping
 *
 * Populates the canonical_books table from books_tier_map.json
 *
 * Usage:
 *   node database/import-canonical-books.js
 *
 * Environment:
 *   Requires SUPABASE_SERVICE_ROLE_KEY in .env
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase configuration
const SUPABASE_URL = process.env.REACT_APP_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Set REACT_APP_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Load books_tier_map.json
const booksMapPath = path.join(__dirname, 'books_tier_map.json');
let booksData;

try {
  const rawData = fs.readFileSync(booksMapPath, 'utf8');
  booksData = JSON.parse(rawData);
  console.log(`✅ Loaded books_tier_map.json: ${booksData.books.length} books`);
} catch (error) {
  console.error('❌ Failed to load books_tier_map.json:', error.message);
  process.exit(1);
}

/**
 * Import canonical books to database
 */
async function importCanonicalBooks() {
  console.log('\n🔵 Starting Canonical Books Import\n');
  console.log('━'.repeat(80));

  let successCount = 0;
  let errorCount = 0;
  const tierCounts = { 1: 0, 2: 0, 3: 0, 4: 0 };

  for (const book of booksData.books) {
    try {
      // Prepare book data for insert
      const bookData = {
        book_code: book.code,
        book_name: book.name,
        testament: book.testament,
        canonical_tier: book.tier,
        canonical_status: book.status,
        era: book.era || null,
        language_origin: book.language_origin || null,
        language_extant: book.language_extant || null,
        provenance_confidence: book.provenance_confidence || null,
        manuscript_sources: book.manuscript_sources || null,
        included_in_canons: book.included_in_canons || null,
        quoted_in_nt: book.quoted_in_nt || null,
        divine_name_occurrences: book.divine_name_occurrences || null,
        divine_name_restorations: book.divine_name_restorations || null,
        notes: book.notes || null
      };

      // Upsert (insert or update)
      const { data, error } = await supabase
        .from('canonical_books')
        .upsert(bookData, {
          onConflict: 'book_code',
          ignoreDuplicates: false
        })
        .select();

      if (error) {
        console.error(`❌ ${book.code} (${book.name}): ${error.message}`);
        errorCount++;
      } else {
        console.log(`✅ Tier ${book.tier} | ${book.code.padEnd(5)} | ${book.name} (${book.status})`);
        successCount++;
        tierCounts[book.tier]++;
      }

    } catch (error) {
      console.error(`❌ ${book.code}: Unexpected error:`, error.message);
      errorCount++;
    }
  }

  console.log('\n' + '━'.repeat(80));
  console.log('\n📊 Import Summary:\n');
  console.log(`   Total Books:     ${booksData.books.length}`);
  console.log(`   ✅ Imported:     ${successCount}`);
  console.log(`   ❌ Failed:       ${errorCount}`);
  console.log('\n   By Tier:');
  console.log(`   📘 Tier 1 (Canonical):              ${tierCounts[1]}`);
  console.log(`   📗 Tier 2 (Deuterocanonical):       ${tierCounts[2]}`);
  console.log(`   📙 Tier 3 (Historical Witness):     ${tierCounts[3]}`);
  console.log(`   📕 Tier 4 (Ethiopian Heritage):     ${tierCounts[4]}`);
  console.log('\n' + '━'.repeat(80));

  return { successCount, errorCount, tierCounts };
}

/**
 * Verify import
 */
async function verifyImport() {
  console.log('\n🔍 Verifying Import...\n');

  const { data, error } = await supabase
    .from('canonical_books')
    .select('canonical_tier, canonical_status, book_code')
    .order('canonical_tier', { ascending: true })
    .order('book_code', { ascending: true });

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  console.log(`✅ Total books in database: ${data.length}\n`);

  const groupedByTier = data.reduce((acc, book) => {
    if (!acc[book.canonical_tier]) {
      acc[book.canonical_tier] = [];
    }
    acc[book.canonical_tier].push(book);
    return acc;
  }, {});

  for (const [tier, books] of Object.entries(groupedByTier)) {
    console.log(`📖 Tier ${tier}: ${books.length} books`);

    // Show first 5 books per tier
    books.slice(0, 5).forEach(book => {
      console.log(`   - ${book.book_code} (${book.canonical_status})`);
    });

    if (books.length > 5) {
      console.log(`   ... and ${books.length - 5} more\n`);
    } else {
      console.log('');
    }
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const result = await importCanonicalBooks();

    if (result.errorCount === 0) {
      await verifyImport();
      console.log('\n✅ Canonical Books Import Complete!\n');
      process.exit(0);
    } else {
      console.log(`\n⚠️  Import completed with ${result.errorCount} errors\n`);
      process.exit(1);
    }
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

module.exports = { importCanonicalBooks, verifyImport };
