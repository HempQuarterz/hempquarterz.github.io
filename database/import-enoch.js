/**
 * 1 Enoch Import Script
 * Imports R.H. Charles (1912) translation from scrollmapper JSON
 *
 * Usage:
 *   node import-enoch.js --test    # Import first 5 chapters only
 *   node import-enoch.js --full    # Import all 108 chapters
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

function parseEnochJSON(filePath, testMode) {
  const raw = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const chapters = raw.books[0].chapters;
  const limit = testMode ? 5 : chapters.length;
  const verses = [];

  for (let i = 0; i < limit; i++) {
    const ch = chapters[i];
    for (const v of ch.verses) {
      verses.push({
        book: 'ENO',
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
      process.stdout.write(`\r  Progress: ${imported}/${verses.length} (${Math.round(imported / verses.length * 100)}%)`);
    }
  }

  console.log(`\n  Imported: ${imported}, Failed: ${failed}`);
  return { imported, failed };
}

async function verify(manuscriptId) {
  const { count } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId)
    .eq('book', 'ENO');

  console.log(`  ENO verses in database: ${count}`);

  const { data: samples } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .eq('book', 'ENO')
    .order('chapter')
    .order('verse')
    .limit(3);

  if (samples) {
    console.log('  Samples:');
    samples.forEach(v => console.log(`    ${v.book} ${v.chapter}:${v.verse} - ${v.text.substring(0, 80)}...`));
  }
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');

  if (!testMode && !fullMode) {
    console.log('Usage: node import-enoch.js --test | --full');
    process.exit(0);
  }

  console.log(`1 Enoch Import (${testMode ? 'TEST - 5 chapters' : 'FULL - 108 chapters'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getManuscriptId();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  const dataPath = path.join(__dirname, '../manuscripts/ethiopian/1-enoch.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found:', dataPath);
    process.exit(1);
  }

  let verses = parseEnochJSON(dataPath, testMode);
  // Deduplicate: keep first occurrence of each chapter:verse
  const seen = new Set();
  verses = verses.filter(v => {
    const key = `${v.chapter}:${v.verse}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  console.log(`  Parsed ${verses.length} unique verses from ${testMode ? '5' : '108'} chapters`);

  await importVerses(manuscriptId, verses);
  await verify(manuscriptId);

  console.log('\n1 Enoch import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
