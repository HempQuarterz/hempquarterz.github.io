/**
 * Meqabyan 1-3 Import Script
 * Imports from Wikisource CC-BY-SA translations
 *
 * Usage:
 *   node import-meqabyan.js --test    # Import 1 Meqabyan chapter 1 only
 *   node import-meqabyan.js --full    # Import all 3 books (67 chapters)
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const BOOKS = [
  { code: '1MQ', name: '1 Meqabyan', chapters: 36, wikiPage: 'Translation:1_Meqabyan' },
  { code: '2MQ', name: '2 Meqabyan', chapters: 21, wikiPage: 'Translation:2_Meqabyan' },
  { code: '3MQ', name: '3 Meqabyan', chapters: 10, wikiPage: 'Translation:3_Meqabyan' }
];

async function getOrCreateManuscript() {
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WIKISOURCE')
    .single();

  if (existing) return existing.id;

  const { data: newMs, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'WIKISOURCE',
      name: 'Wikisource Community Translations',
      language: 'english',
      date_range: '2010-present',
      license: 'CC-BY-SA',
      description: 'Community translations from Wikisource under Creative Commons Attribution-ShareAlike license. Includes Meqabyan (Ethiopian Maccabees) translated from Ge\'ez.',
      source_url: 'https://en.wikisource.org/wiki/Translation:1_Meqabyan'
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create WIKISOURCE manuscript: ${error.message}`);
  console.log(`  Created WIKISOURCE manuscript (ID: ${newMs.id})`);
  return newMs.id;
}

async function fetchBookFromWikisource(wikiPage) {
  // Fetch the main page which contains chapter links or full text
  const url = `https://en.wikisource.org/w/api.php?action=parse&page=${encodeURIComponent(wikiPage)}&prop=wikitext&format=json`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Wikisource API error: ${resp.status}`);
  const data = await resp.json();

  if (!data.parse?.wikitext?.['*']) return [];

  const wikitext = data.parse.wikitext['*'];
  return parseWikitext(wikitext);
}

function parseWikitext(wikitext) {
  const verses = [];
  let currentChapter = 0;
  let currentVerse = 0;

  const lines = wikitext.split('\n');

  for (const line of lines) {
    const trimmed = line.trim();

    // Match chapter headings: "== Chapter 1 ==", "=== Chapter 1 ===", or plain "Chapter 1"
    const chapterMatch = trimmed.match(/^=*\s*Chapter\s+(\d+)\s*=*/i);
    if (chapterMatch) {
      currentChapter = parseInt(chapterMatch[1]);
      currentVerse = 0;
      continue;
    }

    // Match verse patterns: "1. text", "[1] text", "{{verse|1}} text"
    const verseMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
    const bracketVerseMatch = trimmed.match(/^\[(\d+)\]\s*(.*)/);
    const verseTemplateMatch = trimmed.match(/\{\{verse\|(\d+)\}\}\s*(.*)/);

    const match = verseMatch || bracketVerseMatch || verseTemplateMatch;

    if (match && currentChapter > 0) {
      // Save previous verse if we had continuation text
      currentVerse = parseInt(match[1]);
      let text = match[2];
      text = cleanWikiMarkup(text);
      if (text.length > 0) {
        verses.push({ chapter: currentChapter, verse: currentVerse, text });
      }
    } else if (currentChapter > 0 && currentVerse === 0 && trimmed.length > 20 && !trimmed.startsWith('{{') && !trimmed.startsWith('[[') && !trimmed.startsWith('=') && !trimmed.startsWith('<') && !trimmed.startsWith('|')) {
      // If no verse numbers found, treat each substantial paragraph as a verse
      currentVerse++;
      let text = cleanWikiMarkup(trimmed);
      if (text.length > 10) {
        verses.push({ chapter: currentChapter, verse: currentVerse, text });
      }
    }
  }

  return verses;
}

function cleanWikiMarkup(text) {
  return text
    .replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2')  // [[link|text]] -> text
    .replace(/'''([^']+)'''/g, '$1')  // '''bold''' -> bold
    .replace(/''([^']+)''/g, '$1')    // ''italic'' -> italic
    .replace(/\{\{[^}]+\}\}/g, '')     // remove templates
    .replace(/<ref[^>]*>.*?<\/ref>/g, '')  // remove refs
    .replace(/<[^>]+>/g, '')           // remove HTML tags
    .replace(/\s+/g, ' ')
    .trim();
}

async function importVerses(manuscriptId, bookCode, verses) {
  if (verses.length === 0) return { imported: 0, failed: 0 };

  const BATCH_SIZE = 100;
  let imported = 0, failed = 0;

  const rows = verses.map(v => ({
    book: bookCode,
    chapter: v.chapter,
    verse: v.verse,
    text: v.text,
    manuscript_id: manuscriptId,
    morphology: null
  }));

  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('verses')
      .upsert(batch, { onConflict: 'manuscript_id,book,chapter,verse' });

    if (error) {
      console.error(`    Batch error for ${bookCode}:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
    }
  }

  return { imported, failed };
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');
  if (!testMode && !fullMode) { console.log('Usage: node import-meqabyan.js --test | --full'); process.exit(0); }

  console.log(`Meqabyan Import (${testMode ? 'TEST - 1MQ only' : 'FULL - all 3 books'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getOrCreateManuscript();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  const booksToImport = testMode ? [BOOKS[0]] : BOOKS;
  let totalImported = 0, totalFailed = 0;

  for (const book of booksToImport) {
    console.log(`\n  Fetching ${book.name} from Wikisource...`);
    try {
      const verses = await fetchBookFromWikisource(book.wikiPage);
      console.log(`    Parsed ${verses.length} verses across ${new Set(verses.map(v => v.chapter)).size} chapters`);

      if (verses.length === 0) {
        console.log(`    Warning: No verses extracted. Page structure may differ from expected.`);
        continue;
      }

      const { imported, failed } = await importVerses(manuscriptId, book.code, verses);
      totalImported += imported;
      totalFailed += failed;
      console.log(`    Imported: ${imported}, Failed: ${failed}`);
    } catch (err) {
      console.error(`    Error: ${err.message}`);
    }

    // Rate limit
    await new Promise(r => setTimeout(r, 500));
  }

  // Verify
  console.log('\n  Verification:');
  for (const book of booksToImport) {
    const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true })
      .eq('manuscript_id', manuscriptId).eq('book', book.code);
    console.log(`    ${book.code}: ${count || 0} verses`);
  }

  console.log(`\n  Total: ${totalImported} imported, ${totalFailed} failed`);
  console.log('Meqabyan import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
