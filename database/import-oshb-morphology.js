/**
 * OSHB (Open Scriptures Hebrew Bible) Morphology Import Script
 *
 * Source: https://github.com/openscriptures/morphhb
 * Version: OSHB v2.2 (December 2014)
 * License: CC BY 4.0 (Creative Commons Attribution 4.0 International)
 * Attribution: "Source: Open Scriptures Hebrew Bible Project - CC BY 4.0"
 *
 * This script imports morphological data from the OSHB project and enriches
 * existing WLC verses in the All4Yah database with:
 * - Lemmas (Strong's concordance numbers)
 * - Morphology codes (Hebrew parsing: part of speech, person, number, gender, etc.)
 * - Word-by-word breakdown
 *
 * Data Structure:
 * - Input: XML files (OSIS format) for each OT book
 * - Each <w> element contains: lemma, morph, id, and Hebrew text
 * - Morphology stored as JSONB in the verses table
 *
 * Usage:
 *   node database/import-oshb-morphology.js [--test | --book BOOK_CODE | --full]
 *
 * Examples:
 *   node database/import-oshb-morphology.js --test        # Import Genesis only (test)
 *   node database/import-oshb-morphology.js --book EXO    # Import Exodus
 *   node database/import-oshb-morphology.js --full        # Import all 39 OT books
 */

const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const { Client } = require('pg');

// Database connection (force IPv4)
const { setDefaultResultOrder } = require('dns');
setDefaultResultOrder('ipv4first');

const client = new Client({
  host: 'db.txeeaekwhkdilycefczq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || '@4HQZgassmoe',
  ssl: { rejectUnauthorized: false }
});

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
  versesUpdated: 0,
  wordsTagged: 0,
  errors: 0,
  startTime: Date.now()
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
    const chapters = parsedXML.osis.osisText.div.div;
    const chapterArray = Array.isArray(chapters) ? chapters : [chapters];

    chapterArray.forEach(chapter => {
      const verseData = chapter.verse;
      const verseArray = Array.isArray(verseData) ? verseData : [verseData];

      verseArray.forEach(verse => {
        if (!verse || !verse.osisID) return;

        // Parse osisID: "Gen.1.1" -> book=Gen, chapter=1, verse=1
        const [book, chapter, verseNum] = verse.osisID.split('.');

        // Extract words
        const words = [];
        const wordData = verse.w;
        const wordArray = Array.isArray(wordData) ? wordData : [wordData];

        wordArray.forEach((word, index) => {
          if (!word) return;

          // Extract word attributes
          const wordInfo = {
            index: index + 1,
            text: word._ || word,  // Hebrew text
            lemma: word.lemma || null,  // Strong's number
            morph: word.morph || null,  // Morphology code
            id: word.id || null  // Word ID
          };

          words.push(wordInfo);
        });

        verses.push({
          book: BOOK_MAP[book] || book,
          chapter: parseInt(chapter),
          verse: parseInt(verseNum),
          morphology: words
        });
      });
    });
  } catch (error) {
    console.error(`Error extracting verses from ${osisBookCode}:`, error.message);
    stats.errors++;
  }

  return verses;
}

/**
 * Update WLC verse with OSHB morphology data
 */
async function updateVerseMorphology(verseData) {
  const { book, chapter, verse, morphology } = verseData;

  try {
    const query = `
      UPDATE verses
      SET morphology = $1::jsonb
      WHERE manuscript_id = (SELECT id FROM manuscripts WHERE code = 'WLC')
        AND book = $2
        AND chapter = $3
        AND verse = $4
      RETURNING id
    `;

    const result = await client.query(query, [
      JSON.stringify(morphology),
      book,
      chapter,
      verse
    ]);

    if (result.rowCount > 0) {
      stats.versesUpdated++;
      stats.wordsTagged += morphology.length;
      return true;
    } else {
      console.warn(`No WLC verse found for ${book} ${chapter}:${verse}`);
      return false;
    }
  } catch (error) {
    console.error(`Error updating ${book} ${chapter}:${verse}:`, error.message);
    stats.errors++;
    return false;
  }
}

/**
 * Import OSHB data for a single book
 */
async function importBook(osisBookCode) {
  console.log(`\nProcessing ${osisBookCode}...`);

  const xmlPath = path.join(__dirname, '../manuscripts/oshb/OSHB-v.2.2', `${osisBookCode}.xml`);

  if (!fs.existsSync(xmlPath)) {
    console.error(`File not found: ${xmlPath}`);
    stats.errors++;
    return;
  }

  try {
    // Parse XML
    const parsedXML = await parseOSHBFile(xmlPath);

    // Extract verses
    const verses = extractVerses(parsedXML, osisBookCode);
    console.log(`  Found ${verses.length} verses with morphology`);

    // Update database
    let updated = 0;
    for (const verseData of verses) {
      const success = await updateVerseMorphology(verseData);
      if (success) updated++;
    }

    console.log(`  ✅ Updated ${updated} verses with morphological data`);
    stats.booksProcessed++;
  } catch (error) {
    console.error(`Failed to import ${osisBookCode}:`, error.message);
    stats.errors++;
  }
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const mode = args[0] || '--test';

  console.log('═══════════════════════════════════════════════════════════════');
  console.log('OSHB (Open Scriptures Hebrew Bible) Morphology Import');
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Source: OSHB v2.2 (December 2014)');
  console.log('License: CC BY 4.0');
  console.log('Attribution: Open Scriptures Hebrew Bible Project');
  console.log('Data: Morphological tags for all Hebrew words in OT');
  console.log('───────────────────────────────────────────────────────────────\n');

  try {
    // Connect to database
    await client.connect();
    console.log('✅ Connected to All4Yah database\n');

    // Determine which books to import
    let booksToImport = [];

    if (mode === '--test') {
      console.log('TEST MODE: Importing Genesis only\n');
      booksToImport = ['Gen'];
    } else if (mode === '--book' && args[1]) {
      const bookCode = args[1].toUpperCase();
      const osisCode = Object.keys(BOOK_MAP).find(k => BOOK_MAP[k] === bookCode);
      if (osisCode) {
        console.log(`SINGLE BOOK MODE: Importing ${bookCode}\n`);
        booksToImport = [osisCode];
      } else {
        console.error(`Unknown book code: ${bookCode}`);
        process.exit(1);
      }
    } else if (mode === '--full') {
      console.log('FULL MODE: Importing all 39 OT books\n');
      booksToImport = Object.keys(BOOK_MAP);
    } else {
      console.error('Usage: node import-oshb-morphology.js [--test | --book CODE | --full]');
      process.exit(1);
    }

    // Import books
    for (const osisCode of booksToImport) {
      await importBook(osisCode);
    }

    // Print final statistics
    const duration = ((Date.now() - stats.startTime) / 1000).toFixed(2);
    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('OSHB Import Complete');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Books processed:    ${stats.booksProcessed}`);
    console.log(`Verses updated:     ${stats.versesUpdated}`);
    console.log(`Words tagged:       ${stats.wordsTagged.toLocaleString()}`);
    console.log(`Errors:             ${stats.errors}`);
    console.log(`Duration:           ${duration}s`);
    console.log('───────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('Fatal error:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Run import
main().catch(console.error);
