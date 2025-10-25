/**
 * Textus Receptus Greek New Testament Import Script
 * Imports the TR from .UTR format with Strong's numbers and morphology
 *
 * Source: byztxt/greektext-textus-receptus
 * License: Public Domain
 * Format: .UTR files with chapter:verse word strong# {morphology}
 *
 * Usage:
 *   node database/import-textus-receptus.js --test    # Import Matthew 1 only
 *   node database/import-textus-receptus.js --book MAT  # Import one book
 *   node database/import-textus-receptus.js --full    # Import entire TR NT
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// TR file abbreviations to standard book codes
const BOOK_MAP = {
  'MT': 'MAT',      // Matthew
  'MR': 'MRK',      // Mark
  'LU': 'LUK',      // Luke
  'JOH': 'JHN',     // John
  'AC': 'ACT',      // Acts
  'RO': 'ROM',      // Romans
  '1CO': '1CO',     // 1 Corinthians
  '2CO': '2CO',     // 2 Corinthians
  'GA': 'GAL',      // Galatians
  'EPH': 'EPH',     // Ephesians
  'PHP': 'PHP',     // Philippians
  'COL': 'COL',     // Colossians
  '1TH': '1TH',     // 1 Thessalonians
  '2TH': '2TH',     // 2 Thessalonians
  '1TI': '1TI',     // 1 Timothy
  '2TI': '2TI',     // 2 Timothy
  'TIT': 'TIT',     // Titus
  'PHM': 'PHM',     // Philemon
  'HEB': 'HEB',     // Hebrews
  'JAS': 'JAS',     // James
  '1PE': '1PE',     // 1 Peter
  '2PE': '2PE',     // 2 Peter
  '1JO': '1JN',     // 1 John
  '2JO': '2JN',     // 2 John
  '3JO': '3JN',     // 3 John
  'JUDE': 'JUD',    // Jude
  'RE': 'REV'       // Revelation
};

/**
 * Get or create Textus Receptus manuscript entry
 */
async function getManuscriptId() {
  console.log('📚 Checking for Textus Receptus manuscript entry...');

  const { data: existing, error: fetchError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'TR')
    .single();

  if (existing) {
    console.log(`✅ Found existing TR manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry
  const { data: newManuscript, error: insertError } = await supabase
    .from('manuscripts')
    .insert({
      code: 'TR',
      name: 'Textus Receptus',
      language: 'greek',
      date_range: '16th century (based on Byzantine manuscripts)',
      license: 'Public Domain',
      description: 'Traditional Greek text underlying the KJV, with morphological parsing and Strong\'s numbers'
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create manuscript: ${insertError.message}`);
  }

  console.log(`✅ Created TR manuscript entry (ID: ${newManuscript.id})`);
  return newManuscript.id;
}

/**
 * Parse Textus Receptus .UTR file
 * Format: chapter:verse word strong# {morphology} word strong# {morphology}
 * Note: Verses can span multiple lines (continuation lines start with space)
 */
function parseTextusReceptusFile(filePath, fileAbbr) {
  console.log(`📖 Parsing ${fileAbbr}.UTR...`);

  const bookCode = BOOK_MAP[fileAbbr];
  if (!bookCode) {
    console.log(`⚠️  Unknown book abbreviation: ${fileAbbr}`);
    return [];
  }

  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');

  const verses = [];
  let currentVerse = null;
  let currentContent = '';

  for (let line of lines) {
    line = line.trimEnd(); // Remove trailing whitespace including \r
    if (!line.trim()) continue;

    // Check if this is a new verse (starts with chapter:verse)
    const verseMatch = line.match(/^(\d+):(\d+)\s+(.+)/);

    if (verseMatch) {
      // Save previous verse if exists
      if (currentVerse) {
        const parsed = parseVerseContent(currentContent, bookCode, currentVerse.chapter, currentVerse.verse);
        if (parsed) verses.push(parsed);
      }

      // Start new verse
      currentVerse = {
        chapter: parseInt(verseMatch[1], 10),
        verse: parseInt(verseMatch[2], 10)
      };
      currentContent = verseMatch[3];
    } else if (line.startsWith(' ') && currentVerse) {
      // Continuation line - append to current verse
      currentContent += ' ' + line.trim();
    }
  }

  // Don't forget the last verse
  if (currentVerse) {
    const parsed = parseVerseContent(currentContent, bookCode, currentVerse.chapter, currentVerse.verse);
    if (parsed) verses.push(parsed);
  }

  console.log(`   ✅ Extracted ${verses.length} verses from ${fileAbbr}`);
  return verses;
}

/**
 * Parse the content of a single verse
 * Format: word strong# [strong#...] {morphology} word strong# {morphology}
 */
function parseVerseContent(content, bookCode, chapter, verse) {
  const tokens = content.trim().split(/\s+/);
  let i = 0;
  const words = [];
  const morphology = [];

  while (i < tokens.length) {
    const word = tokens[i];

    // Check if next token is a Strong's number (digits only)
    if (i + 1 < tokens.length && /^\d+$/.test(tokens[i + 1])) {
      let strongNum = tokens[i + 1];
      i += 2; // Move past word and first strong number

      // Some words have multiple Strong's numbers (e.g., "1080 5656")
      // Skip additional numbers until we hit morphology tag or next word
      while (i < tokens.length && /^\d+$/.test(tokens[i]) && !tokens[i].startsWith('{')) {
        i++;
      }

      // Check if there's a morphology tag
      let morphTag = '';
      if (i < tokens.length && tokens[i].startsWith('{')) {
        morphTag = tokens[i].replace(/[{}]/g, '');
        i++;
      }

      words.push(word);
      morphology.push({
        word,
        strong: 'G' + strongNum,
        morph: morphTag
      });
    } else {
      // Word without Strong's number (shouldn't happen often)
      words.push(word);
      i++;
    }
  }

  return {
    book: bookCode,
    chapter,
    verse,
    text: words.join(' '),
    morphology: morphology.length > 0 ? morphology : null
  };
}

/**
 * Import all TR books
 */
async function importTextusReceptus(manuscriptId, bookFilter = null, testMode = false) {
  const parsedDir = path.join(__dirname, '../../manuscripts/textus-receptus/greektext-textus-receptus/parsed');
  
  if (!fs.existsSync(parsedDir)) {
    throw new Error(`TR parsed directory not found: ${parsedDir}`);
  }
  
  console.log(`📂 Reading TR files from ${parsedDir}...`);
  
  const allVerses = [];
  const files = fs.readdirSync(parsedDir).filter(f => f.endsWith('.UTR'));
  
  console.log(`Found ${files.length} TR book files`);
  
  for (const file of files) {
    const fileAbbr = file.replace('.UTR', '');

    // In test mode, only process Matthew
    if (testMode && fileAbbr !== 'MT') {
      continue;
    }

    // Skip if filtering by book
    if (bookFilter && BOOK_MAP[fileAbbr] !== bookFilter) {
      continue;
    }

    const filePath = path.join(parsedDir, file);
    const verses = parseTextusReceptusFile(filePath, fileAbbr);

    if (testMode && fileAbbr === 'MT') {
      // In test mode, only process Matthew chapter 1
      const testVerses = verses.filter(v => v.chapter === 1);
      console.log(`🧪 TEST MODE: Limiting to Matthew 1 (${testVerses.length} verses)`);
      return testVerses;
    }

    allVerses.push(...verses);
  }
  
  console.log(`\n📊 Total verses parsed: ${allVerses.length}`);
  return allVerses;
}

/**
 * Import verses to database
 */
async function importVerses(manuscriptId, verses) {
  console.log(`\n📥 Importing ${verses.length} verses to database...`);

  const BATCH_SIZE = 100;
  let imported = 0;
  let failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE);

    // Add manuscript_id and convert morphology to JSON
    const versesWithManuscript = batch.map(v => ({
      ...v,
      manuscript_id: manuscriptId,
      morphology: v.morphology ? JSON.stringify(v.morphology) : null
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(versesWithManuscript, {
        onConflict: 'manuscript_id,book,chapter,verse'
      });

    if (error) {
      console.error(`\n❌ Failed to import batch ${i}-${i + batch.length}:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n\n✅ Import complete: ${imported} verses imported, ${failed} failed`);
  return { imported, failed };
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

  console.log(`✅ Total TR verses in database: ${count}`);

  // Sample some verses
  const { data: samples, error: sampleError } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .in('book', ['MAT', 'JHN', 'ROM'])
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

  console.log('📖 Textus Receptus Greek New Testament Import Tool');
  console.log('='.repeat(70));

  if (testMode) {
    console.log('🧪 TEST MODE: Will import Matthew 1 only\n');
  } else if (bookFilter) {
    console.log(`📕 BOOK MODE: Will import ${bookFilter} only\n`);
  } else if (fullMode) {
    console.log('🌍 FULL MODE: Will import entire TR NT (~7,900 verses)\n');
  } else {
    console.log('ℹ️  Usage:');
    console.log('  --test          Import Matthew 1 only');
    console.log('  --book MAT      Import one book');
    console.log('  --full          Import entire TR NT\n');
    process.exit(0);
  }

  // Get manuscript ID
  const manuscriptId = await getManuscriptId();

  // Parse TR files
  const verses = await importTextusReceptus(manuscriptId, bookFilter, testMode);

  if (verses.length === 0) {
    console.log('\n⚠️  No verses found. Check book code or TR files.');
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
  console.log(`✅ Manuscript: Textus Receptus (Greek NT)`);
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log(`📚 Database now contains TR Greek text with morphology`);

  if (testMode) {
    console.log('\n⏭️  Next: Run with --full to import entire TR NT');
  } else if (bookFilter) {
    console.log('\n⏭️  Next: Run with --full to import all books');
  } else {
    console.log('\n🎉 TR import complete!');
    console.log('⏭️  Next steps:');
    console.log('1. Import LXX Septuagint (Greek OT)');
    console.log('2. Import Dead Sea Scrolls (select texts)');
    console.log('3. Update MANUSCRIPT_SOURCES_STATUS.md');
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
