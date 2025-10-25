/**
 * Septuagint (LXX) Rahlfs 1935 Import Script
 * Imports the Greek Old Testament from CSV format with morphology
 *
 * Source: eliranwong/LXX-Rahlfs-1935
 * License: CC BY-NC-SA 4.0
 * Format: CSV with book_number\tchapter\tverse\ttext (with embedded tags)
 *
 * Usage:
 *   node database/import-lxx.js --test    # Import Genesis 1 only
 *   node database/import-lxx.js --book GEN  # Import one book
 *   node database/import-lxx.js --full    # Import entire LXX (~28,000 verses)
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

// Book number to standard code mapping
const BOOK_MAP = {
  10: 'GEN',    // Genesis
  20: 'EXO',    // Exodus
  30: 'LEV',    // Leviticus
  40: 'NUM',    // Numbers
  50: 'DEU',    // Deuteronomy
  60: 'JOS',    // Joshua
  70: 'JDG',    // Judges
  80: 'RUT',    // Ruth
  90: '1SA',    // 1 Samuel
  100: '2SA',   // 2 Samuel
  110: '1KI',   // 1 Kings
  120: '2KI',   // 2 Kings
  130: '1CH',   // 1 Chronicles
  140: '2CH',   // 2 Chronicles
  150: 'EZR',   // Ezra
  160: 'NEH',   // Nehemiah
  190: 'EST',   // Esther
  220: 'JOB',   // Job
  230: 'PSA',   // Psalms
  240: 'PRO',   // Proverbs
  250: 'ECC',   // Ecclesiastes
  260: 'SNG',   // Song of Solomon
  290: 'ISA',   // Isaiah
  300: 'JER',   // Jeremiah
  310: 'LAM',   // Lamentations
  330: 'EZK',   // Ezekiel
  340: 'DAN',   // Daniel
  350: 'HOS',   // Hosea
  360: 'JOL',   // Joel
  370: 'AMO',   // Amos
  380: 'OBA',   // Obadiah
  390: 'JON',   // Jonah
  400: 'MIC',   // Micah
  410: 'NAM',   // Nahum
  420: 'HAB',   // Habakkuk
  430: 'ZEP',   // Zephaniah
  440: 'HAG',   // Haggai
  450: 'ZEC',   // Zechariah
  460: 'MAL',   // Malachi
  // Deuterocanonical books
  165: '1ES',   // 1 Esdras
  170: 'TOB',   // Tobit
  180: 'JDT',   // Judith
  232: 'PSS',   // Psalms of Solomon
  462: '1MA',   // 1 Maccabees
  464: '2MA',   // 2 Maccabees
  466: '3MA',   // 3 Maccabees
  467: '4MA',   // 4 Maccabees
  270: 'WIS',   // Wisdom
  280: 'SIR',   // Sirach
  315: 'EJE',   // Epistle of Jeremiah
  320: 'BAR',   // Baruch
  325: 'SUS',   // Susanna
  345: 'BEL',   // Bel and the Dragon
  800: 'ODE'    // Odes
};

/**
 * Get or create LXX manuscript entry
 */
async function getManuscriptId() {
  console.log('📚 Checking for LXX manuscript entry...');

  const { data: existing, error: fetchError } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'LXX')
    .single();

  if (existing) {
    console.log(`✅ Found existing LXX manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  // Create new manuscript entry
  const { data: newManuscript, error: insertError} = await supabase
    .from('manuscripts')
    .insert({
      code: 'LXX',
      name: 'Septuagint (Rahlfs 1935)',
      language: 'greek',
      date_range: '3rd-1st century BCE',
      license: 'CC BY-NC-SA 4.0',
      description: 'Greek Old Testament (Septuagint) with morphological tagging and Strong\'s numbers',
      authenticity_tier: 1,
      tier_notes: 'Critical diplomatic edition (Rahlfs 1935) of ancient Greek Septuagint. No paraphrasing, CCAT-based data. Preserves pre-Christian Jewish divine name usage. Tier 1: AUTHENTIC - suitable for AI restoration work.'
    })
    .select('id')
    .single();

  if (insertError) {
    throw new Error(`Failed to create manuscript: ${insertError.message}`);
  }

  console.log(`✅ Created LXX manuscript entry (ID: ${newManuscript.id})`);
  return newManuscript.id;
}

/**
 * Parse LXX verse text with embedded tags
 * Format: word<S>strong#</S><m>morphology</m> word<S>strong#</S><m>morphology</m>
 */
function parseVerseText(text) {
  const words = [];
  const morphology = [];
  
  // Split by spaces to get word units
  const units = text.split(/\s+/);
  
  for (const unit of units) {
    if (!unit.trim()) continue;
    
    // Extract word, Strong's numbers, and morphology
    // Pattern: word<S>num</S><m>morph</m><S>num</S>...
    let cleanWord = unit;
    const strongNums = [];
    let morphCode = '';
    
    // Extract all Strong's numbers
    const strongMatches = unit.matchAll(/<S>(\d+)<\/S>/g);
    for (const match of strongMatches) {
      strongNums.push('G' + match[1]);
    }
    
    // Extract morphology code
    const morphMatch = unit.match(/<m>(lxx\.[^<]+)<\/m>/);
    if (morphMatch) {
      morphCode = morphMatch[1];
    }
    
    // Remove all tags to get clean word
    cleanWord = unit.replace(/<S>\d+<\/S>/g, '')
                   .replace(/<m>[^<]+<\/m>/g, '')
                   .trim();
    
    if (cleanWord) {
      words.push(cleanWord);
      
      if (strongNums.length > 0 || morphCode) {
        morphology.push({
          word: cleanWord,
          strong: strongNums.length > 0 ? strongNums[0] : null,  // Use first Strong's number
          morph: morphCode
        });
      }
    }
  }
  
  return {
    text: words.join(' '),
    morphology: morphology.length > 0 ? morphology : null
  };
}

/**
 * Parse LXX CSV file
 */
function parseLXXCSV(csvPath, bookFilter = null, testMode = false) {
  console.log(`📖 Reading LXX CSV from ${csvPath}...`);
  
  const content = fs.readFileSync(csvPath, 'utf-8');
  const lines = content.split('\n');
  
  const verses = [];
  let lineNum = 0;
  
  for (const line of lines) {
    lineNum++;
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Parse tab-separated values: book_number\tchapter\tverse\ttext
    const parts = trimmed.split('\t');
    if (parts.length !== 4) {
      console.log(`⚠️  Skipping malformed line ${lineNum}`);
      continue;
    }
    
    const bookNum = parseInt(parts[0], 10);
    const chapter = parseInt(parts[1], 10);
    const verse = parseInt(parts[2], 10);
    const rawText = parts[3];
    
    // Map book number to code
    const bookCode = BOOK_MAP[bookNum];
    if (!bookCode) {
      console.log(`⚠️  Unknown book number: ${bookNum} at line ${lineNum}`);
      continue;
    }
    
    // Skip if filtering by book
    if (bookFilter && bookCode !== bookFilter) {
      continue;
    }
    
    // In test mode, only process Genesis chapter 1
    if (testMode && (bookNum !== 10 || chapter !== 1)) {
      continue;
    }
    
    // Parse the verse text
    const parsed = parseVerseText(rawText);
    
    verses.push({
      book: bookCode,
      chapter,
      verse,
      text: parsed.text,
      morphology: parsed.morphology
    });
  }
  
  console.log(`\n📊 Total verses extracted: ${verses.length}`);
  return verses;
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

  console.log(`✅ Total LXX verses in database: ${count}`);

  // Sample some verses
  const { data: samples, error: sampleError } = await supabase
    .from('verses')
    .select('book, chapter, verse, text')
    .eq('manuscript_id', manuscriptId)
    .in('book', ['GEN', 'PSA', 'ISA'])
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

  console.log('📖 Septuagint (LXX) Greek Old Testament Import Tool');
  console.log('='.repeat(70));

  if (testMode) {
    console.log('🧪 TEST MODE: Will import Genesis 1 only\n');
  } else if (bookFilter) {
    console.log(`📕 BOOK MODE: Will import ${bookFilter} only\n`);
  } else if (fullMode) {
    console.log('🌍 FULL MODE: Will import entire LXX (~28,000 verses)\n');
  } else {
    console.log('ℹ️  Usage:');
    console.log('  --test          Import Genesis 1 only');
    console.log('  --book GEN      Import one book');
    console.log('  --full          Import entire LXX\n');
    process.exit(0);
  }

  // Get manuscript ID
  const manuscriptId = await getManuscriptId();

  // Parse CSV
  const csvPath = path.join(__dirname, '../../manuscripts/septuagint/LXX-Rahlfs-1935/11_end-users_files/MyBible/Bibles/LXX_final_main.csv');
  const verses = parseLXXCSV(csvPath, bookFilter, testMode);

  if (verses.length === 0) {
    console.log('\n⚠️  No verses found. Check book code or CSV file.');
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
  console.log(`✅ Manuscript: Septuagint (LXX) Greek OT`);
  console.log(`✅ Total imported: ${imported} verses`);
  console.log(`❌ Failed: ${failed} verses`);
  console.log(`📚 Database now contains LXX Greek OT with morphology`);

  if (testMode) {
    console.log('\n⏭️  Next: Run with --full to import entire LXX');
  } else if (bookFilter) {
    console.log('\n⏭️  Next: Run with --full to import all books');
  } else {
    console.log('\n🎉 LXX import complete!');
    console.log('⏭️  Next steps:');
    console.log('1. Import Dead Sea Scrolls (select texts)');
    console.log('2. Import Peshitta Syriac NT');
    console.log('3. Update MANUSCRIPT_SOURCES_STATUS.md');
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
