/**
 * Batch Execute OSHB SQL via Supabase MCP Tool
 *
 * Reads the OSHB SQL file and outputs it in batches of 100 UPDATE statements
 * for efficient execution via Supabase MCP execute_sql tool.
 *
 * Usage:
 *   node database/batch-execute-oshb.js database/oshb-genesis.sql
 */

const fs = require('fs');

function batchSQLFile(filePath, batchSize = 100) {
  console.error(`Reading SQL file: ${filePath}`);

  const sqlContent = fs.readFileSync(filePath, 'utf8');

  // Extract all UPDATE statements
  const lines = sqlContent.split('\n');
  const updates = [];
  let currentUpdate = '';

  for (const line of lines) {
    // Skip comment lines
    if (line.trim().startsWith('--')) continue;

    // Skip BEGIN and COMMIT
    if (line.trim() === 'BEGIN;' || line.trim() === 'COMMIT;') continue;

    // Skip empty lines when not building an update
    if (!currentUpdate && !line.trim()) continue;

    currentUpdate += line + '\n';

    // When we hit a complete UPDATE statement (ends with ;)
    if (line.trim().endsWith(';') && currentUpdate.includes('UPDATE verses')) {
      updates.push(currentUpdate.trim());
      currentUpdate = '';
    }
  }

  console.error(`Found ${updates.length} UPDATE statements`);
  console.error(`Creating batches of ${batchSize} statements each`);

  // Create batches
  const batches = [];
  for (let i = 0; i < updates.length; i += batchSize) {
    const batch = updates.slice(i, i + batchSize);
    batches.push(batch);
  }

  console.error(`Created ${batches.length} batches\n`);

  // Output each batch as a complete transaction
  batches.forEach((batch, index) => {
    console.error(`\n-- Batch ${index + 1}/${batches.length} (${batch.length} statements)`);
    console.log(`-- Batch ${index + 1}/${batches.length}`);
    console.log('BEGIN;');
    console.log(batch.join('\n\n'));
    console.log('COMMIT;');
    console.log(''); // Extra newline between batches
  });

  console.error(`\n✅ Generated ${batches.length} SQL batches`);
}

// Main
const sqlFile = process.argv[2] || 'database/oshb-genesis.sql';
const batchSize = parseInt(process.argv[3]) || 100;
batchSQLFile(sqlFile, batchSize);
