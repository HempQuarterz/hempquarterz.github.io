/**
 * Analyze LXX Missing Verses
 * Find patterns in the 50 verses that failed to import
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const BOOK_MAP = {
  10: 'GEN', 20: 'EXO', 30: 'LEV', 40: 'NUM', 50: 'DEU',
  60: 'JOS', 70: 'JDG', 80: 'RUT', 90: '1SA', 100: '2SA',
  110: '1KI', 120: '2KI', 130: '1CH', 140: '2CH', 150: 'EZR',
  160: 'NEH', 190: 'EST', 220: 'JOB', 230: 'PSA', 240: 'PRO',
  250: 'ECC', 260: 'SNG', 290: 'ISA', 300: 'JER', 310: 'LAM',
  330: 'EZK', 340: 'DAN', 350: 'HOS', 360: 'JOL', 370: 'AMO',
  380: 'OBA', 390: 'JON', 400: 'MIC', 410: 'NAM', 420: 'HAB',
  430: 'ZEP', 440: 'HAG', 450: 'ZEC', 460: 'MAL'
};

async function getImportedVerses(manuscriptId) {
  const importedSet = new Set();
  let page = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse')
      .eq('manuscript_id', manuscriptId)
      .range(page * 1000, (page + 1) * 1000 - 1);

    if (error) {
      console.error('Error fetching verses:', error.message);
      break;
    }

    if (!data || data.length === 0) {
      hasMore = false;
    } else {
      data.forEach(v => importedSet.add(`${v.book}:${v.chapter}:${v.verse}`));
      hasMore = data.length === 1000;
      page++;
    }
  }

  return importedSet;
}

async function main() {
  console.log('🔍 Analyzing LXX Missing Verses\n');

  const csvPath = path.join(__dirname, '../../manuscripts/septuagint/LXX-Rahlfs-1935/11_end-users_files/MyBible/Bibles/LXX_final_main.csv');
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');

  // Get imported verses
  console.log('📊 Fetching imported verses from database...');
  const manuscriptId = '945bd765-0f66-4a31-920a-9540a9754346';
  const importedSet = await getImportedVerses(manuscriptId);
  console.log(`   Found ${importedSet.size} imported verses\n`);

  // Find missing verses
  console.log('📖 Parsing CSV for missing verses...');
  const missing = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    const parts = trimmed.split('\t');
    if (parts.length !== 4) continue;

    const bookNum = parseInt(parts[0], 10);
    const chapter = parseInt(parts[1], 10);
    const verse = parseInt(parts[2], 10);

    const bookCode = BOOK_MAP[bookNum];
    if (!bookCode) continue;

    const verseKey = `${bookCode}:${chapter}:${verse}`;
    if (!importedSet.has(verseKey)) {
      missing.push({ book: bookCode, bookNum, chapter, verse, key: verseKey });
    }
  }

  console.log(`   Total missing: ${missing.length}\n`);

  // Analyze constraint patterns
  const chapterZero = missing.filter(v => v.chapter === 0 || v.chapter < 0);
  const verseZero = missing.filter(v => v.verse === 0 || v.verse < 0);
  const chapterLarge = missing.filter(v => v.chapter > 999);
  const verseLarge = missing.filter(v => v.verse > 999);

  console.log('📊 Constraint Violation Analysis:');
  console.log(`   Chapter ≤ 0: ${chapterZero.length} verses`);
  console.log(`   Verse ≤ 0: ${verseZero.length} verses`);
  console.log(`   Chapter > 999: ${chapterLarge.length} verses`);
  console.log(`   Verse > 999: ${verseLarge.length} verses\n`);

  if (chapterZero.length > 0) {
    console.log('❌ Verses with chapter ≤ 0 (unfixable):');
    chapterZero.forEach(v => {
      console.log(`   ${v.key} (Book ${v.bookNum})`);
    });
    console.log('');
  }

  if (verseZero.length > 0) {
    console.log('❌ Verses with verse ≤ 0 (unfixable):');
    verseZero.slice(0, 20).forEach(v => {
      console.log(`   ${v.key} (Book ${v.bookNum})`);
    });
    if (verseZero.length > 20) {
      console.log(`   ... and ${verseZero.length - 20} more`);
    }
    console.log('');
  }

  console.log('📋 First 20 missing verses:');
  missing.slice(0, 20).forEach(v => {
    console.log(`   ${v.key}`);
  });
}

main().catch(err => {
  console.error('💥 Error:', err);
  process.exit(1);
});
