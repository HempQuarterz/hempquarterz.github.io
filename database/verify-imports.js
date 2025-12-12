#!/usr/bin/env node

/**
 * Verify All4Yah Database Imports
 *
 * This script connects directly to the All4Yah Supabase database
 * and verifies all imported verses are accessible.
 *
 * Usage: node database/verify-imports.js
 */

const { createClient } = require('@supabase/supabase-js');

// All4Yah Supabase configuration
const SUPABASE_URL = 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function verifyImports() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║       All4Yah Database Import Verification                    ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  console.log(`📡 Database: ${SUPABASE_URL}`);
  console.log('🔑 Using service role key\n');

  try {
    // Get verse counts by manuscript
    console.log('📊 Fetching verse counts...\n');

    const { data: manuscripts, error: msError } = await supabase
      .from('manuscripts')
      .select('id, code, name, language')
      .in('code', ['WLC', 'SBLGNT', 'WEB']);

    if (msError) {
      console.error('❌ Error fetching manuscripts:', msError);
      throw msError;
    }

    console.log('✅ Found manuscripts:\n');

    const results = [];

    for (const ms of manuscripts) {
      const { count, error } = await supabase
        .from('verses')
        .select('*', { count: 'exact', head: true })
        .eq('manuscript_id', ms.id);

      if (error) {
        console.error(`❌ Error counting verses for ${ms.code}:`, error);
        continue;
      }

      results.push({
        code: ms.code,
        name: ms.name,
        language: ms.language,
        verses: count
      });

      console.log(`   ${ms.code.padEnd(10)} - ${ms.name}`);
      console.log(`   ${''.padEnd(10)}   Language: ${ms.language}`);
      console.log(`   ${''.padEnd(10)}   Verses: ${count.toLocaleString()}`);
      console.log();
    }

    // Get sample verses
    console.log('📖 Sample Verses (Genesis 1:1):\n');

    for (const ms of manuscripts) {
      const { data: verse, error } = await supabase
        .from('verses')
        .select('book, chapter, verse, text')
        .eq('manuscript_id', ms.id)
        .eq('book', 'GEN')
        .eq('chapter', 1)
        .eq('verse', 1)
        .single();

      if (error) {
        console.log(`   ${ms.code}: [Not found or error]`);
        continue;
      }

      const textPreview = verse.text.length > 80
        ? verse.text.substring(0, 80) + '...'
        : verse.text;

      console.log(`   ${ms.code} (${ms.language}):`);
      console.log(`   "${textPreview}"`);
      console.log();
    }

    // Summary
    console.log('╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    VERIFICATION SUMMARY                       ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    const totalVerses = results.reduce((sum, r) => sum + r.verses, 0);

    console.log('📊 Import Status:');
    results.forEach(r => {
      const status = r.verses > 0 ? '✅' : '❌';
      console.log(`   ${status} ${r.code.padEnd(10)} - ${r.verses.toLocaleString().padStart(6)} verses (${r.language})`);
    });

    console.log();
    console.log(`📚 Total Verses: ${totalVerses.toLocaleString()}`);
    console.log();

    if (totalVerses > 60000) {
      console.log('✅ ALL IMPORTS SUCCESSFUL!');
      console.log('   All three manuscripts imported correctly.');
      console.log('   Database is ready for use.');
    } else if (totalVerses > 0) {
      console.log('⚠️  PARTIAL IMPORT');
      console.log(`   Expected: ~60,306 verses`);
      console.log(`   Found: ${totalVerses.toLocaleString()} verses`);
    } else {
      console.log('❌ NO DATA FOUND');
      console.log('   Run import scripts to populate the database.');
    }

    console.log();

  } catch (error) {
    console.error('\n❌ Verification failed:', error.message);
    console.error(error);
    process.exit(1);
  }
}

verifyImports().catch(console.error);
