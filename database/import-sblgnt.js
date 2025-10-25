#!/usr/bin/env node

/**
 * SBL Greek New Testament (SBLGNT) Import Script
 *
 * Imports the complete Greek New Testament with morphological data
 * from the MorphGNT format (SBL Greek New Testament with morphology).
 *
 * Format: 010101 N- ----NSF- Βίβλος Βίβλος βίβλος βίβλος
 *         [BCCCVV] [POS] [Parsing] [Word] [Normalized] [Lemma] [Lexeme]
 *
 * Usage:
 *   node database/import-sblgnt.js              # Import all books
 *   node database/import-sblgnt.js --test       # Import Matthew 1 only
 *   node database/import-sblgnt.js --book=61    # Import specific book by number
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { readdir } = require('fs').promises;

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Book number to code mapping (61-87)
const BOOK_CODES = {
  '61': 'MAT', '62': 'MRK', '63': 'LUK', '64': 'JHN', '65': 'ACT',
  '66': 'ROM', '67': '1CO', '68': '2CO', '69': 'GAL', '70': 'EPH',
  '71': 'PHP', '72': 'COL', '73': '1TH', '74': '2TH',
  '75': '1TI', '76': '2TI', '77': 'TIT', '78': 'PHM',
  '79': 'HEB', '80': 'JAS', '81': '1PE', '82': '2PE',
  '83': '1JN', '84': '2JN', '85': '3JN', '86': 'JUD', '87': 'REV'
};

const BOOK_NAMES = {
  '61': 'Matthew', '62': 'Mark', '63': 'Luke', '64': 'John', '65': 'Acts',
  '66': 'Romans', '67': '1 Corinthians', '68': '2 Corinthians', '69': 'Galatians',
  '70': 'Ephesians', '71': 'Philippians', '72': 'Colossians',
  '73': '1 Thessalonians', '74': '2 Thessalonians',
  '75': '1 Timothy', '76': '2 Timothy', '77': 'Titus', '78': 'Philemon',
  '79': 'Hebrews', '80': 'James', '81': '1 Peter', '82': '2 Peter',
  '83': '1 John', '84': '2 John', '85': '3 John', '86': 'Jude', '87': 'Revelation'
};

async function getSBLGNTManuscriptId() {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'SBLGNT')
    .single();

  if (error) {
    console.error('❌ Error finding SBLGNT manuscript:', error.message);
    throw error;
  }

  return data.id;
}

async function parseMorphGNTFile(filePath, bookNum) {
  console.log(`📖 Reading ${BOOK_NAMES[bookNum]}: ${path.basename(filePath)}`);

  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  const verses = {};
  const expectedBookCode = BOOK_CODES[bookNum];

  for (const line of lines) {
    // Parse format: 010101 N- ----NSF- Βίβλος Βίβλος βίβλος βίβλος
    const parts = line.split(/\s+/);
    if (parts.length < 7) continue;

    const [ref, pos, parsing, word, normalized, lemma, lexeme] = parts;

    // Parse reference: BCCCVV (Book, Chapter, Verse)
    // Note: Book numbers in data are 01-27, but we use our filename-based mapping
    const chapter = parseInt(ref.substring(2, 4), 10);
    const verse = parseInt(ref.substring(4, 6), 10);

    const verseKey = `${expectedBookCode}.${chapter}.${verse}`;

    if (!verses[verseKey]) {
      verses[verseKey] = {
        book: expectedBookCode,
        chapter,
        verse,
        words: [],
        text: ''
      };
    }

    verses[verseKey].words.push({
      word,
      normalized,
      lemma,
      lexeme,
      pos,
      parsing
    });
  }

  // Assemble verse text from Greek words
  Object.values(verses).forEach(verse => {
    verse.text = verse.words.map(w => w.word).join(' ');
    verse.morphology = verse.words;
  });

  return Object.values(verses);
}

async function getMorphGNTFiles() {
  const morphgntDir = path.join(__dirname, '../manuscripts/greek_nt/morphgnt');
  const files = await readdir(morphgntDir);

  return files
    .filter(f => f.endsWith('-morphgnt.txt'))
    .map(f => {
      const bookNum = f.substring(0, 2);
      return {
        path: path.join(morphgntDir, f),
        bookNum,
        bookCode: BOOK_CODES[bookNum],
        bookName: BOOK_NAMES[bookNum]
      };
    })
    .sort((a, b) => a.bookNum - b.bookNum);
}

async function importVerses(manuscriptId, verses) {
  if (verses.length === 0) return;

  console.log(`\n📥 Importing ${verses.length} verses...`);

  const batchSize = 100;
  let imported = 0;

  for (let i = 0; i < verses.length; i += batchSize) {
    const batch = verses.slice(i, i + batchSize);

    const records = batch.map(v => ({
      manuscript_id: manuscriptId,
      book: v.book,
      chapter: v.chapter,
      verse: v.verse,
      text: v.text,
      morphology: v.morphology
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(records, {
        onConflict: 'manuscript_id,book,chapter,verse',
        ignoreDuplicates: false
      });

    if (error) {
      console.error(`❌ Error importing batch ${i / batchSize + 1}:`, error.message);
      throw error;
    }

    imported += batch.length;
    process.stdout.write(`\r   Progress: ${imported}/${verses.length} verses`);
  }

  console.log('\n✅ Import complete!\n');
}

async function main() {
  const args = process.argv.slice(2);
  const isTest = args.includes('--test');
  const bookArg = args.find(a => a.startsWith('--book='));
  const specificBook = bookArg ? bookArg.split('=')[1] : null;

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║     SBL Greek New Testament (SBLGNT) Import Script            ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get SBLGNT manuscript ID
    console.log('🔍 Finding SBLGNT manuscript in database...');
    const manuscriptId = await getSBLGNTManuscriptId();
    console.log(`✅ Found SBLGNT manuscript: ${manuscriptId}\n`);

    // Get all MorphGNT files
    let files = await getMorphGNTFiles();
    console.log(`📚 Found ${files.length} book files`);

    // Filter based on mode
    if (isTest) {
      console.log('🧪 TEST MODE: Importing Matthew chapter 1 only');
      files = files.filter(f => f.bookNum === '61');
    } else if (specificBook) {
      console.log(`📖 Importing book: ${BOOK_NAMES[specificBook]}`);
      files = files.filter(f => f.bookNum === specificBook);
    } else {
      console.log('📚 FULL IMPORT: All New Testament books');
    }

    let allVerses = [];

    // Parse each book
    for (const file of files) {
      const verses = await parseMorphGNTFile(file.path, file.bookNum);
      console.log(`   ✓ Parsed ${verses.length} verses from ${file.bookName}`);

      if (isTest) {
        // Only Matthew 1 for test
        allVerses = allVerses.concat(verses.filter(v => v.chapter === 1));
      } else {
        allVerses = allVerses.concat(verses);
      }
    }

    console.log(`\n📊 Total verses to import: ${allVerses.length}`);

    if (allVerses.length === 0) {
      console.log('⚠️  No verses to import!');
      return;
    }

    // Import all verses
    await importVerses(manuscriptId, allVerses);

    // Show summary
    const books = [...new Set(allVerses.map(v => v.book))];
    console.log('📊 Import Summary:');
    console.log(`   - Books: ${books.length}`);
    console.log(`   - Verses: ${allVerses.length}`);
    console.log(`   - Books imported: ${books.join(', ')}`);
    console.log('\n✅ SBLGNT import completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
