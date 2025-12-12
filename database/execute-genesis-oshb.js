/**
 * Execute Genesis OSHB Morphology Import
 *
 * Uses direct PostgreSQL connection with IPv4-first DNS resolution.
 * Run with: node --dns-result-order=ipv4first database/execute-genesis-oshb.js
 */

const fs = require('fs');
const { Client } = require('pg');

// PostgreSQL client configuration
const client = new Client({
  host: 'db.txeeaekwhkdilycefczq.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: process.env.SUPABASE_DB_PASSWORD || '@4HQZgassmoe',
  ssl: { rejectUnauthorized: false },
  family: 4  // Force IPv4
});

async function executeSQL(sqlFilePath) {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('Executing Genesis OSHB Morphology Import');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Connect to database
    console.log('Connecting to Supabase...');
    await client.connect();
    console.log('✅ Connected successfully\n');

    // Read SQL file
    console.log(`Reading SQL file: ${sqlFilePath}`);
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Extract UPDATE statements
    const lines = sqlContent.split('\n');
    const updates = [];
    let currentUpdate = '';

    for (const line of lines) {
      if (line.trim().startsWith('--')) continue;
      if (line.trim() === 'BEGIN;' || line.trim() === 'COMMIT;') continue;
      if (!currentUpdate && !line.trim()) continue;

      currentUpdate += line + '\n';

      if (line.trim().endsWith(';') && currentUpdate.includes('UPDATE verses')) {
        updates.push(currentUpdate.trim());
        currentUpdate = '';
      }
    }

    console.log(`Found ${updates.length} UPDATE statements\n`);

    // Execute in a single transaction
    console.log('Beginning transaction...');
    await client.query('BEGIN');

    let successCount = 0;
    let errorCount = 0;

    for (let i = 0; i < updates.length; i++) {
      try {
        await client.query(updates[i]);
        successCount++;

        // Progress indicator
        if ((i + 1) % 100 === 0) {
          console.log(`  Progress: ${i + 1}/${updates.length} verses updated`);
        }
      } catch (error) {
        console.error(`  Error updating verse ${i + 1}:`, error.message);
        errorCount++;
      }
    }

    // Commit transaction
    console.log('\nCommitting transaction...');
    await client.query('COMMIT');

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('Import Complete');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`Verses updated:     ${successCount}`);
    console.log(`Errors:             ${errorCount}`);
    console.log('───────────────────────────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ Fatal error:', error.message);
    console.error('\nAttempting rollback...');
    try {
      await client.query('ROLLBACK');
      console.log('✅ Transaction rolled back');
    } catch (rollbackError) {
      console.error('❌ Rollback failed:', rollbackError.message);
    }
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Main
const sqlFile = process.argv[2] || '/home/hempquarterz/projects/All4Yah/database/oshb-genesis.sql';
executeSQL(sqlFile);
