#!/usr/bin/env node
/**
 * Cross-References Import Script - All4Yah Project
 *
 * Imports cross-reference data from OpenBible.info (via scrollmapper/bible_databases)
 * - 344,800 cross-reference links
 * - Parallel passages, quotations, thematic connections
 * - Votes indicate relevance/strength of connection
 * - License: CC-BY (OpenBible.info)
 *
 * Data Format (TSV):
 *   From Verse → To Verse → Votes
 *   Gen.1.1 → Rev.4.11 → 165
 *
 * Usage:
 *   node database/import-cross-references.js --test    # First 100 links only
 *   node database/import-cross-references.js --limit=1000  # First 1000 links
 *   node database/import-cross-references.js --full    # All 344,800 links
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// =====================================================================
// Book Name Mapping: Full name → 3-letter code
// =====================================================================

const BOOK_CODE_MAP = {
  // Old Testament
  'Genesis': 'GEN', 'Exodus': 'EXO', 'Leviticus': 'LEV', 'Numbers': 'NUM', 'Deuteronomy': 'DEU',
  'Joshua': 'JOS', 'Judges': 'JDG', 'Ruth': 'RUT',
  '1Samuel': '1SA', '2Samuel': '2SA', '1Kings': '1KI', '2Kings': '2KI',
  '1Chronicles': '1CH', '2Chronicles': '2CH',
  'Ezra': 'EZR', 'Nehemiah': 'NEH', 'Esther': 'EST',
  'Job': 'JOB', 'Psalms': 'PSA', 'Proverbs': 'PRO', 'Ecclesiastes': 'ECC', 'SongofSongs': 'SNG',
  'Isaiah': 'ISA', 'Jeremiah': 'JER', 'Lamentations': 'LAM', 'Ezekiel': 'EZK', 'Daniel': 'DAN',
  'Hosea': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obadiah': 'OBA', 'Jonah': 'JON',
  'Micah': 'MIC', 'Nahum': 'NAM', 'Habakkuk': 'HAB', 'Zephaniah': 'ZEP',
  'Haggai': 'HAG', 'Zechariah': 'ZEC', 'Malachi': 'MAL',

  // New Testament
  'Matthew': 'MAT', 'Mark': 'MRK', 'Luke': 'LUK', 'John': 'JHN',
  'Acts': 'ACT', 'Romans': 'ROM',
  '1Corinthians': '1CO', '2Corinthians': '2CO',
  'Galatians': 'GAL', 'Ephesians': 'EPH', 'Philippians': 'PHP', 'Colossians': 'COL',
  '1Thessalonians': '1TH', '2Thessalonians': '2TH',
  '1Timothy': '1TI', '2Timothy': '2TI', 'Titus': 'TIT', 'Philemon': 'PHM',
  'Hebrews': 'HEB', 'James': 'JAS',
  '1Peter': '1PE', '2Peter': '2PE',
  '1John': '1JN', '2John': '2JN', '3John': '3JN',
  'Jude': 'JUD', 'Revelation': 'REV',

  // Alternative spellings
  'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
  'Josh': 'JOS', 'Judg': 'JDG', '1Sam': '1SA', '2Sam': '2SA', '1Kgs': '1KI', '2Kgs': '2KI',
  '1Chr': '1CH', '2Chr': '2CH', 'Neh': 'NEH', 'Esth': 'EST',
  'Ps': 'PSA', 'Prov': 'PRO', 'Eccl': 'ECC', 'Song': 'SNG',
  'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM', 'Ezek': 'EZK', 'Dan': 'DAN',
  'Hos': 'HOS', 'Obad': 'OBA', 'Jon': 'JON', 'Mic': 'MIC', 'Nah': 'NAM', 'Hab': 'HAB',
  'Zeph': 'ZEP', 'Hag': 'HAG', 'Zech': 'ZEC', 'Mal': 'MAL',
  'Matt': 'MAT', 'Mk': 'MRK', 'Lk': 'LUK', 'Jn': 'JHN',
  '1Cor': '1CO', '2Cor': '2CO', 'Gal': 'GAL', 'Eph': 'EPH', 'Phil': 'PHP', 'Col': 'COL',
  '1Thess': '1TH', '2Thess': '2TH', '1Tim': '1TI', '2Tim': '2TI', 'Tit': 'TIT', 'Phlm': 'PHM',
  'Heb': 'HEB', 'Jas': 'JAS', '1Pet': '1PE', '2Pet': '2PE', '1Jn': '1JN', '2Jn': '2JN', '3Jn': '3JN',
  'Rev': 'REV'
};

// =====================================================================
// Parse Reference: "Gen.1.1" → {book: "GEN", chapter: 1, verse: 1}
// =====================================================================

function parseReference(ref) {
  // Remove spaces: "1 Sam.1.1" → "1Sam.1.1"
  ref = ref.replace(/\s+/g, '');

  // Parse: "Gen.1.1" or "Gen.1.1-Gen.1.3" (range)
  const parts = ref.split('-');
  const fromPart = parts[0];

  // Split book.chapter.verse
  const match = fromPart.match(/^([A-Za-z0-9]+)\.(\d+)\.(\d+)$/);
  if (!match) {
    console.warn(`⚠️  Invalid reference format: ${ref}`);
    return null;
  }

  const [_, bookName, chapter, verse] = match;
  const bookCode = BOOK_CODE_MAP[bookName];

  if (!bookCode) {
    console.warn(`⚠️  Unknown book name: ${bookName} in ${ref}`);
    return null;
  }

  const parsed = {
    book: bookCode,
    chapter: parseInt(chapter, 10),
    verse: parseInt(verse, 10)
  };

  // Handle ranges: "Prov.8.22-Prov.8.30"
  if (parts.length > 1) {
    const toMatch = parts[1].match(/^([A-Za-z0-9]+)\.(\d+)\.(\d+)$/);
    if (toMatch) {
      parsed.verse_end = parseInt(toMatch[3], 10);
    }
  }

  return parsed;
}

// =====================================================================
// Get Manuscript ID for WLC (Hebrew OT) and SBLGNT (Greek NT)
// =====================================================================

let WLC_ID = null;
let SBLGNT_ID = null;

async function getManuscriptIds() {
  // Get WLC (Hebrew OT)
  const { data: wlc } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WLC')
    .single();

  if (!wlc) {
    console.error('❌ WLC manuscript not found');
    process.exit(1);
  }

  WLC_ID = wlc.id;
  console.log(`✅ Found WLC manuscript: ${WLC_ID}`);

  // Get SBLGNT (Greek NT)
  const { data: sblgnt } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'SBLGNT')
    .single();

  if (!sblgnt) {
    console.error('❌ SBLGNT manuscript not found');
    process.exit(1);
  }

  SBLGNT_ID = sblgnt.id;
  console.log(`✅ Found SBLGNT manuscript: ${SBLGNT_ID}`);
}

// =====================================================================
// Determine Manuscript ID by Book Code
// =====================================================================

function getManuscriptIdForBook(bookCode) {
  const OT_BOOKS = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU', 'JOS', 'JDG', 'RUT', '1SA', '2SA',
    '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST', 'JOB', 'PSA', 'PRO', 'ECC', 'SNG',
    'ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM',
    'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'];

  return OT_BOOKS.includes(bookCode) ? WLC_ID : SBLGNT_ID;
}

// =====================================================================
// Load Cross-References from File
// =====================================================================

function loadCrossReferences(filePath, limit = null) {
  console.log(`📖 Loading cross-references from: ${filePath}`);

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const crossRefs = [];
  let skipped = 0;

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse TSV: "From Verse\tTo Verse\tVotes"
    const [fromVerse, toVerse, votes] = line.split('\t');

    const fromParsed = parseReference(fromVerse);
    const toParsed = parseReference(toVerse);

    if (!fromParsed || !toParsed) {
      skipped++;
      continue;
    }

    crossRefs.push({
      from: fromParsed,
      to: toParsed,
      votes: parseInt(votes, 10) || 0
    });

    if (limit && crossRefs.length >= limit) {
      console.log(`   Reached limit of ${limit} cross-references`);
      break;
    }
  }

  console.log(`✅ Loaded ${crossRefs.length} cross-references`);
  if (skipped > 0) {
    console.log(`   ⚠️  Skipped ${skipped} invalid references`);
  }

  return crossRefs;
}

// =====================================================================
// Import to Database
// =====================================================================

async function importCrossReferences(crossRefs) {
  console.log(`\n📥 Importing ${crossRefs.length} cross-references to database...`);

  const BATCH_SIZE = 500;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < crossRefs.length; i += BATCH_SIZE) {
    const batch = crossRefs.slice(i, i + BATCH_SIZE);

    const records = batch.map(ref => ({
      source_manuscript_id: getManuscriptIdForBook(ref.from.book),
      source_book: ref.from.book,
      source_chapter: ref.from.chapter,
      source_verse: ref.from.verse,
      target_manuscript_id: getManuscriptIdForBook(ref.to.book),
      target_book: ref.to.book,
      target_chapter: ref.to.chapter,
      target_verse: ref.to.verse,
      link_type: 'reference', // OpenBible.info provides general references
      category: 'cross_reference',
      direction: 'bidirectional', // Most cross-refs work both ways
      notes: `Votes: ${ref.votes} (relevance score from OpenBible.info)`
    }));

    const { error } = await supabase
      .from('cross_references')
      .upsert(records, { onConflict: 'id', ignoreDuplicates: false });

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}: ${error.message}`);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${crossRefs.length} (${Math.round(imported/crossRefs.length*100)}%)`);
    }
  }

  console.log(`\n✅ Import complete: ${imported} imported, ${failed} failed\n`);
  return { imported, failed };
}

// =====================================================================
// Verify Import
// =====================================================================

async function verifyImport() {
  console.log('🔍 Verifying import...');

  const { count, error } = await supabase
    .from('cross_references')
    .select('*', { count: 'exact', head: true });

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  console.log(`✅ Total cross-references in database: ${count}`);

  // Sample some cross-references
  const { data: sample } = await supabase
    .from('cross_references')
    .select('source_book, source_chapter, source_verse, target_book, target_chapter, target_verse, notes')
    .limit(5);

  if (sample && sample.length > 0) {
    console.log('\n📋 Sample cross-references:');
    sample.forEach(ref => {
      console.log(`   ${ref.source_book} ${ref.source_chapter}:${ref.source_verse} → ${ref.target_book} ${ref.target_chapter}:${ref.target_verse}`);
      console.log(`      ${ref.notes}`);
    });
  }
}

// =====================================================================
// Main
// =====================================================================

async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');
  const limitArg = args.find(arg => arg.startsWith('--limit='));

  let limit = null;
  if (testMode) {
    limit = 100;
  } else if (limitArg) {
    limit = parseInt(limitArg.split('=')[1], 10);
  } else if (!fullMode) {
    console.log('❌ Usage: node database/import-cross-references.js --test|--limit=N|--full');
    process.exit(1);
  }

  console.log('📖 Cross-References Import Tool - All4Yah Project');
  console.log('='.repeat(70));
  console.log(`🌍 Mode: ${testMode ? 'TEST (100 links)' : fullMode ? 'FULL (344,800 links)' : `LIMIT (${limit} links)`}\n`);

  // Get manuscript IDs
  await getManuscriptIds();

  // Load cross-references
  const filePath = path.join(__dirname, '../manuscripts/cross-references/openbible-cross-references.txt');
  const crossRefs = loadCrossReferences(filePath, limit);

  // Import
  const { imported, failed } = await importCrossReferences(crossRefs);

  // Verify
  await verifyImport();

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log('✅ Source: OpenBible.info (CC-BY)');
  console.log('✅ Total cross-references processed: ' + crossRefs.length);
  console.log(`✅ Successfully imported: ${imported}`);
  console.log(`❌ Failed: ${failed}`);
  console.log('📚 Database now contains biblical cross-references');
  console.log('\n🎉 Cross-references import complete!');
  console.log('\n⏭️  Next steps:');
  console.log('1. Test cross-reference lookups via API');
  console.log('2. Create UI for displaying parallel passages');
  console.log('3. Update documentation with cross-references status');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
