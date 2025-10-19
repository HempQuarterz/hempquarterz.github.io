require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function debugCount() {
  // Get exact count
  const { count, error } = await supabase
    .from('verses')
    .select('*', { count: 'exact', head: true });

  console.log('Total verse count:', count);
  
  // Get sample of all books
  const { data: sample, error: sampleError } = await supabase
    .from('verses')
    .select('book, chapter, verse')
    .limit(100);

  if (sampleError) {
    console.error('Error:', sampleError);
    return;
  }

  const books = [...new Set(sample.map(v => v.book))];
  console.log('Books in first 100 rows:', books);

  // Try to get distinct book count
  const { data: allData, error: allError } = await supabase
    .from('verses')
    .select('book');

  if (allError) {
    console.error('Error fetching all:', allError);
    return;
  }

  console.log('Total rows fetched:', allData.length);
  const uniqueBooks = [...new Set(allData.map(v => v.book))].sort();
  console.log('Unique books found:', uniqueBooks.length);
  console.log('Book list:', uniqueBooks);
}

debugCount();
