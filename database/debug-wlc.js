const fs = require('fs');
const path = require('path');

const wlcPath = path.join(__dirname, '../manuscripts/hebrew/wlc/oxlos-import/wlc.txt');
const content = fs.readFileSync(wlcPath, 'utf-8');
const lines = content.split('\n').filter(line => line.trim());

const BOOK_CODES = {
  'Gen': 'GEN'
};

const verses = {};

for (const line of lines) {
  const match = line.match(/^(\w+)\s+(\d+):(\d+)\.(\d+)\t(\d+)\t(.+)$/);
  if (!match) continue;

  const [, rawBook, chapter, verse] = match;
  const book = BOOK_CODES[rawBook] || rawBook.toUpperCase();
  const verseKey = `${book}.${chapter}.${verse}`;

  if (!verses[verseKey]) {
    verses[verseKey] = { book, chapter: parseInt(chapter), verse: parseInt(verse), count: 0 };
  }
  verses[verseKey].count++;
}

const genCh1 = Object.values(verses).filter(v => v.book === 'GEN' && v.chapter === 1);
console.log('Genesis 1 verses:', genCh1.length);
console.log('Sample verses:');
genCh1.slice(0, 5).forEach(v => console.log(`  ${v.book} ${v.chapter}:${v.verse} (${v.count} words)`));

// Check for any duplicates in final array
const finalVerses = Object.values(verses).filter(v => v.book === 'GEN' && v.chapter === 1);
const keys = finalVerses.map(v => `${v.book}.${v.chapter}.${v.verse}`);
const uniqueKeys = [...new Set(keys)];
console.log('\nUnique keys:', uniqueKeys.length);
console.log('Total verses:', finalVerses.length);
console.log('Has duplicates:', uniqueKeys.length !== finalVerses.length);
