/**
 * Complete All4Yah Database Inventory Report
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY
);

async function getFullInventory() {
  console.log('\n' + '='.repeat(70));
  console.log('📊 ALL4YAH COMPLETE DATABASE INVENTORY');
  console.log('='.repeat(70));

  // 1. Manuscripts
  console.log('\n📚 MANUSCRIPTS:\n');
  const { data: manuscripts } = await supabase
    .from('manuscripts')
    .select('*')
    .order('code');

  for (const ms of manuscripts) {
    const { count } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', ms.id);

    console.log(`${ms.code.padEnd(8)} | ${ms.name.padEnd(48)} | ${String(count).padStart(6)} | ${ms.language.padEnd(7)} | Tier ${ms.authenticity_tier || 'N/A'}`);
  }

  const { count: totalVerses } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  console.log(`\nTotal: ${manuscripts.length} manuscripts, ${totalVerses.toLocaleString()} verses`);

  // 2. Divine Name Mappings
  console.log('\n' + '='.repeat(70));
  console.log('✦ DIVINE NAME RESTORATION MAPPINGS:\n');

  const { data: mappings, error: mapError } = await supabase
    .from('name_mappings')
    .select('*')
    .order('original_text');

  if (mapError) {
    console.log('❌ Error fetching mappings:', mapError.message);
  } else if (mappings && mappings.length > 0) {
    for (const m of mappings) {
      const strongsInfo = m.strong_number || 'N/A';
      const lang = m.context_rules?.language || 'unknown';
      console.log(`${m.original_text.padEnd(12)} → ${m.restored_rendering.padEnd(12)} | ${lang.padEnd(8)} | ${strongsInfo}`);
    }
    console.log(`\nTotal mappings: ${mappings.length}`);
  } else {
    console.log('ℹ️  No name mappings found');
  }

  // 3. Theophoric Names (Dossier)
  console.log('\n' + '='.repeat(70));
  console.log('📜 THEOPHORIC NAMES (DOSSIER DATA):\n');

  const { data: theophoric, error: theoError, count: theoCount } = await supabase
    .from('theophoric_names')
    .select('*', { count: 'exact', head: true });

  if (theoError) {
    console.log('ℹ️  No theophoric_names table found (not yet created)');
  } else {
    console.log(`✅ theophoric_names table exists with ${theoCount} entries`);

    // Get sample
    const { data: sample } = await supabase
      .from('theophoric_names')
      .select('*')
      .limit(5);

    if (sample && sample.length > 0) {
      console.log('\nSample entries:');
      for (const entry of sample) {
        console.log(`  - ${entry.name || entry.original_name}: ${entry.meaning || entry.explanation || 'N/A'}`);
      }
    }
  }

  // 4. Additional Tables
  console.log('\n' + '='.repeat(70));
  console.log('📋 OTHER DATA TABLES:\n');

  // Check for lexicon data
  const { error: lexError, count: lexCount } = await supabase
    .from('strongs_lexicon')
    .select('*', { count: 'exact', head: true });

  if (!lexError) {
    console.log(`✅ strongs_lexicon: ${lexCount} entries`);
  }

  // Check for dossier table
  const { error: dossierError, count: dossierCount } = await supabase
    .from('dossier')
    .select('*', { count: 'exact', head: true });

  if (!dossierError) {
    console.log(`✅ dossier: ${dossierCount} entries`);
  }

  console.log('\n' + '='.repeat(70));
  console.log('✅ Inventory complete!');
  console.log('='.repeat(70) + '\n');
}

getFullInventory().catch(console.error);
