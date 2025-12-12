/**
 * Apply Migration Directly using pg library
 * This bypasses Supabase client limitations to execute DDL statements
 */

require('dotenv').config();
const { Client } = require('pg');

const connectionString = `postgresql://postgres:${process.env.SUPABASE_SERVICE_ROLE_KEY}@db.txeeaekwhkdilycefczq.supabase.co:5432/postgres`;

async function main() {
  console.log('📋 Applying database migration using pg client...\n');

  const client = new Client({
    connectionString,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    console.log('🔗 Connecting to database...');
    await client.connect();
    console.log('✅ Connected!\n');

    // Check current schema
    console.log('🔍 Checking current schema...');
    const schemaCheck = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'verses' AND column_name = 'book'
    `);

    if (schemaCheck.rows.length > 0) {
      const current = schemaCheck.rows[0];
      console.log(`   Current: ${current.data_type}(${current.character_maximum_length})\n`);

      if (current.character_maximum_length >= 50) {
        console.log('✅ Column already expanded to VARCHAR(50) or larger!');
        await client.end();
        return;
      }
    }

    // Run migration
    console.log('🔄 Running migration...');
    console.log('   ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);\n');

    await client.query('ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);');
    console.log('✅ Migration executed successfully!\n');

    // Verify
    console.log('🔍 Verifying change...');
    const verify = await client.query(`
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_name = 'verses' AND column_name = 'book'
    `);

    if (verify.rows.length > 0) {
      const updated = verify.rows[0];
      console.log(`   New schema: ${updated.data_type}(${updated.character_maximum_length})\n`);
    }

    console.log('✅ Migration complete!');
    console.log('✅ Database ready for Dead Sea Scrolls import\n');

  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  } finally {
    await client.end();
  }
}

main().catch(err => {
  console.error('\n💥 Fatal error:', err);
  process.exit(1);
});
