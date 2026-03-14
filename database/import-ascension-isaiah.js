/**
 * Ascension of Isaiah Import Script
 * Imports R.H. Charles translation from scrollmapper JSON
 *
 * Usage:
 *   node import-ascension-isaiah.js --test    # Import first 3 chapters
 *   node import-ascension-isaiah.js --full    # Import all 11 chapters
 */
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
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
  if (error || !data) throw new Error('CHARLES manuscript not found. Run setup-eotc-entries.js first.');
  return data.id;
}

function parseJSON(filePath, testMode) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const chapters = raw.books[0].chapters;
  const limit = testMode ? 3 : chapters.length;
  const verses = [];
  const seen = new Set();

  for (let i = 0; i < limit; i++) {
    const ch = chapters[i];
    for (const v of ch.verses) {
      if (v.verse < 1) continue; // skip verse 0 entries
      const key = `${v.chapter}:${v.verse}`;
      if (seen.has(key)) continue;
      seen.add(key);
      verses.push({
        book: 'ASI',
        chapter: v.chapter,
        verse: v.verse,
        text: v.text.trim()
      });
    }
  }
  return verses;
}

async function importVerses(manuscriptId, verses) {
  const BATCH_SIZE = 100;
  let imported = 0, failed = 0;

  for (let i = 0; i < verses.length; i += BATCH_SIZE) {
    const batch = verses.slice(i, i + BATCH_SIZE).map(v => ({
      ...v, manuscript_id: manuscriptId, morphology: null
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(batch, { onConflict: 'manuscript_id,book,chapter,verse' });

    if (error) {
      console.error(`  Batch ${i} failed:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
    }
  }

  console.log(`  Imported: ${imported}, Failed: ${failed}`);
  return { imported, failed };
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');
  if (!testMode && !fullMode) { console.log('Usage: node import-ascension-isaiah.js --test | --full'); process.exit(0); }

  console.log(`Ascension of Isaiah Import (${testMode ? 'TEST - 3 chapters' : 'FULL - 11 chapters'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getManuscriptId();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  const dataPath = path.join(__dirname, '../manuscripts/ethiopian/ascension-of-isaiah.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found:', dataPath);
    process.exit(1);
  }

  const verses = parseJSON(dataPath, testMode);
  console.log(`  Parsed ${verses.length} unique verses`);

  await importVerses(manuscriptId, verses);

  // Verify
  const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId).eq('book', 'ASI');
  console.log(`  ASI verses in database: ${count}`);

  const { data: samples } = await supabase.from('verses').select('chapter, verse, text')
    .eq('manuscript_id', manuscriptId).eq('book', 'ASI').order('chapter').order('verse').limit(3);
  if (samples) samples.forEach(v => console.log(`    ASI ${v.chapter}:${v.verse} - ${v.text.substring(0, 80)}...`));

  console.log('\nAscension of Isaiah import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
