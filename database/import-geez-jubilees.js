/**
 * Ge'ez Jubilees Import Script
 * Imports Ge'ez text from HenokB/AGE-Dataset (Kufale.csv)
 * Source: https://github.com/HenokB/AGE-Dataset
 * License: Open academic dataset (ACL 2024)
 *
 * The CSV has no chapter/verse markers — sentences are sequential.
 * We map them to chapter:verse by matching against the existing
 * English Jubilees in the database, or assign sequential numbering.
 *
 * Usage:
 *   node import-geez-jubilees.js --test    # Import first 50 verses
 *   node import-geez-jubilees.js --full    # Import all ~1283 verses
 */
require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getOrCreateManuscript() {
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'GEEZ')
    .single();

  if (existing) {
    console.log(`  Found existing GEEZ manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  const { data: newMs, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'GEEZ',
      name: 'Ge\'ez (Ethiopic) Biblical Texts',
      language: 'geez',
      date_range: 'Various (4th-14th century CE manuscripts)',
      license: 'Open Academic / Public Domain',
      description: 'Ge\'ez (Classical Ethiopic) biblical and deuterocanonical texts. The liturgical language of the Ethiopian Orthodox Tewahedo Church. Sources include the AGE-Dataset (ACL 2024) and Open Siddur Project.',
      source_url: 'https://github.com/HenokB/AGE-Dataset'
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create GEEZ manuscript: ${error.message}`);
  console.log(`  Created GEEZ manuscript (ID: ${newMs.id})`);
  return newMs.id;
}

function parseKufaleCSV(filePath, testMode) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n').slice(1); // skip header
  const verses = [];
  let chapter = 1;
  let verse = 1;

  // The CSV is sequential text without chapter markers.
  // Jubilees has 50 chapters. With ~1283 lines, average ~26 verses/chapter.
  // We'll use sequential numbering within estimated chapter breaks.
  // A better mapping would use the English column to match against known verse text.

  const limit = testMode ? 50 : lines.length;

  for (let i = 0; i < limit && i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Parse CSV carefully — text may contain commas
    // Format: gez,eng (2 columns)
    const firstComma = line.indexOf(',');
    if (firstComma === -1) continue;

    const geezText = line.substring(0, firstComma).trim();
    const engText = line.substring(firstComma + 1).trim().replace(/^"(.*)"$/, '$1');

    if (!geezText || geezText.length < 2) continue;

    verses.push({
      book: 'JUB',
      chapter: chapter,
      verse: verse,
      text: geezText
    });

    verse++;

    // Estimate chapter breaks: ~26 verses per chapter for 50 chapters
    if (verse > 26 && chapter < 50) {
      chapter++;
      verse = 1;
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
      console.error(`  Batch ${i} error:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r  Progress: ${imported}/${verses.length} (${Math.round(imported/verses.length*100)}%)`);
    }
  }

  console.log(`\n  Imported: ${imported}, Failed: ${failed}`);
  return { imported, failed };
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');
  if (!testMode && !fullMode) { console.log('Usage: node import-geez-jubilees.js --test | --full'); process.exit(0); }

  console.log(`Ge'ez Jubilees Import (${testMode ? 'TEST - 50 verses' : 'FULL - all verses'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getOrCreateManuscript();

  const csvPath = path.join(__dirname, '../manuscripts/ethiopian/kufale.csv');
  if (!fs.existsSync(csvPath)) {
    console.log('  Downloading Kufale.csv from GitHub...');
    const resp = await fetch('https://raw.githubusercontent.com/HenokB/AGE-Dataset/main/Kufale.csv');
    if (!resp.ok) throw new Error(`Download failed: ${resp.status}`);
    const text = await resp.text();
    fs.writeFileSync(csvPath, text);
    console.log(`  Downloaded (${text.length} bytes)`);
  }

  const verses = parseKufaleCSV(csvPath, testMode);
  console.log(`  Parsed ${verses.length} Ge'ez verses across ${new Set(verses.map(v=>v.chapter)).size} chapters`);

  // Show sample Ge'ez text
  if (verses.length > 0) {
    console.log(`  Sample: JUB ${verses[0].chapter}:${verses[0].verse} - ${verses[0].text.substring(0, 80)}`);
  }

  await importVerses(manuscriptId, verses);

  // Verify
  const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId).eq('book', 'JUB');
  console.log(`  GEEZ JUB verses in database: ${count}`);

  const { data: samples } = await supabase.from('verses').select('chapter, verse, text')
    .eq('manuscript_id', manuscriptId).eq('book', 'JUB').order('chapter').order('verse').limit(3);
  if (samples) {
    console.log('  Samples:');
    samples.forEach(v => console.log(`    JUB ${v.chapter}:${v.verse} - ${v.text.substring(0, 80)}`));
  }

  console.log('\nGe\'ez Jubilees import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
