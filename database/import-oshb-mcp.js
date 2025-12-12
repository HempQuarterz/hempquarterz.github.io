/**
 * OSHB (Open Scriptures Hebrew Bible) Morphology Import Script - MCP Version
 *
 * Source: https://github.com/openscriptures/morphhb
 * Version: OSHB v2.2 (December 2014)
 * License: CC BY 4.0 (Creative Commons Attribution 4.0 International)
 * Attribution: "Source: Open Scriptures Hebrew Bible Project - CC BY 4.0"
 *
 * This version outputs SQL commands that can be executed via Supabase MCP tool
 * to avoid IPv6 connection issues with direct pg client.
 *
 * Usage:
 *   node database/import-oshb-mcp.js --test > oshb-genesis.sql
 *   node database/import-oshb-mcp.js --book EXO > oshb-exodus.sql
 *   node database/import-oshb-mcp.js --full > oshb-full.sql
 *
 * Then execute via MCP tool or psql
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');

// Book code mapping (OSIS codes to All4Yah codes)
const BOOK_MAP = {
  'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
  'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT',
  '1Sam': '1SA', '2Sam': '2SA', '1Kgs': '1KI', '2Kgs': '2KI',
  '1Chr': '1CH', '2Chr': '2CH', 'Ezra': 'EZR', 'Neh': 'NEH', 'Esth': 'EST',
  'Job': 'JOB', 'Ps': 'PSA', 'Prov': 'PRO', 'Eccl': 'ECC', 'Song': 'SNG',
  'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM', 'Ezek': 'EZK', 'Dan': 'DAN',
  'Hos': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obad': 'OBA', 'Jonah': 'JON',
  'Mic': 'MIC', 'Nah': 'NAH', 'Hab': 'HAB', 'Zeph': 'ZEP', 'Hag': 'HAG',
  'Zech': 'ZEC', 'Mal': 'MAL'
};

// Statistics
const stats = {
  booksProcessed: 0,
  versesProcessed: 0,
  wordsTagged: 0,
  errors: 0
};

/**
 * Parse OSHB XML file and extract morphology data
 */
async function parseOSHBFile(filePath) {
  const xmlContent = fs.readFileSync(filePath, 'utf8');
  const parser = new xml2js.Parser({
    explicitArray: false,
    mergeAttrs: true
  });

  const result = await parser.parseStringPromise(xmlContent);
  return result;
}

/**
 * Extract verse data from parsed XML
 */
function extractVerses(parsedXML, osisBookCode) {
  const verses = [];

  try {
    // Navigate to the book div
    const bookDiv = parsedXML.osis.osisText.div;

    if (!bookDiv || !bookDiv.chapter) {
      console.error(`-- No chapters found in ${osisBookCode}`);
      return verses;
    }

    // Get all chapters
    const chapters = Array.isArray(bookDiv.chapter) ? bookDiv.chapter : [bookDiv.chapter];

    chapters.forEach(chapter => {
      if (!chapter || !chapter.verse) return;

      const verseData = chapter.verse;
      const verseArray = Array.isArray(verseData) ? verseData : [verseData];

      verseArray.forEach(verse => {
        if (!verse || !verse.osisID) return;

        // Parse osisID: "Gen.1.1" -> book=Gen, chapter=1, verse=1
        const [book, chapterNum, verseNum] = verse.osisID.split('.');

        // Extract words
        const words = [];
        const wordData = verse.w;

        if (wordData) {
          const wordArray = Array.isArray(wordData) ? wordData : [wordData];

          wordArray.forEach((word, index) => {
            if (!word) return;

            // Extract word attributes
            const wordInfo = {
              index: index + 1,
              text: typeof word === 'string' ? word : (word._ || ''),
              lemma: word.lemma || null,
              morph: word.morph || null,
              id: word.id || null
            };

            words.push(wordInfo);
          });
        }

        if (words.length > 0) {
          verses.push({
            book: BOOK_MAP[book] || book,
            chapter: parseInt(chapterNum),
            verse: parseInt(verseNum),
            morphology: words
          });
        }
      });
    });
  } catch (error) {
    console.error(`-- Error extracting verses from ${osisBookCode}: ${error.message}`);
    stats.errors++;
  }

  return verses;
}

/**
 * Generate SQL UPDATE statement for verse morphology
 */
function generateUpdateSQL(verseData) {
  const { book, chapter, verse, morphology } = verseData;

  // Escape single quotes in JSON
  const morphologyJSON = JSON.stringify(morphology).replace(/'/g, "''");

  const sql = `
UPDATE verses
SET morphology = '${morphologyJSON}'::jsonb
WHERE manuscript_id = (SELECT id FROM manuscripts WHERE code = 'WLC')
  AND book = '${book}'
  AND chapter = ${chapter}
  AND verse = ${verse};
`;

  return sql;
}

/**
 * Process a single book
 */
async function processBook(osisBookCode) {
  console.error(`\n-- Processing ${osisBookCode}...`);

  const xmlPath = path.join(__dirname, '../manuscripts/oshb/OSHB-v.2.2', `${osisBookCode}.xml`);

  if (!fs.existsSync(xmlPath)) {
    console.error(`-- File not found: ${xmlPath}`);
    stats.errors++;
    return;
  }

  try {
    // Parse XML
    const parsedXML = await parseOSHBFile(xmlPath);

    // Extract verses
    const verses = extractVerses(parsedXML, osisBookCode);
    console.error(`-- Found ${verses.length} verses with morphology`);

    // Generate SQL for each verse
    console.log(`\n-- ${BOOK_MAP[osisBookCode] || osisBookCode} (${verses.length} verses)`);

    verses.forEach(verseData => {
      const sql = generateUpdateSQL(verseData);
      console.log(sql);
      stats.versesProcessed++;
      stats.wordsTagged += verseData.morphology.length;
    });

    stats.booksProcessed++;
  } catch (error) {
    console.error(`-- Failed to process ${osisBookCode}: ${error.message}`);
    stats.errors++;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--test';

  console.error('-- ═══════════════════════════════════════════════════════════════');
  console.error('-- OSHB (Open Scriptures Hebrew Bible) Morphology Import - MCP Version');
  console.error('-- ═══════════════════════════════════════════════════════════════');
  console.error('-- Source: OSHB v2.2 (December 2014)');
  console.error('-- License: CC BY 4.0');
  console.error('-- Attribution: Open Scriptures Hebrew Bible Project');
  console.error('-- ───────────────────────────────────────────────────────────────\n');

  // SQL header
  console.log('-- OSHB Morphology Import SQL');
  console.log('-- Generated: ' + new Date().toISOString());
  console.log('-- License: CC BY 4.0');
  console.log('-- Attribution: Open Scriptures Hebrew Bible Project');
  console.log('\nBEGIN;\n');

  // Determine which books to process
  let booksToProcess = [];

  if (mode === '--test') {
    console.error('-- TEST MODE: Processing Genesis only\n');
    booksToProcess = ['Gen'];
  } else if (mode === '--book' && args[1]) {
    const bookCode = args[1].toUpperCase();
    const osisCode = Object.keys(BOOK_MAP).find(k => BOOK_MAP[k] === bookCode);
    if (osisCode) {
      console.error(`-- SINGLE BOOK MODE: Processing ${bookCode}\n`);
      booksToProcess = [osisCode];
    } else {
      console.error(`-- Unknown book code: ${bookCode}`);
      process.exit(1);
    }
  } else if (mode === '--full') {
    console.error('-- FULL MODE: Processing all 39 OT books\n');
    booksToProcess = Object.keys(BOOK_MAP);
  } else {
    console.error('-- Usage: node import-oshb-mcp.js [--test | --book CODE | --full]');
    process.exit(1);
  }

  // Process books
  for (const osisCode of booksToProcess) {
    await processBook(osisCode);
  }

  // SQL footer
  console.log('\nCOMMIT;\n');

  // Print statistics to stderr
  console.error('\n-- ═══════════════════════════════════════════════════════════════');
  console.error('-- OSHB Processing Complete');
  console.error('-- ═══════════════════════════════════════════════════════════════');
  console.error(`-- Books processed:    ${stats.booksProcessed}`);
  console.error(`-- Verses processed:   ${stats.versesProcessed}`);
  console.error(`-- Words tagged:       ${stats.wordsTagged.toLocaleString()}`);
  console.error(`-- Errors:             ${stats.errors}`);
  console.error('-- ───────────────────────────────────────────────────────────────\n');
}

// Run
main().catch(error => {
  console.error('-- Fatal error:', error);
  process.exit(1);
});
