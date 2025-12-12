/**
 * Import Word Alignment for Genesis 1:1 (WLC → WEB)
 *
 * Proof of Concept (POC) for interlinear word-by-word alignment.
 * This script manually creates alignment data for Genesis 1:1 to demonstrate
 * the interlinear alignment system before implementing automated alignment.
 *
 * Hebrew (WLC): בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
 * English (WEB): In the beginning, God created the heavens and the earth.
 *
 * Usage:
 *   node database/import-genesis1-1-alignment.js
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL || process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Manual word alignment data for Genesis 1:1
 *
 * Hebrew word order: בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ
 * Position:          0         1      2        3    4         5     6
 * Strong's:          H7225     H1254  H430     H853 H8064     H853  H776
 *
 * English word order: In the beginning , God created the heavens and the earth .
 * Position:           0  1   2         3 4   5       6   7       8   9   10    11
 *
 * Alignment mapping:
 * - Hebrew 0 (בְּרֵאשִׁית H7225) → English [0,1,2] "In the beginning"
 * - Hebrew 1 (בָּרָא H1254) → English [5] "created"
 * - Hebrew 2 (אֱלֹהִים H430) → English [4] "God"
 * - Hebrew 3 (אֵת H853) → NULL (untranslated particle)
 * - Hebrew 4 (הַשָּׁמַיִם H8064) → English [6,7] "the heavens"
 * - Hebrew 5 (וְאֵת H853) → English [8] "and"
 * - Hebrew 6 (הָאָרֶץ H776) → English [9,10] "the earth"
 */
const GENESIS_1_1_ALIGNMENTS = [
  {
    // Hebrew word 0: בְּרֵאשִׁית (bereshit - "in beginning")
    source_position: 0,
    source_word: 'בְּ/רֵאשִׁ֖ית',
    source_lemma: 'b/7225',
    source_strongs: 'H7225',
    source_morphology: { morph: 'HR/Ncfsa', gloss: 'in/beginning' },
    target_positions: [0, 1, 2], // "In the beginning"
    target_words: ['In', 'the', 'beginning'],
    alignment_type: 'one-to-many',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Hebrew preposition + noun → English prepositional phrase (3 words)'
  },
  {
    // Hebrew word 1: בָּרָא (bara - "created")
    source_position: 1,
    source_word: 'בָּרָ֣א',
    source_lemma: '1254 a',
    source_strongs: 'H1254',
    source_morphology: { morph: 'HVqp3ms', gloss: 'created' },
    target_positions: [5], // "created"
    target_words: ['created'],
    alignment_type: 'one-to-one',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Perfect match: Hebrew verb → English verb'
  },
  {
    // Hebrew word 2: אֱלֹהִים (elohim - "God")
    source_position: 2,
    source_word: 'אֱלֹהִ֑ים',
    source_lemma: '430',
    source_strongs: 'H430',
    source_morphology: { morph: 'HNcmpa', gloss: 'God' },
    target_positions: [4], // "God"
    target_words: ['God'],
    alignment_type: 'one-to-one',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Perfect match: Hebrew noun → English noun (divine name)'
  },
  {
    // Hebrew word 3: אֵת (et - accusative particle, untranslated)
    source_position: 3,
    source_word: 'אֵ֥ת',
    source_lemma: '853',
    source_strongs: 'H853',
    source_morphology: { morph: 'HTo', gloss: 'accusative marker' },
    target_positions: [], // NULL - no English equivalent
    target_words: [],
    alignment_type: 'null-alignment',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Hebrew accusative particle (אֵת) has no English equivalent - grammatical marker'
  },
  {
    // Hebrew word 4: הַשָּׁמַיִם (hashamayim - "the heavens")
    source_position: 4,
    source_word: 'הַ/שָּׁמַ֖יִם',
    source_lemma: 'd/8064',
    source_strongs: 'H8064',
    source_morphology: { morph: 'HTd/Ncmpa', gloss: 'the/heavens' },
    target_positions: [6, 7], // "the heavens"
    target_words: ['the', 'heavens'],
    alignment_type: 'one-to-many',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Hebrew article + noun → English article + noun (2 words)'
  },
  {
    // Hebrew word 5: וְאֵת (ve-et - "and" + accusative particle)
    source_position: 5,
    source_word: 'וְ/אֵ֥ת',
    source_lemma: 'c/853',
    source_strongs: 'H853',
    source_morphology: { morph: 'HC/To', gloss: 'and/accusative marker' },
    target_positions: [8], // "and"
    target_words: ['and'],
    alignment_type: 'one-to-one',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Hebrew conjunction (וְ) → English "and"; particle (אֵת) untranslated'
  },
  {
    // Hebrew word 6: הָאָרֶץ (ha-aretz - "the earth")
    source_position: 6,
    source_word: 'הָ/אָֽרֶץ',
    source_lemma: 'd/776',
    source_strongs: 'H776',
    source_morphology: { morph: 'HTd/Ncbsa', gloss: 'the/earth' },
    target_positions: [9, 10], // "the earth"
    target_words: ['the', 'earth'],
    alignment_type: 'one-to-many',
    alignment_method: 'manual',
    confidence: 1.0,
    notes: 'Hebrew article + noun → English article + noun (2 words)'
  }
];

/**
 * Get manuscript IDs
 */
async function getManuscriptIds() {
  const { data: wlc } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WLC')
    .single();

  const { data: web } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', 'WEB')
    .single();

  if (!wlc || !web) {
    throw new Error('Could not find WLC or WEB manuscripts');
  }

  return {
    wlc_id: wlc.id,
    web_id: web.id
  };
}

/**
 * Insert alignment records
 */
async function insertAlignments(wlc_id, web_id) {
  console.log('\n📝 Inserting word alignments for Genesis 1:1...\n');

  const alignments = GENESIS_1_1_ALIGNMENTS.map(align => {
    // For each target word position, create a separate alignment record
    // This handles one-to-many alignments properly
    if (align.target_positions.length === 0) {
      // Null alignment (no target word)
      return {
        source_manuscript_id: wlc_id,
        source_book: 'GEN',
        source_chapter: 1,
        source_verse: 1,
        source_word_position: align.source_position,
        source_word: align.source_word,
        source_lemma: align.source_lemma,
        source_strongs: align.source_strongs,
        source_morphology: align.source_morphology,
        target_manuscript_id: web_id,
        target_book: 'GEN',
        target_chapter: 1,
        target_verse: 1,
        target_word_position: null, // NULL for no target word
        target_word: '[NULL]',
        target_lemma: null,
        target_strongs: null,
        alignment_confidence: align.confidence,
        alignment_type: align.alignment_type,
        alignment_method: align.alignment_method,
        notes: align.notes
      };
    }

    // For one-to-many, store primary target word (first position)
    // Additional positions can be stored in notes or separate records
    return {
      source_manuscript_id: wlc_id,
      source_book: 'GEN',
      source_chapter: 1,
      source_verse: 1,
      source_word_position: align.source_position,
      source_word: align.source_word,
      source_lemma: align.source_lemma,
      source_strongs: align.source_strongs,
      source_morphology: align.source_morphology,
      target_manuscript_id: web_id,
      target_book: 'GEN',
      target_chapter: 1,
      target_verse: 1,
      target_word_position: align.target_positions[0],
      target_word: align.target_words.join(' '),
      target_lemma: null,
      target_strongs: align.source_strongs, // Copy from source for matching
      alignment_confidence: align.confidence,
      alignment_type: align.alignment_type,
      alignment_method: align.alignment_method,
      notes: `${align.notes}\nTarget words: ${align.target_words.join(' ')}\nPositions: ${align.target_positions.join(', ')}`
    };
  });

  // Insert all alignments
  const { data, error } = await supabase
    .from('word_alignments')
    .insert(alignments)
    .select();

  if (error) {
    console.error('❌ Error inserting alignments:', error.message);
    throw error;
  }

  console.log(`✅ Successfully inserted ${data.length} word alignments\n`);

  // Display alignment summary
  console.log('Alignment Summary:');
  console.log('─'.repeat(80));
  alignments.forEach((align, i) => {
    const hebrew = align.source_word;
    const english = align.target_word;
    const strongs = align.source_strongs;
    const type = align.alignment_type;

    console.log(`${i}. ${hebrew} (${strongs}) → "${english}" [${type}]`);
  });
  console.log('─'.repeat(80));

  return data;
}

/**
 * Verify alignments
 */
async function verifyAlignments(wlc_id, web_id) {
  console.log('\n🔍 Verifying alignments...\n');

  const { data, error } = await supabase
    .from('word_alignments')
    .select('*')
    .eq('source_manuscript_id', wlc_id)
    .eq('target_manuscript_id', web_id)
    .eq('source_book', 'GEN')
    .eq('source_chapter', 1)
    .eq('source_verse', 1)
    .order('source_word_position');

  if (error) {
    console.error('❌ Error verifying:', error.message);
    return;
  }

  console.log(`✅ Found ${data.length} alignment records`);
  console.log(`📊 Alignment types: ${[...new Set(data.map(d => d.alignment_type))].join(', ')}`);
  console.log(`🎯 Average confidence: ${(data.reduce((sum, d) => sum + parseFloat(d.alignment_confidence || 0), 0) / data.length).toFixed(2)}`);
}

/**
 * Main function
 */
async function main() {
  console.log('='.repeat(80));
  console.log('GENESIS 1:1 WORD ALIGNMENT IMPORT (POC)');
  console.log('='.repeat(80));
  console.log('\nHebrew (WLC):  בְּרֵאשִׁית בָּרָא אֱלֹהִים אֵת הַשָּׁמַיִם וְאֵת הָאָרֶץ');
  console.log('English (WEB): In the beginning, God created the heavens and the earth.\n');

  // Get manuscript IDs
  const { wlc_id, web_id } = await getManuscriptIds();
  console.log(`✅ WLC manuscript ID: ${wlc_id}`);
  console.log(`✅ WEB manuscript ID: ${web_id}`);

  // Insert alignments
  await insertAlignments(wlc_id, web_id);

  // Verify
  await verifyAlignments(wlc_id, web_id);

  console.log('\n' + '='.repeat(80));
  console.log('✅ POC COMPLETE - Genesis 1:1 alignment imported successfully!');
  console.log('='.repeat(80));
  console.log('\n💡 Next steps:');
  console.log('  1. Query alignments: SELECT * FROM word_alignments WHERE source_book = \'GEN\'');
  console.log('  2. Build React interlinear component to display these alignments');
  console.log('  3. Extend to automate alignment for remaining verses\n');
}

// Run import
main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
