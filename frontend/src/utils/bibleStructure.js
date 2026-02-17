/**
 * Static Bible Data for Instant "Miller Column" Navigation
 * 66 Canonical + 20 Deuterocanonical/Apocrypha books
 * Matches canonical_books table tiers 1 & 2
 */

export const BIBLE_BOOKS = [
    // OLD TESTAMENT (39 books)
    { name: 'Genesis', chapters: 50, testament: 'Old', id: 'GEN' },
    { name: 'Exodus', chapters: 40, testament: 'Old', id: 'EXO' },
    { name: 'Leviticus', chapters: 27, testament: 'Old', id: 'LEV' },
    { name: 'Numbers', chapters: 36, testament: 'Old', id: 'NUM' },
    { name: 'Deuteronomy', chapters: 34, testament: 'Old', id: 'DEU' },
    { name: 'Joshua', chapters: 24, testament: 'Old', id: 'JOS' },
    { name: 'Judges', chapters: 21, testament: 'Old', id: 'JDG' },
    { name: 'Ruth', chapters: 4, testament: 'Old', id: 'RUT' },
    { name: '1 Samuel', chapters: 31, testament: 'Old', id: '1SA' },
    { name: '2 Samuel', chapters: 24, testament: 'Old', id: '2SA' },
    { name: '1 Kings', chapters: 22, testament: 'Old', id: '1KI' },
    { name: '2 Kings', chapters: 25, testament: 'Old', id: '2KI' },
    { name: '1 Chronicles', chapters: 29, testament: 'Old', id: '1CH' },
    { name: '2 Chronicles', chapters: 36, testament: 'Old', id: '2CH' },
    { name: 'Ezra', chapters: 10, testament: 'Old', id: 'EZR' },
    { name: 'Nehemiah', chapters: 13, testament: 'Old', id: 'NEH' },
    { name: 'Esther', chapters: 10, testament: 'Old', id: 'EST' },
    { name: 'Job', chapters: 42, testament: 'Old', id: 'JOB' },
    { name: 'Psalms', chapters: 150, testament: 'Old', id: 'PSA' },
    { name: 'Proverbs', chapters: 31, testament: 'Old', id: 'PRO' },
    { name: 'Ecclesiastes', chapters: 12, testament: 'Old', id: 'ECC' },
    { name: 'Song of Solomon', chapters: 8, testament: 'Old', id: 'SNG' },
    { name: 'Isaiah', chapters: 66, testament: 'Old', id: 'ISA' },
    { name: 'Jeremiah', chapters: 52, testament: 'Old', id: 'JER' },
    { name: 'Lamentations', chapters: 5, testament: 'Old', id: 'LAM' },
    { name: 'Ezekiel', chapters: 48, testament: 'Old', id: 'EZK' },
    { name: 'Daniel', chapters: 12, testament: 'Old', id: 'DAN' },
    { name: 'Hosea', chapters: 14, testament: 'Old', id: 'HOS' },
    { name: 'Joel', chapters: 3, testament: 'Old', id: 'JOL' },
    { name: 'Amos', chapters: 9, testament: 'Old', id: 'AMO' },
    { name: 'Obadiah', chapters: 1, testament: 'Old', id: 'OBA' },
    { name: 'Jonah', chapters: 4, testament: 'Old', id: 'JON' },
    { name: 'Micah', chapters: 7, testament: 'Old', id: 'MIC' },
    { name: 'Nahum', chapters: 3, testament: 'Old', id: 'NAM' },
    { name: 'Habakkuk', chapters: 3, testament: 'Old', id: 'HAB' },
    { name: 'Zephaniah', chapters: 3, testament: 'Old', id: 'ZEP' },
    { name: 'Haggai', chapters: 2, testament: 'Old', id: 'HAG' },
    { name: 'Zechariah', chapters: 14, testament: 'Old', id: 'ZEC' },
    { name: 'Malachi', chapters: 4, testament: 'Old', id: 'MAL' },

    // NEW TESTAMENT (27 books)
    { name: 'Matthew', chapters: 28, testament: 'New', id: 'MAT' },
    { name: 'Mark', chapters: 16, testament: 'New', id: 'MRK' },
    { name: 'Luke', chapters: 24, testament: 'New', id: 'LUK' },
    { name: 'John', chapters: 21, testament: 'New', id: 'JHN' },
    { name: 'Acts', chapters: 28, testament: 'New', id: 'ACT' },
    { name: 'Romans', chapters: 16, testament: 'New', id: 'ROM' },
    { name: '1 Corinthians', chapters: 16, testament: 'New', id: '1CO' },
    { name: '2 Corinthians', chapters: 13, testament: 'New', id: '2CO' },
    { name: 'Galatians', chapters: 6, testament: 'New', id: 'GAL' },
    { name: 'Ephesians', chapters: 6, testament: 'New', id: 'EPH' },
    { name: 'Philippians', chapters: 4, testament: 'New', id: 'PHP' },
    { name: 'Colossians', chapters: 4, testament: 'New', id: 'COL' },
    { name: '1 Thessalonians', chapters: 5, testament: 'New', id: '1TH' },
    { name: '2 Thessalonians', chapters: 3, testament: 'New', id: '2TH' },
    { name: '1 Timothy', chapters: 6, testament: 'New', id: '1TI' },
    { name: '2 Timothy', chapters: 4, testament: 'New', id: '2TI' },
    { name: 'Titus', chapters: 3, testament: 'New', id: 'TIT' },
    { name: 'Philemon', chapters: 1, testament: 'New', id: 'PHM' },
    { name: 'Hebrews', chapters: 13, testament: 'New', id: 'HEB' },
    { name: 'James', chapters: 5, testament: 'New', id: 'JAS' },
    { name: '1 Peter', chapters: 5, testament: 'New', id: '1PE' },
    { name: '2 Peter', chapters: 3, testament: 'New', id: '2PE' },
    { name: '1 John', chapters: 5, testament: 'New', id: '1JN' },
    { name: '2 John', chapters: 1, testament: 'New', id: '2JN' },
    { name: '3 John', chapters: 1, testament: 'New', id: '3JN' },
    { name: 'Jude', chapters: 1, testament: 'New', id: 'JUD' },
    { name: 'Revelation', chapters: 22, testament: 'New', id: 'REV' },

    // DEUTEROCANONICAL / APOCRYPHA (20 books, Tier 2)
    { name: 'Tobit', chapters: 14, testament: 'Deuterocanon', id: 'TOB' },
    { name: 'Judith', chapters: 16, testament: 'Deuterocanon', id: 'JDT' },
    { name: 'Esther (Greek)', chapters: 16, testament: 'Deuterocanon', id: 'ESG' },
    { name: 'Wisdom of Solomon', chapters: 19, testament: 'Deuterocanon', id: 'WIS' },
    { name: 'Sirach', chapters: 51, testament: 'Deuterocanon', id: 'SIR' },
    { name: 'Baruch', chapters: 5, testament: 'Deuterocanon', id: 'BAR' },
    { name: 'Letter of Jeremiah', chapters: 1, testament: 'Deuterocanon', id: 'LJE' },
    { name: 'Prayer of Azariah', chapters: 1, testament: 'Deuterocanon', id: 'S3Y' },
    { name: 'Susanna', chapters: 1, testament: 'Deuterocanon', id: 'SUS' },
    { name: 'Bel and the Dragon', chapters: 1, testament: 'Deuterocanon', id: 'BEL' },
    { name: '1 Maccabees', chapters: 16, testament: 'Deuterocanon', id: '1MA' },
    { name: '2 Maccabees', chapters: 15, testament: 'Deuterocanon', id: '2MA' },
    { name: '3 Maccabees', chapters: 7, testament: 'Deuterocanon', id: '3MA' },
    { name: '4 Maccabees', chapters: 18, testament: 'Deuterocanon', id: '4MA' },
    { name: 'Psalm 151', chapters: 1, testament: 'Deuterocanon', id: 'PS2' },
    { name: 'Prayer of Manasseh', chapters: 1, testament: 'Deuterocanon', id: 'MAN' },
    { name: '1 Esdras', chapters: 9, testament: 'Deuterocanon', id: '1ES' },
    { name: '2 Esdras', chapters: 16, testament: 'Deuterocanon', id: '2ES' },
    { name: '1 Enoch', chapters: 108, testament: 'Deuterocanon', id: 'ENO' },
    { name: 'Jubilees', chapters: 50, testament: 'Deuterocanon', id: 'JUB' }
];

/**
 * Get the adjacent chapter (prev or next) with book boundary handling.
 * Returns { book, chapter } or null if at absolute boundary.
 */
export function getAdjacentChapter(bookId, chapter, direction) {
  const bookIndex = BIBLE_BOOKS.findIndex(b => b.id === bookId);
  if (bookIndex === -1) return null;

  if (direction === 'prev') {
    if (chapter > 1) return { book: bookId, chapter: chapter - 1 };
    if (bookIndex > 0) {
      const prevBook = BIBLE_BOOKS[bookIndex - 1];
      return { book: prevBook.id, chapter: prevBook.chapters };
    }
    return null;
  } else {
    const currentBook = BIBLE_BOOKS[bookIndex];
    if (chapter < currentBook.chapters) return { book: bookId, chapter: chapter + 1 };
    if (bookIndex < BIBLE_BOOKS.length - 1) {
      return { book: BIBLE_BOOKS[bookIndex + 1].id, chapter: 1 };
    }
    return null;
  }
}
