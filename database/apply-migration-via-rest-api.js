/**
 * Apply Migration via Supabase REST API
 * Uses the Management API to execute SQL directly on the correct database
 */

require('dotenv').config();
const https = require('https');

const projectRef = 'txeeaekwhkdilycefczq';
const accessToken = process.env.SUPABASE_ACCESS_TOKEN || 'sbp_8bbda53f27cc215d9f5bb753c9d972035e917207';
const dbPassword = process.env.SUPABASE_DB_PASSWORD || '@4HQZgassmoe';

const migrationSQL = 'ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);';

async function executeSQL(sql) {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify({ query: sql });

    const options = {
      hostname: `${projectRef}.supabase.co`,
      port: 443,
      path: '/rest/v1/rpc/exec_sql',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'apikey': accessToken,
        'Authorization': `Bearer ${accessToken}`
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            resolve(data);
          }
        } else {
          reject(new Error(`HTTP ${res.statusCode}: ${data}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('📋 Applying Migration via Supabase REST API\n');
  console.log(`🔗 Project: ${projectRef}`);
  console.log(`📝 SQL: ${migrationSQL}\n`);

  try {
    console.log('🔄 Executing migration...');
    const result = await executeSQL(migrationSQL);
    console.log('✅ Migration result:', result);

    // Verify
    console.log('\n🔍 Verifying schema change...');
    const verifySQL = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'verses' AND column_name = 'book'
    `;
    const verifyResult = await executeSQL(verifySQL);
    console.log('✅ Schema verified:', verifyResult);

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n💡 The exec_sql RPC function may not exist.');
    console.error('You need to run the migration manually in Supabase Dashboard:');
    console.error('\n   1. Go to: https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql/new');
    console.error(`   2. Run: ${migrationSQL}\n`);
    process.exit(1);
  }
}

main();
