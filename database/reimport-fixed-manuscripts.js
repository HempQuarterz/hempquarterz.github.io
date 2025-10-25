/**
 * Re-import Codex Sinaiticus and Nestle 1904 with fixed scripts
 *
 * This script:
 * 1. Deletes existing verses for these manuscripts
 * 2. Re-runs the fixed import scripts
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const { spawn } = require('child_process');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runImportScript(scriptName, args = []) {
  return new Promise((resolve, reject) => {
    console.log(`\n${'='.repeat(70)}`);
    console.log(`🚀 Running: node database/${scriptName} ${args.join(' ')}`);
    console.log('='.repeat(70) + '\n');

    const child = spawn('node', [`database/${scriptName}`, ...args], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script exited with code ${code}`));
      }
    });

    child.on('error', reject);
  });
}

async function main() {
  console.log('\n' + '='.repeat(70));
  console.log('📋 RE-IMPORT FIXED MANUSCRIPTS');
  console.log('='.repeat(70));
  console.log('\nThis will:');
  console.log('1. Delete existing Codex Sinaiticus verses');
  console.log('2. Delete existing Nestle 1904 verses');
  console.log('3. Re-import both with fixed scripts\n');

  // Get manuscript IDs
  const { data: manuscripts } = await supabase
    .from('manuscripts')
    .select('id, code, name')
    .in('code', ['SIN', 'N1904']);

  if (!manuscripts || manuscripts.length === 0) {
    console.error('❌ Could not find SIN or N1904 manuscripts');
    process.exit(1);
  }

  const sinaiticus = manuscripts.find(m => m.code === 'SIN');
  const nestle1904 = manuscripts.find(m => m.code === 'N1904');

  if (!sinaiticus || !nestle1904) {
    console.error('❌ Missing manuscripts');
    process.exit(1);
  }

  // Delete existing verses
  console.log('\n🗑️  Deleting existing verses...\n');

  if (sinaiticus) {
    const { count: sinCount } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', sinaiticus.id);

    console.log(`   Codex Sinaiticus: ${sinCount} verses to delete`);

    const { error: sinError } = await supabase
      .from('verses')
      .delete()
      .eq('manuscript_id', sinaiticus.id);

    if (sinError) {
      console.error('❌ Error deleting Sinaiticus verses:', sinError.message);
      process.exit(1);
    }
  }

  if (nestle1904) {
    const { count: nestleCount } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', nestle1904.id);

    console.log(`   Nestle 1904: ${nestleCount} verses to delete`);

    const { error: nestleError } = await supabase
      .from('verses')
      .delete()
      .eq('manuscript_id', nestle1904.id);

    if (nestleError) {
      console.error('❌ Error deleting Nestle 1904 verses:', nestleError.message);
      process.exit(1);
    }
  }

  console.log('\n✅ Existing verses deleted\n');

  // Re-import with fixed scripts
  try {
    // Codex Sinaiticus
    await runImportScript('import-codex-sinaiticus.js', ['--full']);

    // Nestle 1904
    await runImportScript('import-nestle1904.js', ['--full']);

    console.log('\n' + '='.repeat(70));
    console.log('✅ RE-IMPORT COMPLETE!');
    console.log('='.repeat(70));
    console.log('\n📊 Run get-full-inventory.js to verify the updated counts\n');

  } catch (error) {
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

main().catch(console.error);
