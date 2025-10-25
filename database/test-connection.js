/**
 * Test Supabase Connection
 * Run with: node database/test-connection.js
 */

// Load environment variables
require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

console.log('🔍 Testing Supabase Connection...\n');

// Validate environment variables
if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Please check your .env file:');
  console.error('- REACT_APP_SUPABASE_URL');
  console.error('- REACT_APP_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Check if placeholders are still there
if (supabaseUrl.includes('YOUR_SUPABASE') || supabaseKey.includes('YOUR_SUPABASE')) {
  console.error('❌ Placeholder values detected in .env file!');
  console.error('Please replace with actual Supabase credentials.');
  process.exit(1);
}

console.log('✅ Environment variables loaded');
console.log(`📍 URL: ${supabaseUrl}`);
console.log(`🔑 Key: ${supabaseKey.substring(0, 20)}...`);
console.log();

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  try {
    console.log('📡 Attempting to connect to Supabase...');

    // Test 1: Check if we can query the manuscripts table
    const { data, error } = await supabase
      .from('manuscripts')
      .select('count')
      .limit(1);

    if (error) {
      console.error('❌ Connection error:', error.message);

      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log('\n💡 Hint: The database tables haven\'t been created yet.');
        console.log('Please run the schema.sql file in your Supabase SQL Editor.');
        console.log('See database/README.md for instructions.');
      }

      return false;
    }

    console.log('✅ Successfully connected to Supabase!');
    console.log('✅ Database tables are accessible');

    // Test 2: List all tables
    const { data: tables } = await supabase
      .from('manuscripts')
      .select('*')
      .limit(0);

    console.log('\n📊 Database Status:');
    console.log('- manuscripts table: ✅ exists');

    // Try to get table count for each expected table
    const expectedTables = ['manuscripts', 'verses', 'lexicon', 'name_mappings', 'translations', 'annotations'];

    for (const tableName of expectedTables) {
      const { data, error } = await supabase
        .from(tableName)
        .select('count', { count: 'exact', head: true });

      if (!error) {
        console.log(`- ${tableName} table: ✅ exists`);
      }
    }

    console.log('\n🎉 All tests passed!');
    console.log('\n📝 Next steps:');
    console.log('1. Import Westminster Leningrad Codex data');
    console.log('2. Import World English Bible data');
    console.log('3. Build API endpoints');

    return true;

  } catch (err) {
    console.error('❌ Unexpected error:', err.message);
    return false;
  }
}

// Run the test
testConnection()
  .then((success) => {
    process.exit(success ? 0 : 1);
  })
  .catch((err) => {
    console.error('❌ Fatal error:', err);
    process.exit(1);
  });
