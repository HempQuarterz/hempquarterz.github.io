#!/usr/bin/env node

/**
 * All4Yah Database Inventory Script
 *
 * This script provides a comprehensive inventory of the Supabase database,
 * showing all Bible-related tables and their current state.
 *
 * Usage: node database/get-full-inventory.js
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getFullInventory() {
  console.log('\n╔════════════════════════════════════════════════════════════════╗');
  console.log('║         All4Yah Database Inventory Report                     ║');
  console.log('╚════════════════════════════════════════════════════════════════╝\n');

  try {
    // Get manuscript count and details
    const { data: manuscripts, error: manuscriptsError } = await supabase
      .from('manuscripts')
      .select('*');

    if (manuscriptsError) {
      console.error('❌ Error fetching manuscripts:', manuscriptsError.message);
    } else {
      console.log('📜 MANUSCRIPTS TABLE');
      console.log('─────────────────────────────────────────────────────────────────');
      console.log(`Total manuscripts: ${manuscripts.length}`);

      if (manuscripts.length > 0) {
        console.log('\nManuscript Details:');
        manuscripts.forEach((ms, idx) => {
          console.log(`\n  ${idx + 1}. ${ms.name} (${ms.code})`);
          console.log(`     Language: ${ms.language}`);
          console.log(`     Date Range: ${ms.date_range || 'N/A'}`);
          console.log(`     License: ${ms.license || 'N/A'}`);
        });
      } else {
        console.log('⚠️  No manuscripts found in database');
      }
      console.log();
    }

    // Get verse count
    const { count: verseCount, error: versesError } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true });

    if (versesError) {
      console.error('❌ Error fetching verse count:', versesError.message);
    } else {
      console.log('📖 VERSES TABLE');
      console.log('─────────────────────────────────────────────────────────────────');
      console.log(`Total verses: ${verseCount || 0}`);

      if (verseCount && verseCount > 0) {
        // Get verse breakdown by manuscript
        const { data: verseStats, error: statsError } = await supabase
          .rpc('get_verse_stats_by_manuscript');

        if (!statsError && verseStats) {
          console.log('\nVerse breakdown by manuscript:');
          verseStats.forEach(stat => {
            console.log(`  - ${stat.manuscript_code}: ${stat.verse_count} verses`);
          });
        } else {
          // Fallback: manual count
          const { data: versesGrouped, error: groupError } = await supabase
            .from('verses')
            .select('manuscript_id');

          if (!groupError && versesGrouped) {
            const counts = versesGrouped.reduce((acc, v) => {
              acc[v.manuscript_id] = (acc[v.manuscript_id] || 0) + 1;
              return acc;
            }, {});

            console.log('\nVerse breakdown by manuscript_id:');
            Object.entries(counts).forEach(([id, count]) => {
              console.log(`  - Manuscript ID ${id}: ${count} verses`);
            });
          }
        }
      } else {
        console.log('⚠️  No verses found in database');
      }
      console.log();
    }

    // Check authentic_manuscripts table
    const { data: authManuscripts, error: authError } = await supabase
      .from('authentic_manuscripts')
      .select('*');

    if (authError) {
      console.error('❌ Error fetching authentic manuscripts:', authError.message);
    } else {
      console.log('✨ AUTHENTIC MANUSCRIPTS TABLE');
      console.log('─────────────────────────────────────────────────────────────────');
      console.log(`Total authentic manuscripts: ${authManuscripts.length}`);

      if (authManuscripts.length > 0) {
        console.log('\nAuthentic Manuscript Details:');
        authManuscripts.forEach((ms, idx) => {
          console.log(`\n  ${idx + 1}. ${ms.name}`);
          console.log(`     Description: ${ms.description || 'N/A'}`);
          console.log(`     Status: ${ms.status || 'N/A'}`);
        });
      } else {
        console.log('⚠️  No authentic manuscripts found in database');
      }
      console.log();
    }

    // Summary
    console.log('\n╔════════════════════════════════════════════════════════════════╗');
    console.log('║                    INVENTORY SUMMARY                          ║');
    console.log('╚════════════════════════════════════════════════════════════════╝\n');

    console.log(`📊 Database Status:`);
    console.log(`   - Manuscripts: ${manuscripts?.length || 0}`);
    console.log(`   - Verses: ${verseCount || 0}`);
    console.log(`   - Authentic Manuscripts: ${authManuscripts?.length || 0}`);

    if (!manuscripts?.length && !verseCount && !authManuscripts?.length) {
      console.log('\n⚠️  DATABASE IS EMPTY');
      console.log('\n📋 Next Steps:');
      console.log('   1. Import manuscript metadata (WLC, SBLGNT, WEB, etc.)');
      console.log('   2. Import verse data for each manuscript');
      console.log('   3. Set up name restoration mappings');
      console.log('   4. Verify data integrity');
      console.log('\n💡 Suggested Commands:');
      console.log('   - node database/import-manuscripts.js');
      console.log('   - node database/import-wlc.js (Westminster Leningrad Codex)');
      console.log('   - node database/import-sblgnt.js (SBL Greek New Testament)');
      console.log('   - node database/import-web.js (World English Bible)');
    } else {
      console.log('\n✅ Database contains data');
      console.log('\n💡 Available Commands:');
      console.log('   - node database/verify-data.js (verify data integrity)');
      console.log('   - node database/export-data.js (export data)');
      console.log('   - node database/test-restoration.js (test name restoration)');
    }

    console.log('\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

// Run the inventory
getFullInventory().catch(console.error);
