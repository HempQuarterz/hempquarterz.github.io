# EOTC Canon Import Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Import 5 Ethiopian Orthodox texts (1 Enoch, Jubilees, Ascension of Isaiah, Meqabyan 1-3, Kebra Nagast) into the All4Yah Supabase database with Ge'ez font support.

**Architecture:** Each text gets its own import script following the existing `database/import-template.js` pattern. Phase A texts use structured JSON/API sources. Phase B texts require HTML scraping. A new `CHARLES` manuscript entry groups the R.H. Charles public domain translations. All scripts run from the `database/` directory with `--test` and `--full` flags.

**Tech Stack:** Node.js, @supabase/supabase-js, node-fetch (for API/HTTP), Supabase PostgreSQL

**Spec:** `docs/superpowers/specs/2026-03-14-eotc-import-design.md`

---

## Chunk 1: Database Setup + 1 Enoch Import

### Task 1: Create CHARLES manuscript and add Ascension of Isaiah to canonical_books

**Files:**
- Create: `database/setup-eotc-entries.js`

- [ ] **Step 1: Write the setup script**

```javascript
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function main() {
  console.log('Setting up EOTC database entries...\n');

  // 1. Create CHARLES manuscript
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'CHARLES')
    .single();

  let manuscriptId;
  if (existing) {
    manuscriptId = existing.id;
    console.log(`Found existing CHARLES manuscript (ID: ${manuscriptId})`);
  } else {
    const { data: newMs, error } = await supabase
      .from('manuscripts')
      .insert({
        code: 'CHARLES',
        name: 'R.H. Charles Pseudepigrapha Translations',
        language: 'english',
        date_range: '1900-1917',
        license: 'Public Domain',
        description: 'Public domain English translations of pseudepigraphal and deuterocanonical texts by R.H. Charles (1855-1931). Includes 1 Enoch, Jubilees, and Ascension of Isaiah.',
        authenticity_tier: 2,
        tier_notes: 'Tier 2 (FILTERED): English translations from Ge\'ez/Hebrew/Greek originals. Scholarly but interpretive layer present.',
        source_url: 'https://www.gutenberg.org/ebooks/77935'
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to create manuscript: ${error.message}`);
    manuscriptId = newMs.id;
    console.log(`Created CHARLES manuscript (ID: ${manuscriptId})`);
  }

  // 2. Add Ascension of Isaiah to canonical_books
  const { data: asiExists } = await supabase
    .from('canonical_books')
    .select('id')
    .eq('book_code', 'ASI')
    .single();

  if (asiExists) {
    console.log(`Ascension of Isaiah already exists (ID: ${asiExists.id})`);
  } else {
    // Get max order_number for placement
    const { data: maxOrder } = await supabase
      .from('canonical_books')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1)
      .single();

    const nextOrder = (maxOrder?.order_number || 90) + 1;

    const { data: newBook, error } = await supabase
      .from('canonical_books')
      .insert({
        book_code: 'ASI',
        book_name: 'Ascension of Isaiah',
        testament: 'Pseudepigrapha / Ethiopian Canon',
        canonical_tier: 2,
        canonical_status: 'deuterocanonical',
        era: '2nd century BCE - 2nd century CE (composite)',
        language_origin: 'Hebrew/Greek (composite, preserved in Ge\'ez)',
        provenance_confidence: 0.7,
        manuscript_sources: ['CHARLES'],
        notes: 'Composite text: Martyrdom of Isaiah (ch 1-5), Testament of Hezekiah (ch 3:13-4:22), Vision of Isaiah (ch 6-11). Complete text survives only in Ge\'ez. R.H. Charles translation (1900).',
        order_number: nextOrder
      })
      .select('id')
      .single();

    if (error) throw new Error(`Failed to add ASI: ${error.message}`);
    console.log(`Added Ascension of Isaiah (ID: ${newBook.id}, order: ${nextOrder})`);
  }

  // 3. Split Meqabyan into 3 books if needed
  const meqCodes = ['1MQ', '2MQ', '3MQ'];
  const meqNames = ['1 Meqabyan', '2 Meqabyan', '3 Meqabyan'];
  const meqChapters = [36, 21, 10];

  for (let i = 0; i < 3; i++) {
    const { data: exists } = await supabase
      .from('canonical_books')
      .select('id')
      .eq('book_code', meqCodes[i])
      .single();

    if (exists) {
      console.log(`${meqNames[i]} already exists (ID: ${exists.id})`);
      continue;
    }

    const { data: maxOrd } = await supabase
      .from('canonical_books')
      .select('order_number')
      .order('order_number', { ascending: false })
      .limit(1)
      .single();

    const { error } = await supabase
      .from('canonical_books')
      .insert({
        book_code: meqCodes[i],
        book_name: meqNames[i],
        testament: 'Ethiopian Canon',
        canonical_tier: 2,
        canonical_status: 'deuterocanonical',
        era: 'Unknown (preserved in Ge\'ez)',
        language_origin: 'Ge\'ez (unique to Ethiopia)',
        provenance_confidence: 0.6,
        notes: `Ethiopian Maccabees Book ${i + 1} (${meqChapters[i]} chapters). Distinct from Greek Maccabees. Wikisource CC-BY-SA translation.`,
        order_number: (maxOrd?.order_number || 90) + 1
      });

    if (error) console.error(`Failed to add ${meqCodes[i]}: ${error.message}`);
    else console.log(`Added ${meqNames[i]}`);
  }

  console.log('\nSetup complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
```

- [ ] **Step 2: Run the setup script**

Run: `cd database && node setup-eotc-entries.js`
Expected: Creates CHARLES manuscript, ASI book entry, and 1MQ/2MQ/3MQ book entries

- [ ] **Step 3: Verify entries exist**

Run: `cd database && node -e "require('dotenv').config({path:'../.env'});const s=require('@supabase/supabase-js').createClient(process.env.REACT_APP_SUPABASE_URL,process.env.SUPABASE_SERVICE_ROLE_KEY);(async()=>{const{data:m}=await s.from('manuscripts').select('id,code,name').eq('code','CHARLES');console.log('Manuscript:',m);const{data:b}=await s.from('canonical_books').select('id,book_code,book_name').in('book_code',['ASI','1MQ','2MQ','3MQ']);console.log('Books:',b)})()"`
Expected: Shows CHARLES manuscript and 4 new book entries

- [ ] **Step 4: Commit**

```bash
git add database/setup-eotc-entries.js
git commit -m "feat: add CHARLES manuscript and EOTC book entries (ASI, 1MQ, 2MQ, 3MQ)"
```

---

### Task 2: Download scrollmapper data for 1 Enoch and Ascension of Isaiah

**Files:**
- Create: `manuscripts/ethiopian/` directory
- Download: `1-enoch.json` and Ascension of Isaiah data

- [ ] **Step 1: Create directory and download 1 Enoch JSON**

Run:
```bash
mkdir -p manuscripts/ethiopian
curl -L "https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/1-enoch/1-enoch.json" -o manuscripts/ethiopian/1-enoch.json
```
Expected: JSON file with `books[0].chapters[]` containing 108 chapters

- [ ] **Step 2: Verify JSON structure**

Run: `cd database && node -e "const d=require('../manuscripts/ethiopian/1-enoch.json');console.log('Chapters:',d.books[0].chapters.length);let total=0;d.books[0].chapters.forEach(c=>total+=c.verses.length);console.log('Total verses:',total);console.log('Sample:',JSON.stringify(d.books[0].chapters[0].verses[0]))"`
Expected: 108 chapters, ~1048 verses, sample verse with `chapter`, `verse`, `text` fields

- [ ] **Step 3: Download Ascension of Isaiah data**

Run:
```bash
curl -L "https://raw.githubusercontent.com/scrollmapper/bible_databases_deuterocanonical/master/sources/en/ascension-of-isaiah/ascension-of-isaiah.json" -o manuscripts/ethiopian/ascension-of-isaiah.json 2>&1 || echo "Direct JSON not found, will scrape from HTML"
```
Expected: JSON file or fallback message (repo structure may differ)

- [ ] **Step 4: Commit downloaded data**

```bash
git add manuscripts/ethiopian/
git commit -m "data: download 1 Enoch and Ascension of Isaiah source data"
```

---

### Task 3: Import 1 Enoch (1,048 verses)

**Files:**
- Create: `database/import-enoch.js`

- [ ] **Step 1: Write the import script**

```javascript
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
      ...v,
      manuscript_id: manuscriptId,
      morphology: null
    }));

    const { error } = await supabase
      .from('verses')
      .upsert(batch, { onConflict: 'manuscript_id,book,chapter,verse' });

    if (error) {
      console.error(`Batch ${i} failed:`, error.message);
      failed += batch.length;
    } else {
      imported += batch.length;
      process.stdout.write(`\r  Progress: ${imported}/${verses.length} (${Math.round(imported/verses.length*100)}%)`);
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
    samples.forEach(v => console.log(`    ${v.book} ${v.chapter}:${v.verse} — ${v.text.substring(0, 80)}...`));
  }
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');

  if (!testMode && !fullMode) {
    console.log('Usage: node import-enoch.js --test | --full');
    process.exit(0);
  }

  console.log(`1 Enoch Import (${testMode ? 'TEST — 5 chapters' : 'FULL — 108 chapters'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getManuscriptId();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  const dataPath = path.join(__dirname, '../manuscripts/ethiopian/1-enoch.json');
  if (!fs.existsSync(dataPath)) {
    console.error('Data file not found:', dataPath);
    process.exit(1);
  }

  const verses = parseEnochJSON(dataPath, testMode);
  console.log(`  Parsed ${verses.length} verses from ${testMode ? '5' : '108'} chapters`);

  await importVerses(manuscriptId, verses);
  await verify(manuscriptId);

  console.log('\n1 Enoch import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
```

- [ ] **Step 2: Run test import (5 chapters)**

Run: `cd database && node import-enoch.js --test`
Expected: Imports ~50-60 verses from chapters 1-5, shows samples

- [ ] **Step 3: Run full import (108 chapters)**

Run: `cd database && node import-enoch.js --full`
Expected: Imports ~1,048 verses, verification shows correct count

- [ ] **Step 4: Commit**

```bash
git add database/import-enoch.js
git commit -m "feat: import 1 Enoch (R.H. Charles, 1,048 verses, 108 chapters)"
```

---

## Chunk 2: Jubilees + Ascension of Isaiah Import

### Task 4: Import Jubilees from Sefaria API (50 chapters)

**Files:**
- Create: `database/import-jubilees.js`

- [ ] **Step 1: Write the import script**

```javascript
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

async function fetchChapter(chapter) {
  const url = `https://www.sefaria.org/api/v3/texts/Book_of_Jubilees.${chapter}?version=english|The%20Book%20of%20Jubilees,%20trans.%20R.%20H.%20Charles.%20London%20%5B1917%5D`;
  const resp = await fetch(url);
  if (!resp.ok) throw new Error(`Sefaria API error for chapter ${chapter}: ${resp.status}`);
  const data = await resp.json();

  // Sefaria returns versions array with text array
  const versions = data.versions || [];
  const engVersion = versions.find(v => v.language === 'en') || versions[0];
  if (!engVersion || !engVersion.text) return [];

  const textArray = Array.isArray(engVersion.text) ? engVersion.text : [engVersion.text];
  return textArray.map((text, i) => ({
    book: 'JUB',
    chapter: chapter,
    verse: i + 1,
    text: typeof text === 'string' ? text.replace(/<[^>]+>/g, '').trim() : ''
  })).filter(v => v.text.length > 0);
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');
  if (!testMode && !fullMode) { console.log('Usage: node import-jubilees.js --test | --full'); process.exit(0); }

  const totalChapters = testMode ? 3 : 50;
  console.log(`Jubilees Import (${testMode ? 'TEST — 3 chapters' : 'FULL — 50 chapters'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getManuscriptId();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  let allVerses = [];
  for (let ch = 1; ch <= totalChapters; ch++) {
    try {
      const verses = await fetchChapter(ch);
      allVerses = allVerses.concat(verses);
      process.stdout.write(`\r  Fetching: chapter ${ch}/${totalChapters} (${allVerses.length} verses so far)`);
      // Rate limit: 100ms between requests
      await new Promise(r => setTimeout(r, 100));
    } catch (err) {
      console.error(`\n  Warning: chapter ${ch} failed: ${err.message}`);
    }
  }

  console.log(`\n  Total verses fetched: ${allVerses.length}`);

  // Batch insert
  const BATCH_SIZE = 100;
  let imported = 0;
  for (let i = 0; i < allVerses.length; i += BATCH_SIZE) {
    const batch = allVerses.slice(i, i + BATCH_SIZE).map(v => ({
      ...v, manuscript_id: manuscriptId, morphology: null
    }));
    const { error } = await supabase.from('verses').upsert(batch, { onConflict: 'manuscript_id,book,chapter,verse' });
    if (error) console.error(`  Batch error:`, error.message);
    else imported += batch.length;
  }

  console.log(`  Imported: ${imported} verses`);

  // Verify
  const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId).eq('book', 'JUB');
  console.log(`  JUB verses in database: ${count}`);

  const { data: samples } = await supabase.from('verses').select('chapter, verse, text')
    .eq('manuscript_id', manuscriptId).eq('book', 'JUB').order('chapter').order('verse').limit(3);
  if (samples) samples.forEach(v => console.log(`    JUB ${v.chapter}:${v.verse} — ${v.text.substring(0, 80)}...`));

  console.log('\nJubilees import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
```

- [ ] **Step 2: Run test import (3 chapters)**

Run: `cd database && node import-jubilees.js --test`
Expected: Fetches 3 chapters from Sefaria API, imports verses, shows samples

- [ ] **Step 3: Run full import (50 chapters)**

Run: `cd database && node import-jubilees.js --full`
Expected: Fetches all 50 chapters, imports all verses

- [ ] **Step 4: Commit**

```bash
git add database/import-jubilees.js
git commit -m "feat: import Jubilees from Sefaria API (R.H. Charles, 50 chapters)"
```

---

### Task 5: Import Ascension of Isaiah

**Files:**
- Create: `database/import-ascension-isaiah.js`

- [ ] **Step 1: Check if scrollmapper has structured JSON for Ascension of Isaiah**

Run:
```bash
ls manuscripts/ethiopian/ascension-of-isaiah.json 2>/dev/null && echo "JSON exists" || echo "Need to scrape from HTML"
```

If JSON exists, use the same pattern as 1 Enoch. If not, scrape from earlychristianwritings.com.

- [ ] **Step 2: Write the import script**

The script should handle both JSON source (if downloaded) and HTML scraping fallback from `https://www.earlychristianwritings.com/text/ascension.html`. Follow the same pattern as `import-enoch.js` — parse source, batch insert with book code `ASI`, verify.

- [ ] **Step 3: Run test import**

Run: `cd database && node import-ascension-isaiah.js --test`
Expected: Imports first 3 chapters (~60 verses)

- [ ] **Step 4: Run full import**

Run: `cd database && node import-ascension-isaiah.js --full`
Expected: Imports all 11 chapters (~296 verses)

- [ ] **Step 5: Commit**

```bash
git add database/import-ascension-isaiah.js
git commit -m "feat: import Ascension of Isaiah (R.H. Charles, ~296 verses, 11 chapters)"
```

---

## Chunk 3: Phase B — Meqabyan, Kebra Nagast, Ge'ez Font

### Task 6: Import Meqabyan 1-3 from Wikisource (CC-BY-SA)

**Files:**
- Create: `database/import-meqabyan.js`

- [ ] **Step 1: Write the import script**

Script should fetch from Wikisource URLs:
- `https://en.wikisource.org/wiki/Translation:1_Meqabyan`
- `https://en.wikisource.org/wiki/Translation:2_Meqabyan`
- `https://en.wikisource.org/wiki/Translation:3_Meqabyan`

Create a new manuscript entry `WIKISOURCE` (language: english, license: CC-BY-SA) for these texts, since they are not R.H. Charles translations. Parse HTML to extract chapter/verse structure. Use book codes `1MQ`, `2MQ`, `3MQ`.

- [ ] **Step 2: Test with 1 Meqabyan chapter 1 only**

Run: `cd database && node import-meqabyan.js --test`
Expected: Imports first chapter of 1 Meqabyan

- [ ] **Step 3: Full import of all 3 books**

Run: `cd database && node import-meqabyan.js --full`
Expected: Imports all 67 chapters across 3 books

- [ ] **Step 4: Commit**

```bash
git add database/import-meqabyan.js
git commit -m "feat: import Meqabyan 1-3 from Wikisource (CC-BY-SA, 67 chapters)"
```

---

### Task 7: Import Kebra Nagast from Sacred-Texts.com

**Files:**
- Create: `database/import-kebra-nagast.js`

- [ ] **Step 1: Write the import script**

Script should fetch 117 chapters from `https://sacred-texts.com/afr/kn/kn{NNN}.htm` (kn009.htm through kn125.htm). Since this is prose with no verse divisions, store each chapter as a single verse (verse 1). Use existing `KNG` book code. Create a `BUDGE` manuscript entry (language: english, license: Public Domain, E.A. Wallis Budge 1922).

- [ ] **Step 2: Test with first 5 chapters**

Run: `cd database && node import-kebra-nagast.js --test`
Expected: Imports 5 chapters as single-verse entries

- [ ] **Step 3: Full import**

Run: `cd database && node import-kebra-nagast.js --full`
Expected: Imports all 117 chapters

- [ ] **Step 4: Commit**

```bash
git add database/import-kebra-nagast.js
git commit -m "feat: import Kebra Nagast (Budge 1922, 117 chapters, public domain)"
```

---

### Task 8: Add Ge'ez font support to frontend

**Files:**
- Modify: `frontend/src/styles/modern.css`
- Modify: `frontend/src/styles/manuscripts.css`

- [ ] **Step 1: Add Noto Serif Ethiopic font import**

In `frontend/src/styles/modern.css`, add alongside existing font imports:
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+Ethiopic:wght@400;700&display=swap');
```

- [ ] **Step 2: Add .geez-text CSS class**

In `frontend/src/styles/manuscripts.css`:
```css
.geez-text,
.manuscript-ethiopic {
  font-family: 'Noto Serif Ethiopic', serif;
  font-size: 1.1em;
  line-height: 1.6;
  direction: ltr;
}
```

- [ ] **Step 3: Verify build succeeds**

Run: `cd frontend && npm run build 2>&1 | tail -5`
Expected: Build completes without new errors

- [ ] **Step 4: Commit**

```bash
git add frontend/src/styles/modern.css frontend/src/styles/manuscripts.css
git commit -m "feat: add Noto Serif Ethiopic font for Ge'ez manuscript display"
```

---

## Chunk 4: Verification + Documentation

### Task 9: Create verification script

**Files:**
- Create: `database/verify-eotc-import.js`

- [ ] **Step 1: Write verification script**

Script should query verse counts for ENO, JUB, ASI, 1MQ, 2MQ, 3MQ, KNG and compare against expected values. Show total EOTC verses added.

- [ ] **Step 2: Run verification**

Run: `cd database && node verify-eotc-import.js`
Expected: All book counts match expectations, total EOTC verses reported

- [ ] **Step 3: Commit**

```bash
git add database/verify-eotc-import.js
git commit -m "feat: add EOTC import verification script"
```

---

### Task 10: Update documentation

**Files:**
- Modify: `docs/MANUSCRIPT_STATUS_REPORT.md`
- Modify: `README.md`

- [ ] **Step 1: Update manuscript status report with new texts**

Add entries for 1 Enoch, Jubilees, Ascension of Isaiah, Meqabyan 1-3, Kebra Nagast with verse counts, sources, and license info.

- [ ] **Step 2: Update README statistics**

Update the verse count and manuscript count in the project README.

- [ ] **Step 3: Commit**

```bash
git add docs/MANUSCRIPT_STATUS_REPORT.md README.md
git commit -m "docs: update manuscript status and README with EOTC import statistics"
```

---

## Execution Order

Phase A (Tasks 1-5): Can start immediately — structured data, public domain
Phase B (Tasks 6-8): After Phase A — requires HTML scraping, more parsing work
Phase C (Ge'ez text import): Deferred to future session — requires source verification

Tasks 1 must run first (creates database entries). Tasks 2-3 are sequential. Tasks 4-5 are independent of 2-3 and can run in parallel. Tasks 6-7 are independent. Task 8 is independent. Tasks 9-10 run last.
