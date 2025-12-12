/**
 * Apply Database Migration via Supabase REST API
 * Uses Supabase REST API's query endpoint to execute SQL
 *
 * Usage: node database/apply-migration-rest.js
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const https = require('https');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  process.exit(1);
}

console.log('📊 All4Yah Database Migration (REST API Method)');
console.log('='.repeat(60));

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const projectRef = supabaseUrl.match(/https:\/\/(.+?)\.supabase\.co/)[1];
    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve({ success: true, data });
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify({ sql_query: sql }));
    req.end();
  });
}

async function main() {
  const migrationPath = path.join(__dirname, 'migrations/001_add_provenance_and_theophoric_tables.sql');
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

  console.log('\n📄 Migration file loaded');
  console.log('\n⚠️  IMPORTANT NOTICE:');
  console.log('The Supabase REST API does not provide a direct SQL execution endpoint.');
  console.log('This script demonstrates the approach, but manual application is required.\n');
  console.log('='.repeat(60));
  console.log('✅ RECOMMENDED APPROACH: Use Supabase Dashboard');
  console.log('='.repeat(60));
  console.log('\n📋 STEP-BY-STEP INSTRUCTIONS:\n');
  console.log('1. Open your browser and navigate to:');
  console.log('   https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql\n');
  console.log('2. In the SQL Editor, create a new query\n');
  console.log('3. Copy the entire contents of this file:');
  console.log('   database/migrations/001_add_provenance_and_theophoric_tables.sql\n');
  console.log('4. Paste into the SQL Editor\n');
  console.log('5. Click "Run" button (or press Ctrl+Enter)\n');
  console.log('6. You should see success messages creating 4 tables:\n');
  console.log('   ✅ provenance_ledger');
  console.log('   ✅ theophoric_names');
  console.log('   ✅ verse_alignments');
  console.log('   ✅ textual_variants\n');
  console.log('='.repeat(60));
  console.log('📄 MIGRATION SQL PREVIEW (First 500 characters):');
  console.log('='.repeat(60));
  console.log(migrationSQL.substring(0, 500) + '...\n');
  console.log('='.repeat(60));
  console.log('⏭️  AFTER MIGRATION IS APPLIED:');
  console.log('='.repeat(60));
  console.log('\n1. Test lexicon import:');
  console.log('   node database/import-strongs-lexicon.js --test\n');
  console.log('2. If test passes, run full import:');
  console.log('   node database/import-strongs-lexicon.js --all\n');
  console.log('3. Verify tables created:');
  console.log('   node database/verify-migration.js\n');
}

main().catch(err => {
  console.error('Error:', err.message);
});
