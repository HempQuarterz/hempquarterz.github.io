/**
 * Kebra Nagast Import Script
 * Imports E.A. Wallis Budge (1922) translation - Public Domain
 * Source: sacred-texts.com/afr/kn/
 *
 * Note: Kebra Nagast is prose with no verse divisions.
 * Each chapter is stored as a single verse (verse 1).
 *
 * Usage:
 *   node import-kebra-nagast.js --test    # Import first 5 chapters
 *   node import-kebra-nagast.js --full    # Import all 117 chapters
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getOrCreateManuscript() {
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'BUDGE')
    .single();

  if (existing) return existing.id;

  const { data: newMs, error } = await supabase
    .from('manuscripts')
    .insert({
      code: 'BUDGE',
      name: 'E.A. Wallis Budge Translations',
      language: 'english',
      date_range: '1922',
      license: 'Public Domain',
      description: 'Public domain English translations by E.A. Wallis Budge (1857-1934). Includes the Kebra Nagast (Glory of Kings).',
      source_url: 'https://sacred-texts.com/afr/kn/index.htm'
    })
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create BUDGE manuscript: ${error.message}`);
  console.log(`  Created BUDGE manuscript (ID: ${newMs.id})`);
  return newMs.id;
}

// Sacred-texts.com chapter mapping: kn009.htm = ch1, kn010.htm = ch2, etc.
// Actually: kn001.htm-kn008.htm are front matter, kn009.htm = Ch 1
// Through kn125.htm = Ch 117
function getChapterUrl(chapter) {
  const fileNum = chapter + 8; // ch1 = kn009, ch2 = kn010, etc.
  const padded = String(fileNum).padStart(3, '0');
  return `https://sacred-texts.com/afr/kn/kn${padded}.htm`;
}

async function fetchChapter(chapter) {
  const url = getChapterUrl(chapter);
  const resp = await fetch(url, {
    headers: {
      'User-Agent': 'All4Yah-Bible-Project/1.0 (academic research)',
      'Accept': 'text/html'
    }
  });

  if (!resp.ok) {
    throw new Error(`HTTP ${resp.status} for chapter ${chapter} (${url})`);
  }

  const html = await resp.text();

  // Extract the body text, removing navigation, headers, etc.
  // Sacred-texts pages have content between specific markers
  let text = html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<hr[^>]*>/gi, '|||BREAK|||')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<p>/gi, '\n\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'");

  // Split by breaks and find the main content (usually between first and last break)
  const sections = text.split('|||BREAK|||');
  // The main content is typically in the middle sections
  let content = sections.length > 2
    ? sections.slice(1, -1).join('\n')
    : sections.join('\n');

  // Clean up
  content = content
    .replace(/\n{3,}/g, '\n\n')
    .replace(/^\s+|\s+$/g, '')
    .split('\n')
    .filter(line => {
      const t = line.trim();
      // Remove navigation lines, page numbers, etc.
      if (t.length < 3) return false;
      if (t.match(/^p\.\s*\d+$/)) return false;
      if (t.match(/^Next:|^Previous:/)) return false;
      if (t.includes('sacred-texts.com')) return false;
      return true;
    })
    .join('\n')
    .trim();

  return content;
}

async function main() {
  const testMode = process.argv.includes('--test');
  const fullMode = process.argv.includes('--full');
  if (!testMode && !fullMode) { console.log('Usage: node import-kebra-nagast.js --test | --full'); process.exit(0); }

  const totalChapters = testMode ? 5 : 117;
  console.log(`Kebra Nagast Import (${testMode ? 'TEST - 5 chapters' : 'FULL - 117 chapters'})`);
  console.log('='.repeat(60));

  const manuscriptId = await getOrCreateManuscript();
  console.log(`  Manuscript ID: ${manuscriptId}`);

  let imported = 0, failed = 0, empty = 0;

  for (let ch = 1; ch <= totalChapters; ch++) {
    try {
      const text = await fetchChapter(ch);

      if (text.length < 20) {
        empty++;
        process.stdout.write(`\r  Progress: ${ch}/${totalChapters} (${imported} imported, ${empty} empty)`);
        continue;
      }

      // Store entire chapter as verse 1 (prose text, no verse divisions)
      const { error } = await supabase
        .from('verses')
        .upsert({
          book: 'KNG',
          chapter: ch,
          verse: 1,
          text: text,
          manuscript_id: manuscriptId,
          morphology: null
        }, { onConflict: 'manuscript_id,book,chapter,verse' });

      if (error) {
        console.error(`\n    Ch ${ch} insert error:`, error.message);
        failed++;
      } else {
        imported++;
      }

      process.stdout.write(`\r  Progress: ${ch}/${totalChapters} (${imported} imported, ${failed} failed)`);

      // Rate limit: 500ms between requests to be respectful
      await new Promise(r => setTimeout(r, 500));
    } catch (err) {
      console.error(`\n    Ch ${ch} error:`, err.message);
      failed++;
    }
  }

  console.log(`\n  Total: ${imported} chapters imported, ${failed} failed, ${empty} empty`);

  // Verify
  const { count } = await supabase.from('verses').select('*', { count: 'exact', head: true })
    .eq('manuscript_id', manuscriptId).eq('book', 'KNG');
  console.log(`  KNG entries in database: ${count}`);

  const { data: samples } = await supabase.from('verses').select('chapter, text')
    .eq('manuscript_id', manuscriptId).eq('book', 'KNG').order('chapter').limit(2);
  if (samples) {
    samples.forEach(v => console.log(`    KNG ${v.chapter}:1 - ${v.text.substring(0, 100)}...`));
  }

  console.log('\nKebra Nagast import complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
