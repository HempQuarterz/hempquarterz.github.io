#!/usr/bin/env node

/**
 * World English Bible (WEB) Import Script
 *
 * Imports the complete English Bible from the World English Bible
 * public domain translation.
 *
 * Format: Text files with chapter headings and verse text
 *         engwebp_002_GEN_01_read.txt
 *
 * Usage:
 *   node database/import-web.js              # Import all books
 *   node database/import-web.js --test       # Import Genesis 1 only
 *   node database/import-web.js --book=GEN   # Import specific book
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs').promises;
const path = require('path');
const { readdir } = require('fs').promises;

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getWEBManuscriptId() {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  if (error) {
    console.error('❌ Error finding WEB manuscript:', error.message);
    throw error;
  }

  return data.id;
}

async function parseWEBFile(filePath) {
  const content = await fs.readFile(filePath, 'utf-8');
  const lines = content.split('\n').map(line => line.trim()).filter(line => line);

  // Extract book and chapter from filename: engwebp_002_GEN_01_read.txt
  const filename = path.basename(filePath);
  const match = filename.match(/engwebp_(\d+)_([A-Z0-9]+)_(\d+)_read\.txt/);

  if (!match) {
    console.warn(`⚠️  Could not parse filename: ${filename}`);
    return [];
  }

  const [, , bookCode, chapterStr] = match;
  const chapter = parseInt(chapterStr, 10);

  const verses = [];
  let verseNum = 1;

  for (const line of lines) {
    // Skip book title and chapter heading
    if (line.startsWith('The ') || line.startsWith('Chapter ')) {
      continue;
    }

    // Each line is a verse
    if (line.length > 0) {
      verses.push({
        book: bookCode,
        chapter,
        verse: verseNum,
        text: line
      });
      verseNum++;
    }
  }

  return verses;
}

async function getWEBFiles() {
  const webDir = path.join(__dirname, '../manuscripts/english/web');
  const files = await readdir(webDir);

  return files
    .filter(f => f.match(/engwebp_\d+_[A-Z0-9]+_\d+_read\.txt/))
    .filter(f => !f.includes('_000_000_000_')) // Skip intro/header files
    .map(f => ({
      path: path.join(webDir, f),
      filename: f
    }))
    .sort((a, b) => a.filename.localeCompare(b.filename));
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
      text: v.text
    }));

    const { error} = await supabase
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
  const specificBook = bookArg ? bookArg.split('=')[1].toUpperCase() : null;

  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       World English Bible (WEB) Import Script                 ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get WEB manuscript ID
    console.log('🔍 Finding WEB manuscript in database...');
    const manuscriptId = await getWEBManuscriptId();
    console.log(`✅ Found WEB manuscript: ${manuscriptId}\n`);

    // Get all WEB files
    let files = await getWEBFiles();
    console.log(`📚 Found ${files.length} chapter files`);

    // Filter based on mode
    if (isTest) {
      console.log('🧪 TEST MODE: Importing Genesis chapter 1 only');
      files = files.filter(f => f.filename.includes('_GEN_01_'));
    } else if (specificBook) {
      console.log(`📖 Importing book: ${specificBook}`);
      files = files.filter(f => f.filename.includes(`_${specificBook}_`));
    } else {
      console.log('📚 FULL IMPORT: All Bible books');
    }

    let allVerses = [];
    let chaptersProcessed = 0;

    // Parse each chapter file
    for (const file of files) {
      const verses = await parseWEBFile(file.path);

      if (verses.length > 0) {
        allVerses = allVerses.concat(verses);
        chaptersProcessed++;

        if (chaptersProcessed % 10 === 0) {
          process.stdout.write(`\r   Parsing: ${chaptersProcessed}/${files.length} chapters...`);
        }
      }
    }

    if (chaptersProcessed > 0) {
      console.log(`\r   ✓ Parsed ${chaptersProcessed} chapters                    `);
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
    const chapters = [...new Set(allVerses.map(v => `${v.book}.${v.chapter}`))];

    console.log('📊 Import Summary:');
    console.log(`   - Books: ${books.length}`);
    console.log(`   - Chapters: ${chapters.length}`);
    console.log(`   - Verses: ${allVerses.length}`);
    console.log(`   - Books imported: ${books.join(', ')}`);
    console.log('\n✅ WEB import completed successfully!\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error(error);
    process.exit(1);
  }
}

main().catch(console.error);
