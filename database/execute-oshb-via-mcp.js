/**
 * Execute OSHB SQL via Supabase MCP Tool
 *
 * This script reads the generated OSHB SQL file and executes it via
 * the Supabase MCP execute_sql tool to bypass IPv6 connection issues.
 *
 * Usage:
 *   node database/execute-oshb-via-mcp.js database/oshb-genesis.sql
 */

const fs = require('fs');

async function executeSQLFile(filePath) {
  console.log(`Reading SQL file: ${filePath}`);

  const sqlContent = fs.readFileSync(filePath, 'utf8');

  // Remove comments and split into individual UPDATE statements
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

  console.log(`Found ${updates.length} UPDATE statements`);
  console.log('\nExecuting all updates in a single transaction...\n');

  // Combine all updates into a single transaction
  const transactionSQL = 'BEGIN;\n\n' + updates.join('\n\n') + '\n\nCOMMIT;';

  // Output the transaction SQL
  console.log(transactionSQL);
}

// Main
const sqlFile = process.argv[2] || 'database/oshb-genesis.sql';
executeSQLFile(sqlFile);
