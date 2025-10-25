/**
 * Retry Failed Imports - Universal script for all manuscripts
 *
 * Handles two types of import failures:
 * 1. Duplicate verses within same batch (ON CONFLICT errors)
 * 2. Invalid verse numbers (verse ≤ 0) - CANNOT be fixed due to CHECK constraint
 *
 * Strategy:
 * - For duplicates: Import only the first occurrence of each verse
 * - For verse ≤ 0: Skip these entirely (documented as unfixable)
 *
 * Usage:
 *   node database/retry-failed-imports.js --manuscript SIN --dry-run
 *   node database/retry-failed-imports.js --manuscript SIN --execute
 *   node database/retry-failed-imports.js --manuscript LXX --execute
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const { DOMParser } = require('@xmldom/xmldom');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Manuscript configurations
const MANUSCRIPTS = {
  SIN: {
    name: 'Codex Sinaiticus',
    xmlPath: '../../manuscripts/codex-sinaiticus/codex-sinaiticus/sinaiticus_full_v195.xml',
    bookMap: {
      'Γένεϲιϲ': 'GEN',
      'Ἀριθμοί': 'NUM',
      'Δευτερονόμιον': 'DEU',
      'Ἐϲθήρ': 'EST',
      'Ἰουδίθ': 'JDT',
      'Ἠϲαΐαϲ': 'ISA',
      'Ἰωήλ': 'JOL',
      'Ὀβδιού': 'OBA',
      'Ναούμ': 'NAM',
      'Ἀμβακούμ': 'HAB',
      'Ψαλμοί': 'PSA',
      'Παροιμίαι': 'PRO',
      'Ἰώβ': 'JOB',
      'Κατὰ Μάρκον': 'MRK',
      'Κατὰ Λουκᾶν': 'LUK',
      'Κατὰ Ἰωάννην': 'JHN',
      'Ἰακώβου': 'JAS',
      'Ἰούδα': 'JUD'
    }
  },
  LXX: {
    name: 'Septuagint (Rahlfs 1935)',
    csvPath: '../../manuscripts/septuagint/LXX-Rahlfs-1935/11_end-users_files/MyBible/Bibles/LXX_final_main.csv',
    bookMap: {
      10: 'GEN', 20: 'EXO', 30: 'LEV', 40: 'NUM', 50: 'DEU',
      60: 'JOS', 70: 'JDG', 80: 'RUT', 90: '1SA', 100: '2SA',
      110: '1KI', 120: '2KI', 130: '1CH', 140: '2CH', 150: 'EZR',
      160: 'NEH', 190: 'EST', 220: 'JOB', 230: 'PSA', 240: 'PRO',
      250: 'ECC', 260: 'SNG', 290: 'ISA', 300: 'JER', 310: 'LAM',
      330: 'EZK', 340: 'DAN', 350: 'HOS', 360: 'JOL', 370: 'AMO',
      380: 'OBA', 390: 'JON', 400: 'MIC', 410: 'NAM', 420: 'HAB',
      430: 'ZEP', 440: 'HAG', 450: 'ZEC', 460: 'MAL'
    }
  }
};

/**
 * Get manuscript ID from database
 */
async function getManuscriptId(code) {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', code)
    .single();

  if (error || !data) {
    throw new Error(`Manuscript ${code} not found in database`);
  }

  return data.id;
}

/**
 * Get list of already imported verses
 */
async function getImportedVerses(manuscriptId) {
  const importedSet = new Set();
  let page = 0;
  const pageSize = 1000;
  let hasMore = true;

  // Paginate through all verses (Supabase has a 1000 row limit by default)
  while (hasMore) {
    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse')
      .eq('manuscript_id', manuscriptId)
      .range(page * pageSize, (page + 1) * pageSize - 1);

    if (error) {
      throw new Error(`Failed to query verses: ${error.message}`);
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      data.forEach(v => {
        importedSet.add(`${v.book}:${v.chapter}:${v.verse}`);
      });

      hasMore = data.length === pageSize;
      page++;
    }
  }

  return importedSet;
}

/**
 * Parse Codex Sinaiticus XML (same logic as import script)
 */
function parseSinaiticusXML(xmlPath, importedVerses) {
  console.log('   📖 Parsing XML...');

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  const verses = [];
  const seenKeys = new Set(); // Deduplicate within this parse
  let duplicateCount = 0;
  let invalidCount = 0;

  const bookElements = doc.getElementsByTagName('div');
  const bookMap = MANUSCRIPTS.SIN.bookMap;

  for (let i = 0; i < bookElements.length; i++) {
    const bookElement = bookElements[i];
    if (bookElement.getAttribute('type') !== 'book') continue;

    const bookTitle = bookElement.getAttribute('title');
    if (!bookTitle) continue;

    const bookCode = bookMap[bookTitle];
    if (!bookCode) continue;

    const chapterElements = bookElement.getElementsByTagName('div');

    for (let j = 0; j < chapterElements.length; j++) {
      const chapterElement = chapterElements[j];
      if (chapterElement.getAttribute('type') !== 'chapter') continue;

      const chapter = parseInt(chapterElement.getAttribute('n'), 10);
      if (isNaN(chapter)) continue;

      const verseElements = chapterElement.getElementsByTagName('ab');

      for (let k = 0; k < verseElements.length; k++) {
        const verseElement = verseElements[k];
        const verse = parseInt(verseElement.getAttribute('n'), 10);

        if (isNaN(verse)) continue;

        const verseKey = `${bookCode}:${chapter}:${verse}`;

        // Skip if verse ≤ 0 (CHECK constraint violation)
        if (verse <= 0) {
          invalidCount++;
          continue;
        }

        // Skip if already imported
        if (importedVerses.has(verseKey)) {
          continue;
        }

        // Skip duplicates within this batch (keep first occurrence)
        if (seenKeys.has(verseKey)) {
          duplicateCount++;
          continue;
        }

        seenKeys.add(verseKey);

        // Extract text (simplified - would need full parsing for morphology)
        const text = extractText(verseElement);
        if (!text.trim()) continue;

        verses.push({
          book: bookCode,
          chapter,
          verse,
          text,
          morphology: null // Simplified for retry
        });
      }
    }
  }

  console.log(`   ℹ️  Skipped ${duplicateCount} duplicate verses`);
  console.log(`   ℹ️  Skipped ${invalidCount} invalid verses (verse ≤ 0)`);

  return verses;
}

function extractText(element) {
  let text = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if (node.nodeType === 3) {
      text += node.nodeValue;
    } else if (node.nodeType === 1) {
      if (node.tagName === 'w') {
        text += extractText(node) + ' ';
      } else {
        text += extractText(node);
      }
    }
  }
  return text.trim();
}

/**
 * Parse LXX CSV
 */
function parseLXXCSV(csvPath, importedVerses) {
  console.log('   📖 Parsing CSV...');

  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  const verses = [];
  const seenKeys = new Set();
  const bookMap = MANUSCRIPTS.LXX.bookMap;

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split('\t');
    if (parts.length !== 4) continue;

    const bookNum = parseInt(parts[0], 10);
    const chapter = parseInt(parts[1], 10);
    const verse = parseInt(parts[2], 10);
    const rawText = parts[3];

    const bookCode = bookMap[bookNum];
    if (!bookCode) continue;

    if (verse <= 0) continue; // Skip invalid

    const verseKey = `${bookCode}:${chapter}:${verse}`;

    // Skip already imported
    if (importedVerses.has(verseKey)) continue;

    // Skip duplicates
    if (seenKeys.has(verseKey)) continue;

    seenKeys.add(verseKey);

    // Parse text (simplified)
    const text = rawText.replace(/<S>\d+<\/S>/g, '').replace(/<m>[^<]+<\/m>/g, '').trim();

    verses.push({
      book: bookCode,
      chapter,
      verse,
      text,
      morphology: null
    });
  }

  return verses;
}

/**
 * Import verses to database
 */
async function importVerses(manuscriptId, verses, dryRun) {
  if (verses.length === 0) {
    console.log('   ✅ No new verses to import\n');
    return { imported: 0, failed: 0 };
  }

  if (dryRun) {
    console.log(`\n   🔍 DRY RUN: Would import ${verses.length} verses`);
    console.log('   Sample verses:');
    verses.slice(0, 5).forEach(v => {
      console.log(`      ${v.book} ${v.chapter}:${v.verse} - ${v.text.substring(0, 60)}...`);
    });
    return { imported: 0, failed: 0 };
  }

  console.log(`\n   📥 Importing ${verses.length} verses...`);

  const BATCH_SIZE = 50; // Smaller batches for retry
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    const versesWithManuscript = batch.map(v => ({
      ...v,
      manuscript_id: manuscriptId,
      morphology: v.morphology ? JSON.stringify(v.morphology) : null
    }));

    const { error } = await supabase
      .from('verses')
      .insert(versesWithManuscript);

    if (error) {
      console.error(`   ❌ Batch ${i}-${i + batch.length} failed: ${error.message}`);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n   ✅ Import complete: ${imported} imported, ${failed} failed`);
  return { imported, failed };
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const manuscriptArg = args.find(a => a.startsWith('--manuscript='));
  const dryRun = args.includes('--dry-run');
  const execute = args.includes('--execute');

  if (!manuscriptArg) {
    console.log('❌ Usage: node retry-failed-imports.js --manuscript=SIN|LXX [--dry-run|--execute]');
    console.log('\nAvailable manuscripts:');
    console.log('  SIN - Codex Sinaiticus (4th century Greek Bible)');
    console.log('  LXX - Septuagint (Rahlfs 1935)');
    process.exit(1);
  }

  const manuscriptCode = manuscriptArg.split('=')[1];
  const config = MANUSCRIPTS[manuscriptCode];

  if (!config) {
    console.error(`❌ Unknown manuscript: ${manuscriptCode}`);
    process.exit(1);
  }

  console.log('🔄 Retry Failed Imports');
  console.log('='.repeat(70));
  console.log(`📚 Manuscript: ${config.name} (${manuscriptCode})`);
  console.log(`🔬 Mode: ${dryRun ? 'DRY RUN' : execute ? 'EXECUTE' : 'INFO ONLY'}\n`);

  // Get manuscript ID
  const manuscriptId = await getManuscriptId(manuscriptCode);
  console.log(`✅ Manuscript ID: ${manuscriptId}`);

  // Get already imported verses
  console.log('📊 Checking database for imported verses...');
  const importedVerses = await getImportedVerses(manuscriptId);
  console.log(`   ✅ Found ${importedVerses.size} already imported verses\n`);

  // Parse source data
  console.log('📖 Parsing source data for missing verses...');
  let newVerses;

  if (manuscriptCode === 'SIN') {
    const xmlPath = path.join(__dirname, config.xmlPath);
    newVerses = parseSinaiticusXML(xmlPath, importedVerses);
  } else if (manuscriptCode === 'LXX') {
    const csvPath = path.join(__dirname, config.csvPath);
    newVerses = parseLXXCSV(csvPath, importedVerses);
  }

  console.log(`\n📊 Found ${newVerses.length} new verses to import`);

  if (!execute && !dryRun) {
    console.log('\n💡 To see what would be imported, run with --dry-run');
    console.log('💡 To actually import, run with --execute');
    return;
  }

  // Import
  const { imported, failed } = await importVerses(manuscriptId, newVerses, dryRun);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 RETRY SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ New verses imported: ${imported}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`📚 Total in database: ${importedVerses.size + imported}`);
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
