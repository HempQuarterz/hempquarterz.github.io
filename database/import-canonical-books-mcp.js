#!/usr/bin/env node
/**
 * Import Canonical Books via Supabase MCP
 * All4Yah Project - Phase 1 Completion
 *
 * Uses Supabase execute_sql to populate canonical_books table
 */

const fs = require('fs');
const path = require('path');

// Load books data
const tierMapPath = path.join(__dirname, 'books_tier_map.json');
const data = JSON.parse(fs.readFileSync(tierMapPath, 'utf8'));
const books = data.books || [];

console.log('================================================================================');
console.log('Canonical Books Import - All4Yah Phase 1 Completion (via MCP)');
console.log('================================================================================\n');
console.log(`Loaded ${books.length} book definitions from books_tier_map.json\n`);

// Helper to escape SQL strings
function escapeSql(str) {
  if (!str) return null;
  return str.replace(/'/g, "''");
}

// Helper to format array for SQL
function formatArray(arr) {
  if (!arr || arr.length === 0) return 'ARRAY[]::TEXT[]';
  const escaped = arr.map(s => `'${escapeSql(s)}'`);
  return `ARRAY[${escaped.join(',')}]`;
}

// Generate INSERT statements
const inserts = books.map(book => {
  const code = book.code;
  const name = escapeSql(book.name);
  const testament = book.testament || 'OT';
  const tier = book.tier || 1;
  const status = book.status || 'canonical';
  const era = book.era ? `'${escapeSql(book.era)}'` : 'NULL';
  const lang_origin = book.language_origin ? `'${escapeSql(book.language_origin)}'` : 'NULL';
  const lang_extant = book.language_extant ? `'${escapeSql(book.language_extant)}'` : lang_origin;
  const confidence = book.provenance_confidence || 1.0;
  const ms_sources = formatArray(book.manuscript_sources);
  const canons = formatArray(book.included_in_canons);
  const quoted = book.quoted_in_nt ? `'${escapeSql(book.quoted_in_nt)}'` : 'NULL';
  const divine_count = book.divine_name_occurrences || 0;
  const divine_restorations = formatArray(book.divine_name_restorations);
  const notes = book.notes ? `'${escapeSql(book.notes)}'` : 'NULL';

  return `('${code}', '${name}', '${testament}', ${tier}, '${status}', ${era}, ${lang_origin}, ${lang_extant}, ${confidence}, ${ms_sources}, ${canons}, ${quoted}, ${divine_count}, ${divine_restorations}, ${notes})`;
}).join(',\n');

// Complete SQL statement
const sql = `
BEGIN;

-- Clear existing data
DELETE FROM canonical_books;

-- Insert all books
INSERT INTO canonical_books (
  book_code, book_name, testament, canonical_tier, canonical_status,
  era, language_origin, language_extant, provenance_confidence,
  manuscript_sources, included_in_canons, quoted_in_nt,
  divine_name_occurrences, divine_name_restorations, notes
) VALUES
${inserts};

-- Verify
SELECT canonical_tier, COUNT(*) as count
FROM canonical_books
GROUP BY canonical_tier
ORDER BY canonical_tier;

COMMIT;
`;

// Output SQL for manual execution via Supabase MCP
console.log('SQL Statement for Supabase MCP execute_sql:\n');
console.log('=' .repeat(80));
console.log(sql);
console.log('=' .repeat(80));

console.log(`\n✅ Generated SQL for ${books.length} books`);
console.log('\nTo execute via Claude Code MCP:');
console.log('  mcp__supabase__execute_sql with the above SQL\n');
