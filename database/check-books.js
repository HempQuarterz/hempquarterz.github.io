require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkBooks() {
  // Get distinct books
  const { data, error } = await supabase
    .rpc('get_distinct_books', {});

  if (error) {
    // Fallback: Get all verses and count unique books manually
    const { data: allVerses, error: verseError } = await supabase
      .from('verses')
      .select('book');

    if (verseError) {
      console.error('Error:', verseError);
      return;
    }

    const uniqueBooks = [...new Set(allVerses.map(v => v.book))].sort();
    console.log('📚 Unique books:', uniqueBooks.length);
    console.log('Books:', uniqueBooks.join(', '));

    // Count verses per book
    const bookCounts = {};
    allVerses.forEach(v => {
      bookCounts[v.book] = (bookCounts[v.book] || 0) + 1;
    });

    console.log('\n📊 Verses per book:');
    Object.keys(bookCounts).sort().forEach(book => {
      console.log(`   ${book}: ${bookCounts[book]} verses`);
    });
  }
}

checkBooks();
