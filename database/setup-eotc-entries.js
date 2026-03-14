/**
 * EOTC Database Setup Script
 * Creates CHARLES manuscript entry and adds missing canonical book entries
 * for Ascension of Isaiah and Meqabyan 1-3
 *
 * Usage: node setup-eotc-entries.js
 */
require('dotenv').config({ path: '../.env' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function getOrCreateManuscript(code, details) {
  const { data: existing } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', code)
    .single();

  if (existing) {
    console.log(`  Found existing ${code} manuscript (ID: ${existing.id})`);
    return existing.id;
  }

  const { data: newMs, error } = await supabase
    .from('manuscripts')
    .insert(details)
    .select('id')
    .single();

  if (error) throw new Error(`Failed to create ${code} manuscript: ${error.message}`);
  console.log(`  Created ${code} manuscript (ID: ${newMs.id})`);
  return newMs.id;
}

async function getNextOrderNumber() {
  const { data } = await supabase
    .from('canonical_books')
    .select('order_number')
    .order('order_number', { ascending: false })
    .limit(1)
    .single();
  return (data?.order_number || 90) + 1;
}

async function addBookIfMissing(bookCode, details) {
  const { data: existing } = await supabase
    .from('canonical_books')
    .select('id')
    .eq('book_code', bookCode)
    .single();

  if (existing) {
    console.log(`  ${bookCode} already exists (ID: ${existing.id})`);
    return;
  }

  const orderNum = await getNextOrderNumber();
  const { error } = await supabase
    .from('canonical_books')
    .insert({ ...details, book_code: bookCode, order_number: orderNum });

  if (error) throw new Error(`Failed to add ${bookCode}: ${error.message}`);
  console.log(`  Added ${bookCode}: ${details.book_name} (order: ${orderNum})`);
}

async function main() {
  console.log('EOTC Database Setup');
  console.log('='.repeat(60));

  // 1. Create CHARLES manuscript
  console.log('\n1. CHARLES manuscript (R.H. Charles translations):');
  await getOrCreateManuscript('CHARLES', {
    code: 'CHARLES',
    name: 'R.H. Charles Pseudepigrapha Translations',
    language: 'english',
    date_range: '1900-1917',
    license: 'Public Domain',
    description: 'Public domain English translations of pseudepigraphal and deuterocanonical texts by R.H. Charles (1855-1931). Includes 1 Enoch, Jubilees, and Ascension of Isaiah.',
    source_url: 'https://www.gutenberg.org/ebooks/77935'
  });

  // 2. Add Ascension of Isaiah
  console.log('\n2. Ascension of Isaiah (canonical_books):');
  await addBookIfMissing('ASI', {
    book_name: 'Ascension of Isaiah',
    testament: 'Pseudepigrapha / Ethiopian Canon',
    canonical_tier: 2,
    canonical_status: 'deuterocanonical',
    era: '2nd century BCE - 2nd century CE (composite)',
    language_origin: 'Hebrew/Greek (composite, preserved in Ge\'ez)',
    provenance_confidence: 0.7,
    manuscript_sources: ['CHARLES'],
    notes: 'Composite text: Martyrdom of Isaiah (ch 1-5), Testament of Hezekiah (ch 3:13-4:22), Vision of Isaiah (ch 6-11). Complete text survives only in Ge\'ez. R.H. Charles translation (1900).'
  });

  // 3. Split Meqabyan into 3 books
  console.log('\n3. Meqabyan 1-3 (canonical_books):');
  const meqBooks = [
    { code: '1MQ', name: '1 Meqabyan', chapters: 36 },
    { code: '2MQ', name: '2 Meqabyan', chapters: 21 },
    { code: '3MQ', name: '3 Meqabyan', chapters: 10 }
  ];

  for (const m of meqBooks) {
    await addBookIfMissing(m.code, {
      book_name: m.name,
      testament: 'Ethiopian Canon',
      canonical_tier: 2,
      canonical_status: 'deuterocanonical',
      era: 'Unknown (preserved in Ge\'ez)',
      language_origin: 'Ge\'ez (unique to Ethiopia)',
      provenance_confidence: 0.6,
      notes: `Ethiopian Maccabees Book ${m.code[0]} (${m.chapters} chapters). Distinct from Greek Maccabees. Wikisource CC-BY-SA translation.`
    });
  }

  console.log('\nSetup complete.');
}

main().catch(err => { console.error('Fatal:', err); process.exit(1); });
