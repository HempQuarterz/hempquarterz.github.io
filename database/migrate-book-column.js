#!/usr/bin/env node

/**
 * Migration: Expand verses.book column from VARCHAR(3) to VARCHAR(50)
 * Required for: Dead Sea Scrolls import (scroll names like "4Q223_224", "Arugleviticus")
 *
 * This migration uses a workaround since DDL via Supabase JS client is not available.
 * It creates a manual SQL file that you can execute in the Supabase Dashboard.
 */

const fs = require('fs');
const path = require('path');

const migrationSQL = `
-- Migration: Expand book column for Dead Sea Scrolls
-- Date: ${new Date().toISOString().split('T')[0]}
-- Reason: DSS scroll names exceed VARCHAR(3) limit

-- Expand book column to support longer manuscript names
ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);

-- Verify the migration
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'verses'
AND column_name = 'book';
`;

const outputPath = path.join(__dirname, 'migration-book-column.sql');

console.log('📝 Generating Migration SQL File...\n');
console.log('='.repeat(70));

fs.writeFileSync(outputPath, migrationSQL);

console.log('✅ Migration SQL file created successfully!');
console.log(`📁 Location: ${outputPath}\n`);

console.log('📋 MANUAL MIGRATION INSTRUCTIONS:\n');
console.log('1. Open Supabase SQL Editor:');
console.log('   https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql/new\n');

console.log('2. Copy the SQL from the file created above, or use this SQL:');
console.log('   ' + '─'.repeat(68));
console.log(migrationSQL.trim());
console.log('   ' + '─'.repeat(68));

console.log('\n3. Paste into the SQL Editor and click "Run"\n');

console.log('4. After successful migration, import Dead Sea Scrolls:');
console.log('   cd hempquarterz.github.io');
console.log('   node database/import-dead-sea-scrolls.js --full\n');

console.log('✨ This will complete the "Authentic 10" milestone!');
console.log('   Total verses after DSS import: ~220,066 across 10 manuscripts\n');

console.log('='.repeat(70));
