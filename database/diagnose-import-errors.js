/**
 * Diagnose Import Errors - Analyze failed imports from Codex Sinaiticus
 *
 * This script helps identify:
 * 1. Duplicate verses (same book/chapter/verse within XML)
 * 2. Invalid verse numbers (verse = 0 or negative)
 * 3. Missing verses in database
 *
 * Usage:
 *   node database/diagnose-import-errors.js
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

// Book mapping (same as import script)
const BOOK_MAP = {
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
};

function getTextContent(element) {
  if (!element) return '';
  let text = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if (node.nodeType === 3) {
      text += node.nodeValue;
    } else if (node.nodeType === 1) {
      text += getTextContent(node);
    }
  }
  return text;
}

/**
 * Parse XML and collect all verse references
 */
function parseXMLForDiagnostics(xmlPath) {
  console.log('📖 Analyzing XML structure...\n');

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  const verses = [];
  const duplicates = new Map(); // Track duplicates
  const invalidVerses = [];

  const bookElements = doc.getElementsByTagName('div');

  for (let i = 0; i < bookElements.length; i++) {
    const bookElement = bookElements[i];
    if (bookElement.getAttribute('type') !== 'book') continue;

    const bookTitle = bookElement.getAttribute('title');
    if (!bookTitle) continue;

    const bookCode = BOOK_MAP[bookTitle];
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

        // Check for verse = 0 or negative
        if (verse <= 0) {
          invalidVerses.push({ book: bookCode, chapter, verse, key: verseKey });
        }

        // Check for duplicates
        if (duplicates.has(verseKey)) {
          duplicates.get(verseKey).count++;
        } else {
          duplicates.set(verseKey, { book: bookCode, chapter, verse, count: 1 });
        }

        verses.push({ book: bookCode, chapter, verse, key: verseKey });
      }
    }
  }

  // Filter to only duplicates (count > 1)
  const duplicateList = Array.from(duplicates.values()).filter(v => v.count > 1);

  return {
    totalVerses: verses.length,
    uniqueVerses: duplicates.size,
    duplicates: duplicateList,
    invalidVerses
  };
}

/**
 * Check which verses are missing in database
 */
async function checkMissingVerses(manuscriptCode) {
  console.log(`📊 Checking database for missing ${manuscriptCode} verses...\n`);

  // Get manuscript ID
  const { data: manuscript } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', manuscriptCode)
    .single();

  if (!manuscript) {
    console.error(`❌ Manuscript ${manuscriptCode} not found`);
    return [];
  }

  // Get all imported verses
  const { data: importedVerses, error } = await supabase
    .from('verses')
    .select('book, chapter, verse')
    .eq('manuscript_id', manuscript.id);

  if (error) {
    console.error('❌ Database query failed:', error.message);
    return [];
  }

  return importedVerses;
}

/**
 * Main diagnostic
 */
async function main() {
  console.log('🔍 Codex Sinaiticus Import Diagnostics');
  console.log('='.repeat(70));
  console.log('');

  const xmlPath = path.join(__dirname, '../../manuscripts/codex-sinaiticus/codex-sinaiticus/sinaiticus_full_v195.xml');

  // Parse XML
  const xmlAnalysis = parseXMLForDiagnostics(xmlPath);

  console.log('📋 XML Analysis Results:');
  console.log(`   Total verses parsed: ${xmlAnalysis.totalVerses}`);
  console.log(`   Unique verse keys: ${xmlAnalysis.uniqueVerses}`);
  console.log(`   Duplicate verses: ${xmlAnalysis.duplicates.length}`);
  console.log(`   Invalid verses (verse ≤ 0): ${xmlAnalysis.invalidVerses.length}`);
  console.log('');

  // Show duplicates
  if (xmlAnalysis.duplicates.length > 0) {
    console.log('🔁 Duplicate Verses Found:');
    xmlAnalysis.duplicates.forEach(dup => {
      console.log(`   ${dup.book} ${dup.chapter}:${dup.verse} - appears ${dup.count} times`);
    });
    console.log('');
  }

  // Show invalid verses
  if (xmlAnalysis.invalidVerses.length > 0) {
    console.log('❌ Invalid Verse Numbers (≤ 0):');
    xmlAnalysis.invalidVerses.forEach(inv => {
      console.log(`   ${inv.book} ${inv.chapter}:${inv.verse}`);
    });
    console.log('');
  }

  // Check database
  const importedVerses = await checkMissingVerses('SIN');

  console.log('💾 Database Status:');
  console.log(`   Verses in database: ${importedVerses.length}`);
  console.log(`   Missing from XML total: ${xmlAnalysis.totalVerses - importedVerses.length}`);
  console.log(`   Expected missing (duplicates + invalid): ${xmlAnalysis.duplicates.length + xmlAnalysis.invalidVerses.length}`);
  console.log('');

  // Calculate what's actually fixable
  const fixableDuplicates = xmlAnalysis.duplicates.filter(dup => dup.verse > 0);
  const unfixableInvalid = xmlAnalysis.invalidVerses.length;

  console.log('📊 Import Error Breakdown:');
  console.log(`   ✅ Fixable duplicates: ${fixableDuplicates.length} (can retry with deduplication)`);
  console.log(`   ❌ Unfixable (verse ≤ 0): ${unfixableInvalid} (violate CHECK constraint)`);
  console.log('');

  console.log('💡 Recommendations:');
  if (fixableDuplicates.length > 0) {
    console.log('   1. Use retry script with deduplication to import fixable duplicates');
  }
  if (unfixableInvalid > 0) {
    console.log('   2. Invalid verse numbers (≤ 0) cannot be imported due to database CHECK constraint');
    console.log('      These represent fragmentary or interpolated sections in the manuscript');
  }
  console.log('   3. Current import success rate: ' +
    Math.round((importedVerses.length / xmlAnalysis.uniqueVerses) * 100) + '%');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
