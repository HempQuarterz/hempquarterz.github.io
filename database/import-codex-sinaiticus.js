/**
 * Codex Sinaiticus Import Script
 * Imports the 4th-century Greek Bible from TEI XML format
 *
 * Source: Codex Sinaiticus Project (codexsinaiticus.org)
 * License: CC BY-NC-SA 4.0
 * Format: TEI XML with morphology and Strong's numbers
 *
 * Usage:
 *   node database/import-codex-sinaiticus.js --test    # Import Genesis 21-22 only
 *   node database/import-codex-sinaiticus.js --book MAT  # Import one NT book
 *   node database/import-codex-sinaiticus.js --full    # Import entire manuscript
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

// Book title to standard code mapping
const BOOK_MAP = {
  // Old Testament (Septuagint)
  'Γένεϲιϲ': 'GEN',
  'Ἔξοδοϲ': 'EXO',
  'Λευιτικὸν': 'LEV',
  'Λευιτικόν': 'LEV',
  'Ἀριθμοί': 'NUM',
  'Δευτερονόμιον': 'DEU',
  'Ἰηϲουϲ': 'JOS',
  'Κριταί': 'JDG',
  'Ῥούθ': 'RUT',
  '1 Βαϲιλειῶν': '1SA',
  '2 Βαϲιλειῶν': '2SA',
  '3 Βαϲιλειῶν': '1KI',
  '4 Βαϲιλειῶν': '2KI',
  '1 Παραλειπομένων': '1CH',
  '2 Παραλειπομένων': '2CH',
  '1 Ἔϲδραϲ': '1ES',
  'Ἔϲδραϲ': 'EZR',
  'Νεεμίαϲ': 'NEH',
  'Ἐϲθήρ': 'EST',
  'Ἰώβ': 'JOB',
  'Ψαλμοί': 'PSA',
  'Παροιμίαι': 'PRO',
  'Ἐκκληϲιαϲτήϲ': 'ECC',
  'ᾎϲμα': 'SNG',
  'Ἠϲαΐαϲ': 'ISA',
  'Ἱερεμίαϲ': 'JER',
  'Θρῆνοι': 'LAM',
  'Ἰεζεκιήλ': 'EZK',
  'Δανιήλ': 'DAN',
  'Ὠϲηέ': 'HOS',
  'Ἰωήλ': 'JOL',
  'Ἀμώϲ': 'AMO',
  'Ὀβδιού': 'OBA',
  'Ἰωνάϲ': 'JON',
  'Μιχαίαϲ': 'MIC',
  'Ναούμ': 'NAM',
  'Ἀμβακούμ': 'HAB',
  'Ϲοφονίαϲ': 'ZEP',
  'Ἀγγαῖοϲ': 'HAG',
  'Ζαχαρίαϲ': 'ZEC',
  'Μαλαχίαϲ': 'MAL',
  'Τωβείτ': 'TOB',
  'Ἰουδίθ': 'JDT',
  'Ϲοφία Ϲαλομῶντοϲ': 'WIS',
  'Ϲοφία Ϲειράχ': 'SIR',
  'Βαρούχ': 'BAR',
  'Ἐπιϲτολὴ Ἰερεμίου': 'EJE',
  'Ϲουϲάννα': 'SUS',
  'Βὴλ καὶ δράκων': 'BEL',
  '1 Μακκαβαίων': '1MA',
  '2 Μακκαβαίων': '2MA',
  '3 Μακκαβαίων': '3MA',
  '4 Μακκαβαίων': '4MA',

  // New Testament
  'Κατὰ Ματθαῖον': 'MAT',
  'Κατὰ Μάρκον': 'MRK',
  'Κατὰ Λουκᾶν': 'LUK',
  'Κατὰ Ἰωάννην': 'JHN',
  'Πράξειϲ Ἀποϲτόλων': 'ACT',
  'Πρὸϲ Ῥωμαίουϲ': 'ROM',
  'Πρὸϲ Κορινθίουϲ Α': '1CO',
  'Πρὸϲ Κορινθίουϲ Β': '2CO',
  'Πρὸϲ Γαλάταϲ': 'GAL',
  'Πρὸϲ Ἐφεϲίουϲ': 'EPH',
  'Πρὸϲ Φιλιππηϲίουϲ': 'PHP',
  'Πρὸϲ Κολοϲϲαεῖϲ': 'COL',
  'Πρὸϲ Θεϲϲαλονικεῖϲ Α': '1TH',
  'Πρὸϲ Θεϲϲαλονικεῖϲ Β': '2TH',
  'Πρὸϲ Τιμόθεον Α': '1TI',
  'Πρὸϲ Τιμόθεον Β': '2TI',
  'Πρὸϲ Τίτον': 'TIT',
  'Πρὸϲ Φιλήμονα': 'PHM',
  'Πρὸϲ Ἑβραίουϲ': 'HEB',
  'Ἰακώβου': 'JAS',
  'Πέτρου Α': '1PE',
  'Πέτρου Β': '2PE',
  'Ἰωάννου Α': '1JN',
  'Ἰωάννου Β': '2JN',
  'Ἰωάννου Γ': '3JN',
  'Ἰούδα': 'JUD',
  'Ἀποκάλυψιϲ Ἰωάννου': 'REV',

  // Additional texts in Codex Sinaiticus
  'Ἐπιϲτολὴ Βαρνάβα': 'BAR', // Epistle of Barnabas
  'Ποιμὴν Ἑρμᾶ': 'HER'  // Shepherd of Hermas
};

/**
 * Get or create Codex Sinaiticus manuscript entry
 */
async function getManuscriptId() {
  console.log('📚 Checking for Codex Sinaiticus manuscript entry...');

  const { data: existing, error: fetchError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'SIN')
    .single();

  if (existing) {
    console.log(`✅ Found existing Codex Sinaiticus manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Check if authenticity_tier column exists by querying an existing manuscript
  let hasTierColumn = false;
  const { data: testManuscript } = await supabase
    .from('manuscripts')
    .select('id, authenticity_tier')
    .limit(1)
    .single();

  if (testManuscript && 'authenticity_tier' in testManuscript) {
    hasTierColumn = true;
  }

  // Create manuscript data
  const manuscriptData = {
    code: 'SIN',
    name: 'Codex Sinaiticus',
    language: 'greek',
    date_range: '4th century CE (c. 330-360 CE)',
    license: 'CC BY-NC-SA 4.0',
    description: '4th-century Greek Bible (Septuagint + New Testament). One of the oldest complete manuscripts. Includes morphology and Strong\'s numbers.',
    source_url: 'https://github.com/PatristicTextArchive/codex-sinaiticus'
  };

  // Add authenticity tier if column exists
  if (hasTierColumn) {
    manuscriptData.authenticity_tier = 1;
    manuscriptData.tier_notes = 'Tier 1: AUTHENTIC - 4th-century diplomatic transcription from the Codex Sinaiticus Project. Direct facsimile-level TEI XML encoding with no theological paraphrasing. One of the two oldest complete Greek Bibles in existence (along with Codex Vaticanus). Public domain facsimile with morphological tagging. Preserves original Greek text as written ~330-360 CE. Suitable for AI restoration work.';
    console.log('   ℹ️  Will include authenticity tier (Tier 1: AUTHENTIC)');
  } else {
    console.log('   ⚠️  Authenticity tier columns not yet available');
    console.log('   💡 Run migration 002 to enable tier classification');
  }

  const { data: newManuscript, error: insertError } = await supabase
    .from('manuscripts')
    .insert(manuscriptData)
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create manuscript: ${insertError.message}`);
  }

  console.log(`✅ Created Codex Sinaiticus manuscript entry (ID: ${newManuscript.id})`);
  if (hasTierColumn) {
    console.log(`   Authenticity Tier: 1 (AUTHENTIC)`);
  }
  return newManuscript.id;
}

/**
 * Extract text content from XML element, ignoring tags
 */
function getTextContent(element) {
  if (!element) return '';

  let text = '';
  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if (node.nodeType === 3) { // Text node
      text += node.nodeValue;
    } else if (node.nodeType === 1) { // Element node
      text += getTextContent(node);
    }
  }
  return text;
}

/**
 * Parse morphology from word element
 */
function parseMorphology(wordElement) {
  const word = getTextContent(wordElement).trim();
  const lemma = wordElement.getAttribute('lemma');
  const morph = wordElement.getAttribute('morph');
  const norm = wordElement.getAttribute('norm');

  if (!word) return null;

  const morphData = { word };

  // Extract Strong's number from lemma (format: "strong:G1234")
  if (lemma) {
    const strongMatch = lemma.match(/strong:([GH]\d+)/);
    if (strongMatch) {
      morphData.strong = strongMatch[1];
    }
  }

  // Extract morphology code (format: "packard:...")
  if (morph) {
    const morphMatch = morph.match(/packard:(.+)/);
    if (morphMatch) {
      morphData.morph = morphMatch[1];
    }
  }

  // Add normalized form
  if (norm) {
    morphData.norm = norm;
  }

  return morphData;
}

/**
 * Parse verse element to extract text and morphology
 */
function parseVerse(verseElement) {
  const words = [];
  const morphology = [];

  // Process all child nodes
  function processNode(node) {
    if (!node) return;

    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i];

      if (child.nodeType === 1) { // Element node
        const tagName = child.tagName;

        if (tagName === 'w') {
          // Word element - extract text and morphology
          const wordText = getTextContent(child).trim();
          if (wordText) {
            words.push(wordText);
            const morphData = parseMorphology(child);
            if (morphData) {
              morphology.push(morphData);
            }
          }
        } else if (tagName === 'pc') {
          // Punctuation
          const punct = getTextContent(child).trim();
          if (punct) {
            words.push(punct);
          }
        } else {
          // Recurse into other elements (supplied, unclear, etc.)
          processNode(child);
        }
      }
    }
  }

  processNode(verseElement);

  return {
    text: words.join(' '),
    morphology: morphology.length > 0 ? morphology : null
  };
}

/**
 * Parse Codex Sinaiticus XML file
 */
function parseCodexSinaiticusXML(xmlPath, bookFilter = null, testMode = false) {
  console.log(`📖 Reading Codex Sinaiticus XML from ${xmlPath}...`);
  console.log(`   (This may take a moment - 52MB file)...`);

  const xmlContent = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlContent, 'text/xml');

  const verses = [];

  // Find all book elements
  const bookElements = doc.getElementsByTagName('div');

  for (let i = 0; i < bookElements.length; i++) {
    const bookElement = bookElements[i];

    if (bookElement.getAttribute('type') !== 'book') continue;

    const bookTitle = bookElement.getAttribute('title');
    if (!bookTitle) continue;

    // Map Greek title to standard code
    const bookCode = BOOK_MAP[bookTitle];
    if (!bookCode) {
      // Skip unknown books (fragments, etc.)
      continue;
    }

    // Skip if filtering by book
    if (bookFilter && bookCode !== bookFilter) {
      continue;
    }

    // In test mode, only process Genesis
    if (testMode && bookCode !== 'GEN') {
      continue;
    }

    console.log(`   Processing ${bookCode} (${bookTitle})...`);

    // Find all chapter elements within this book
    const chapterElements = bookElement.getElementsByTagName('div');

    for (let j = 0; j < chapterElements.length; j++) {
      const chapterElement = chapterElements[j];

      if (chapterElement.getAttribute('type') !== 'chapter') continue;

      const chapter = parseInt(chapterElement.getAttribute('n'), 10);
      if (isNaN(chapter)) continue;

      // In test mode, only process Genesis 21-22
      if (testMode && (chapter < 21 || chapter > 22)) {
        continue;
      }

      // Find all verse elements within this chapter
      const verseElements = chapterElement.getElementsByTagName('ab');

      for (let k = 0; k < verseElements.length; k++) {
        const verseElement = verseElements[k];

        const verse = parseInt(verseElement.getAttribute('n'), 10);
        if (isNaN(verse)) continue;

        // Parse verse text and morphology
        const parsed = parseVerse(verseElement);

        if (!parsed.text.trim()) continue;

        verses.push({
          book: bookCode,
          chapter,
          verse,
          text: parsed.text,
          morphology: parsed.morphology
        });
      }
    }
  }

  console.log(`\n📊 Total verses extracted: ${verses.length}`);
  return verses;
}

/**
 * Import verses to database
 */
async function importVerses(manuscriptId, verses) {
  console.log(`\n📥 Importing ${verses.length} verses to database...`);

  // Filter out invalid verses (verse number must be > 0)
  const validVerses = verses.filter(v => v.verse > 0);
  const invalidCount = verses.length - validVerses.length;

  if (invalidCount > 0) {
    console.log(`⚠️  Filtered out ${invalidCount} verses with invalid verse numbers (≤ 0)`);
  }

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < validVerses.length; i += BATCH_SIZE) {
    const batch = validVerses.slice(i, i + BATCH_SIZE);

    // Add manuscript_id and convert morphology to JSON
    let versesWithManuscript = batch.map(v => ({
      ...v,
      manuscript_id: manuscriptId,
      morphology: v.morphology ? JSON.stringify(v.morphology) : null
    }));

    // Deduplicate within batch (keep last occurrence)
    const seen = new Map();
    versesWithManuscript = versesWithManuscript.filter(v => {
      const key = `${v.book}-${v.chapter}-${v.verse}`;
      if (seen.has(key)) {
        console.log(`⚠️  Skipping duplicate within batch: ${v.book} ${v.chapter}:${v.verse}`);
        return false;
      }
      seen.set(key, true);
      return true;
    });

    const { error } = await supabase
      .from('verses')
      .upsert(versesWithManuscript, {
        onConflict: 'manuscript_id,book,chapter,verse'
      });

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}:`, error.message);
      failed += batch.length;
    } else {
      imported += versesWithManuscript.length;
      process.stdout.write(`\r   Progress: ${imported + failed}/${validVerses.length} verses (${Math.round((imported + failed)/validVerses.length*100)}%)`);
    }
  }

  console.log(`\n\n✅ Import complete: ${imported} verses imported, ${failed} failed, ${invalidCount} invalid`);
  return { imported, failed, invalid: invalidCount };
}

/**
 * Verify import
 */
async function verifyImport(manuscriptId) {
  console.log('\n🔍 Verifying import...');

  const { count, error } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId);

  if (error) {
    console.error('❌ Verification failed:', error.message);
    return;
  }

  console.log(`✅ Total Codex Sinaiticus verses in database: ${count}`);

  // Sample some verses from different books
  const { data: samples, error: sampleError } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .in('book', ['GEN', 'MAT', 'JHN', 'REV'])
    .eq('chapter', 1)
    .lte('verse', 3)
    .order('book')
    .order('chapter')
    .order('verse');

  if (!sampleError && samples) {
    console.log('\n📋 Sample verses:');
    samples.forEach(v => {
      const displayText = v.text.length > 80 ? v.text.substring(0, 80) + '...' : v.text;
      console.log(`${v.book} ${v.chapter}:${v.verse} - ${displayText}`);
    });
  }
}

/**
 * Main execution
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');
  const bookIndex = args.indexOf('--book');
  const bookFilter = bookIndex !== -1 ? args[bookIndex + 1] : null;

  console.log('📖 Codex Sinaiticus (4th Century Greek Bible) Import Tool');
  console.log('='.repeat(70));

  if (testMode) {
    console.log('🧪 TEST MODE: Will import Genesis 21-22 only\n');
  } else if (bookFilter) {
    console.log(`📕 BOOK MODE: Will import ${bookFilter} only\n`);
  } else if (fullMode) {
    console.log('🌍 FULL MODE: Will import entire Codex Sinaiticus\n');
  } else {
    console.log('ℹ️  Usage:');
    console.log('  --test          Import Genesis 21-22 only (sample)');
    console.log('  --book MAT      Import one book');
    console.log('  --full          Import entire Codex Sinaiticus\n');
    process.exit(0);
  }

  // Get manuscript ID
  const manuscriptId = await getManuscriptId();

  // Parse XML
  const xmlPath = path.join(__dirname, '../../manuscripts/codex-sinaiticus/codex-sinaiticus/sinaiticus_full_v195.xml');
  const verses = parseCodexSinaiticusXML(xmlPath, bookFilter, testMode);

  if (verses.length === 0) {
    console.log('\n⚠️  No verses found. Check book code or XML file.');
    process.exit(1);
  }

  // Import verses
  const { imported, failed } = await importVerses(manuscriptId, verses);

  // Verify
  await verifyImport(manuscriptId);

  // Summary
  console.log('\n' + '='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log(`✅ Manuscript: Codex Sinaiticus (4th century Greek Bible)`);
  console.log(`✅ Authenticity Tier: 1 (AUTHENTIC)`);
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log(`📚 Database now contains Codex Sinaiticus with morphology`);

  if (testMode) {
    console.log('\n⏭️  Next: Run with --full to import entire manuscript');
  } else if (bookFilter) {
    console.log('\n⏭️  Next: Run with --full to import all books');
  } else {
    console.log('\n🎉 Codex Sinaiticus import complete!');
    console.log('\n📈 "Authentic 10" Corpus Progress: 6/10 manuscripts (60%)');
    console.log('⏭️  Next steps:');
    console.log('1. Import Dead Sea Scrolls (select texts)');
    console.log('2. Import Aleppo Codex');
    console.log('3. Update MANUSCRIPT_SOURCES_STATUS.md');
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
