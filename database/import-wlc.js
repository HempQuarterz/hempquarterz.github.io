#!/usr/bin/env node

/**
 * Westminster Leningrad Codex (WLC) Import Script
 *
 * Imports the complete Hebrew Old Testament with Strong's numbers
 * and morphological data from the OXLOS WLC format.
 *
 * Format: Gen 1:1.1	7225	בְּ/רֵאשִׁ֖ית
 *         [Reference] [Strong#] [Hebrew Text]
 *
 * Usage:
 *   node database/import-wlc.js              # Import all books
 *   node database/import-wlc.js --test       # Import Genesis 1 only
 *   node database/import-wlc.js --book GEN   # Import specific book
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Book name mappings
const BOOK_CODES = {
  'Gen': 'GEN', 'Exod': 'EXO', 'Lev': 'LEV', 'Num': 'NUM', 'Deut': 'DEU',
  'Josh': 'JOS', 'Judg': 'JDG', 'Ruth': 'RUT', '1Sam': '1SA', '2Sam': '2SA',
  '1Kgs': '1KI', '2Kgs': '2KI', '1Chr': '1CH', '2Chr': '2CH',
  'Ezra': 'EZR', 'Neh': 'NEH', 'Esth': 'EST', 'Job': 'JOB',
  'Ps': 'PSA', 'Prov': 'PRO', 'Eccl': 'ECC', 'Song': 'SNG',
  'Isa': 'ISA', 'Jer': 'JER', 'Lam': 'LAM', 'Ezek': 'EZE', 'Dan': 'DAN',
  'Hos': 'HOS', 'Joel': 'JOL', 'Amos': 'AMO', 'Obad': 'OBA', 'Jonah': 'JON',
  'Mic': 'MIC', 'Nah': 'NAH', 'Hab': 'HAB', 'Zeph': 'ZEP', 'Hag': 'HAG',
  'Zech': 'ZEC', 'Mal': 'MAL'
};

async function getWLCManuscriptId() {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WLC')
    .single();

  if (error) {
    console.error('❌ Error finding WLC manuscript:', error.message);
    throw error;
  }

  return data.id;
}

async function parseWLCFile(filePath) {
  console.log(`📖 Reading file: ${filePath}`);

  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').filter(line => line.trim());

  const verses = {};

  for (const line of lines) {
    // Parse format: Gen 1:1.1	7225	בְּ/רֵאשִׁ֖ית
    const match = line.match(/^(\w+)\s+(\d+):(\d+)\.(\d+)\t(\d+)\t(.+)$/);

    if (!match) continue;

    const [, rawBook, chapter, verse, wordNum, strongNum, hebrewText] = match;
    const book = BOOK_CODES[rawBook] || rawBook.toUpperCase();
    const verseKey = `${book}.${chapter}.${verse}`;

    if (!verses[verseKey]) {
      verses[verseKey] = {
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse),
        words: [],
        strong_numbers: [],
        text: ''
      };
    }

    verses[verseKey].words.push({
      word: hebrewText,
      strong: strongNum,
      position: parseInt(wordNum)
    });

    if (!verses[verseKey].strong_numbers.includes(strongNum)) {
      verses[verseKey].strong_numbers.push(strongNum);
    }
  }

  // Assemble verse text
  Object.values(verses).forEach(verse => {
    verse.text = verse.words.map(w => w.word).join(' ');
    verse.morphology = verse.words;
  });

  return Object.values(verses);
}

async function importVerses(manuscriptId, verses) {
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
      strong_numbers: v.strong_numbers,
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
  console.log('║     Westminster Leningrad Codex (WLC) Import Script          ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get WLC manuscript ID
    console.log('🔍 Finding WLC manuscript in database...');
    const manuscriptId = await getWLCManuscriptId();
    console.log(`✅ Found WLC manuscript: ${manuscriptId}\n`);

    // Parse WLC file
    const wlcPath = path.join(__dirname, '../manuscripts/hebrew/wlc/oxlos-import/wlc.txt');
    let allVerses = await parseWLCFile(wlcPath);

    console.log(`📊 Total verses parsed: ${allVerses.length}`);

    // Filter based on mode
    if (isTest) {
      console.log('🧪 TEST MODE: Importing Genesis chapter 1 only');
      allVerses = allVerses.filter(v => v.book === 'GEN' && v.chapter === 1);
    } else if (specificBook) {
      console.log(`📖 Importing book: ${specificBook}`);
      allVerses = allVerses.filter(v => v.book === specificBook.toUpperCase());
    } else {
      console.log('📚 FULL IMPORT: All Old Testament books');
    }

    if (allVerses.length === 0) {
      console.log('⚠️  No verses to import!');
      return;
    }

    console.log(`📝 Verses to import: ${allVerses.length}`);

    // Import verses
    await importVerses(manuscriptId, allVerses);

    // Show summary
    const books = [...new Set(allVerses.map(v => v.book))];
    console.log('📊 Import Summary:');
    console.log(`   - Books: ${books.length}`);
    console.log(`   - Verses: ${allVerses.length}`);
    console.log(`   - Books imported: ${books.join(', ')}`);
    console.log('\n✅ WLC import completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
