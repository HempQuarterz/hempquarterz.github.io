/**
 * Jubilees Import Script
 * Fetches R.H. Charles translation from Sefaria API (no key required)
 *
 * Usage:
 *   node import-jubilees.js --test    # Import first 3 chapters
 *   node import-jubilees.js --full    # Import all 50 chapters
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getManuscriptId() {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'CHARLES')
    .single();
  if (error || !data) throw new Error('CHARLES manuscript not found.');
  return data.id;
}

async function fetchChapterFromSacredTexts(chapter) {
  // pseudepigrapha.com has the R.H. Charles translation
  const paddedCh = String(chapter).padStart(2, '0');
  const url = `https://www.pseudepigrapha.com/jubilees/${chapter}.htm`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Sacred-texts error for chapter ${chapter}: ${resp.status}`);
  const html = await resp.text();

  // Extract verse text - verses are formatted as "N. text" in the HTML
  const verses = [];
  // Remove HTML tags except paragraph breaks
  const text = html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Match verse patterns like "1. text" or "1 text" at start of lines
  const lines = text.split('\n');
  let currentVerse = null;
  let currentText = '';

  for (const line of lines) {
    const trimmed = line.trim();
    // Match verse number at start: "1. text" or just "1. "
    const match = trimmed.match(/^(\d+)\.\s+(.*)/);
    if (match) {
      // Save previous verse
      if (currentVerse !== null && currentText.trim()) {
        verses.push({
          book: 'JUB',
          chapter: chapter,
          verse: currentVerse,
          text: currentText.trim()
        });
      }
      currentVerse = parseInt(match[1]);
      currentText = match[2];
    } else if (currentVerse !== null && trimmed) {
      // Continuation of current verse
      currentText += ' ' + trimmed;
    }
  }

  // Save last verse
  if (currentVerse !== null && currentText.trim()) {
    verses.push({
      book: 'JUB',
      chapter: chapter,
      verse: currentVerse,
      text: currentText.trim()
    });
  }

  return verses;
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');
  if (!testMode && !fullMode) { console.log('Usage: node import-jubilees.js --test | --full'); process.exit(0); }

  const totalChapters = testMode ? 3 : 50;
  console.log(`Jubilees Import (${testMode ? 'TEST - 3 chapters' : 'FULL - 50 chapters'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getManuscriptId();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  let allVerses = [];
  let failedChapters = [];

  for (let ch = 1; ch <= totalChapters; ch++) {
    try {
      const verses = await fetchChapterFromSacredTexts(ch);
      allVerses = allVerses.concat(verses);
      process.stdout.write(`\r  Fetching: chapter ${ch}/${totalChapters} (${allVerses.length} verses)`);
      // Rate limit: 200ms between requests
      await new Promise(r => setTimeout(r, 200));
    } catch (err) {
      console.error(`\n  Warning: chapter ${ch} failed: ${err.message}`);
      failedChapters.push(ch);
    }
  }

  console.log(`\n  Total verses fetched: ${allVerses.length}`);
  if (failedChapters.length) console.log(`  Failed chapters: ${failedChapters.join(', ')}`);

  // Batch insert
  const BATCH_SIZE = 100;
  let imported = 0, failed = 0;
  for (let i = 0; i < allVerses.length; i += BATCH_SIZE) {
    const batch = allVerses.slice(i, i + BATCH_SIZE).map(v => ({
      ...v, manuscript_id: manuscriptId, morphology: null
    }));
    const { error } = await supabase.from('verses').upsert(batch, { onConflict: 'manuscript_id,book,chapter,verse' });
    if (error) { console.error(`  Batch error:`, error.message); failed += batch.length; }
    else imported += batch.length;
  }

  console.log(`  Imported: ${imported}, Failed: ${failed}`);

  // Verify
  const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId).eq('book', 'JUB');
  console.log(`  JUB verses in database: ${count}`);

  const { data: samples } = await supabase.from('verses').select('chapter, verse, text')
    .eq('manuscript_id', manuscriptId).eq('book', 'JUB').order('chapter').order('verse').limit(3);
  if (samples) samples.forEach(v => console.log(`    JUB ${v.chapter}:${v.verse} - ${v.text.substring(0, 80)}...`));

  console.log('\nJubilees import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
