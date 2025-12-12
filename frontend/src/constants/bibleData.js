/**
 * Bible data constants
 * Contains book IDs and other Bible-related constants
 */

// Old Testament book IDs
export const OLD_TESTAMENT_BOOKS = [
  'GEN', 'EXO', 'LEV', 'NUM', 'DEU', // Pentateuch
  'JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', // Historical Books
  '1CH', '2CH', 'EZR', 'NEH', 'EST', // Historical Books (continued)
  'JOB', 'PSA', 'PRO', 'ECC', 'SNG', // Wisdom Literature
  'ISA', 'JER', 'LAM', 'EZK', 'DAN', // Major Prophets
  'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL' // Minor Prophets
];

// New Testament book IDs
export const NEW_TESTAMENT_BOOKS = [
  'MAT', 'MRK', 'LUK', 'JHN', // Gospels
  'ACT', // Acts
  'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', // Pauline Epistles
  '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', // Pauline Epistles (continued)
  'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', // General Epistles
  'REV' // Revelation
];

// All Bible book IDs
export const ALL_BIBLE_BOOKS = [
  ...OLD_TESTAMENT_BOOKS,
  ...NEW_TESTAMENT_BOOKS
];

// Testament types
export const TESTAMENT = {
  OLD: 'Old Testament',
  NEW: 'New Testament'
};

// Helper function to determine testament
export const getTestament = (bookId) => {
  if (OLD_TESTAMENT_BOOKS.includes(bookId)) {
    return TESTAMENT.OLD;
  }
  if (NEW_TESTAMENT_BOOKS.includes(bookId)) {
    return TESTAMENT.NEW;
  }
  return null;
};

// Loading states
export const LOADING_TYPES = {
  SPINNER: 'spinner',
  SKELETON: 'skeleton',
  DOTS: 'dots'
};
