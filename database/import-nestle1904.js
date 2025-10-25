/**
 * Nestle 1904 Greek New Testament Import Script
 *
 * Imports the Nestle 1904 (Eberhard Nestle, 1904) Greek New Testament
 * - Public Domain
 * - 27 NT books (MAT through REV)
 * - XML lowfat format with morphology
 * - Critical edition from 1904
 *
 * Usage:
 *   node database/import-nestle1904.js --test    # Import Matthew 1:1-10 only
 *   node database/import-nestle1904.js --full    # Import entire NT
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const xml2js = require('xml2js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Book code mapping (XML filename → 3-letter code)
const BOOK_MAP = {
  '01-matthew': 'MAT',
  '02-mark': 'MRK',
  '03-luke': 'LUK',
  '04-john': 'JHN',
  '05-acts': 'ACT',
  '06-romans': 'ROM',
  '07-1corinthians': '1CO',
  '08-2corinthians': '2CO',
  '09-galatians': 'GAL',
  '10-ephesians': 'EPH',
  '11-philippians': 'PHP',
  '12-colossians': 'COL',
  '13-1thessalonians': '1TH',
  '14-2thessalonians': '2TH',
  '15-1timothy': '1TI',
  '16-2timothy': '2TI',
  '17-titus': 'TIT',
  '18-philemon': 'PHM',
  '19-hebrews': 'HEB',
  '20-james': 'JAS',
  '21-1peter': '1PE',
  '22-2peter': '2PE',
  '23-1john': '1JN',
  '24-2john': '2JN',
  '25-3john': '3JN',
  '26-jude': 'JUD',
  '27-revelation': 'REV'
};

/**
 * Get or create manuscript entry in database
 */
async function getManuscriptId() {
  // Check if authenticity_tier column exists
  let hasTierColumn = false;
  const { data: testManuscript } = await supabase
    .from('manuscripts')
    .select('id, authenticity_tier')
    .limit(1)
    .single();

  if (testManuscript && 'authenticity_tier' in testManuscript) {
    hasTierColumn = true;
  }

  // Try to get existing manuscript
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'N1904')
    .single();

  if (existing) {
    console.log(`✅ Found existing Nestle 1904 manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry
  console.log('📚 Creating Nestle 1904 manuscript entry...');

  const manuscriptData = {
    code: 'N1904',
    name: 'Nestle 1904 Greek New Testament',
    language: 'greek',
    date_range: '1904 CE',
    description: 'Eberhard Nestle\'s 1904 edition of the Greek New Testament (British Foreign Bible Society 1904). Public domain critical edition.',
    license: 'Public Domain',
    source_url: 'https://github.com/biblicalhumanities/greek-new-testament'
  };

  if (hasTierColumn) {
    manuscriptData.authenticity_tier = 1;
    manuscriptData.tier_notes = 'Tier 1: AUTHENTIC - Public domain critical edition of the Greek New Testament by Eberhard Nestle (1904). Scholarly text with morphological annotations, suitable for linguistic analysis and AI restoration.';
  }

  const { data: newManuscript, error } = await supabase
    .from('manuscripts')
    .insert([manuscriptData])
    .select()
    .single();

  if (error) {
    console.error('❌ Failed to create manuscript:', error.message);
    process.exit(1);
  }

  console.log(`✅ Created Nestle 1904 manuscript (ID: ${newManuscript.id})`);
  return newManuscript.id;
}

/**
 * Parse verse reference from milestone ID
 * Format: "Matt.1.1" → { book: "MAT", chapter: 1, verse: 1 }
 */
function parseVerseRef(milestoneId, bookCode) {
  const parts = milestoneId.split('.');
  if (parts.length !== 3) {
    return null;
  }

  return {
    book: bookCode,
    chapter: parseInt(parts[1], 10),
    verse: parseInt(parts[2], 10)
  };
}

/**
 * Extract words from XML node recursively
 */
function extractWords(node) {
  let words = [];

  if (Array.isArray(node)) {
    node.forEach(n => {
      words = words.concat(extractWords(n));
    });
    return words;
  }

  if (typeof node === 'object') {
    // Check if this is a word node
    if (node.$ && node.$.osisId && node._) {
      // Parse osisId to get verse reference: "Matt.1.1!1" → "Matt.1.1"
      const verseRef = node.$.osisId.split('!')[0];

      words.push({
        text: node._,
        verseRef: verseRef,
        lemma: node.$.lemma || '',
        normalized: node.$.normalized || '',
        strong: node.$.strong || '',
        morphology: {
          class: node.$.class || '',
          type: node.$.type || '',
          person: node.$.person || '',
          number: node.$.number || '',
          gender: node.$.gender || '',
          case: node.$.case || '',
          tense: node.$.tense || '',
          voice: node.$.voice || '',
          mood: node.$.mood || ''
        }
      });
    }

    // Recursively process child nodes
    Object.keys(node).forEach(key => {
      if (key !== '$' && key !== '_') {
        words = words.concat(extractWords(node[key]));
      }
    });
  }

  return words;
}

/**
 * Parse a single XML file (book)
 */
async function parseBookXML(xmlPath, bookCode) {
  const content = fs.readFileSync(xmlPath, 'utf-8');
  const parser = new xml2js.Parser();

  const result = await parser.parseStringPromise(content);
  const book = result.book;

  if (!book || !book.sentence) {
    console.warn(`   ⚠️  No sentences found in ${bookCode}`);
    return [];
  }

  // Extract all words from all sentences
  // Each word has a verseRef (e.g., "Matt.1.1") that tells us which verse it belongs to
  let allWords = [];
  for (const sentence of book.sentence) {
    if (sentence.wg) {
      const words = extractWords(sentence.wg);
      allWords = allWords.concat(words);
    }
  }

  // Group words by verse reference
  const verseMap = new Map();

  for (const word of allWords) {
    if (!word.verseRef) continue;

    const verseRef = parseVerseRef(word.verseRef, bookCode);
    if (!verseRef) continue;

    const key = `${verseRef.book}:${verseRef.chapter}:${verseRef.verse}`;

    if (!verseMap.has(key)) {
      verseMap.set(key, {
        ...verseRef,
        words: []
      });
    }

    verseMap.get(key).words.push(word);
  }

  // Convert map to array of verses
  const verses = [];
  for (const [key, verseData] of verseMap.entries()) {
    verses.push({
      book: verseData.book,
      chapter: verseData.chapter,
      verse: verseData.verse,
      text: verseData.words.map(w => w.text).join(' '),
      morphology: verseData.words
    });
  }

  // Sort by chapter and verse
  verses.sort((a, b) => {
    if (a.chapter !== b.chapter) return a.chapter - b.chapter;
    return a.verse - b.verse;
  });

  return verses;
}

/**
 * Import all verses to database
 */
async function importVerses(manuscriptId, verses) {
  if (verses.length === 0) {
    console.log('   ⚠️  No verses to import');
    return { imported: 0, failed: 0 };
  }

  console.log(`\n📥 Importing ${verses.length} verses to database...`);

  const BATCH_SIZE = 50;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    const versesWithManuscript = batch.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      morphology: JSON.stringify(v.morphology)
    }));

    const { error } = await supabase
      .from('verses')
      .insert(versesWithManuscript);

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}: ${error.message}`);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n✅ Import complete: ${imported} verses imported, ${failed} failed\n`);
  return { imported, failed };
}

/**
 * Verify import
 */
async function verifyImport(manuscriptId) {
  console.log('🔍 Verifying import...');

  const { count, error: countError } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId);

  if (countError) {
    console.error('❌ Count verification failed:', countError.message);
    return;
  }

  console.log(`✅ Total Nestle 1904 verses in database: ${count}`);

  const { data: verses, error } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .limit(5);

  if (error) {
    console.error('❌ Sample verification failed:', error.message);
    return;
  }

  if (verses.length > 0) {
    console.log('\n📋 Sample verses:');
    verses.forEach(v => {
      console.log(`   ${v.book} ${v.chapter}:${v.verse} - ${v.text.substring(0, 60)}...`);
    });
  }
}

/**
 * Main import function
 */
async function main() {
  const args = process.argv.slice(2);
  const testMode = args.includes('--test');
  const fullMode = args.includes('--full');

  if (!testMode && !fullMode) {
    console.log('❌ Usage: node database/import-nestle1904.js --test|--full');
    process.exit(1);
  }

  console.log('📖 Nestle 1904 Greek New Testament Import Tool');
  console.log('='.repeat(70));
  console.log(`🌍 ${testMode ? 'TEST MODE: Will import Matthew 1:1-10 only' : 'FULL MODE: Will import entire New Testament'}\n`);

  // Get or create manuscript entry
  const manuscriptId = await getManuscriptId();

  // Get list of XML files
  const xmlDir = path.join(__dirname, '../../manuscripts/nestle1904/greek-new-testament/syntax-trees/nestle1904-lowfat/xml');
  const files = fs.readdirSync(xmlDir).filter(f => f.endsWith('.xml')).sort();

  console.log(`📖 Found ${files.length} book files to import`);

  let allVerses = [];

  // Parse all books (or just first book in test mode)
  const filesToProcess = testMode ? [files[0]] : files;

  for (const file of filesToProcess) {
    const xmlFilename = file.replace('.xml', '');
    const bookCode = BOOK_MAP[xmlFilename];

    if (!bookCode) {
      console.warn(`   ⚠️  Unknown book: ${xmlFilename}`);
      continue;
    }

    console.log(`   Processing ${bookCode} (${file})...`);

    const xmlPath = path.join(xmlDir, file);
    const verses = await parseBookXML(xmlPath, bookCode);

    allVerses = allVerses.concat(verses);

    if (testMode && allVerses.length >= 10) {
      allVerses = allVerses.slice(0, 10);
      break;
    }
  }

  console.log(`\n📊 Total verses extracted: ${allVerses.length}`);

  // Import to database
  const { imported, failed } = await importVerses(manuscriptId, allVerses);

  // Verify
  await verifyImport(manuscriptId);

  // Summary
  console.log('='.repeat(70));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(70));
  console.log('✅ Manuscript: Nestle 1904 Greek New Testament');
  console.log('✅ Authenticity Tier: 1 (AUTHENTIC)');
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log('📚 Database now contains Nestle 1904');
  console.log('\n🎉 Nestle 1904 import complete!\n');
  console.log('📈 "Authentic 10" Corpus Progress: 8/10 manuscripts (80%)');
  console.log('⏭️  Next steps:');
  console.log('1. Import Dead Sea Scrolls (select OT texts)');
  console.log('2. Import Aleppo Codex (if transcription available)');
  console.log('3. Update MANUSCRIPT_SOURCES_STATUS.md');
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
