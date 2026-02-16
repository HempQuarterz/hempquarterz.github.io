/**
 * useBreadcrumbs - Parse current route into breadcrumb segments
 * Returns array of { label, path } for navigation trail
 */

import { useLocation, useSearchParams } from 'react-router-dom';
import { useMemo } from 'react';

// Book code to name mapping (common books)
const BOOK_NAMES = {
  'GEN': 'Genesis', 'EXO': 'Exodus', 'LEV': 'Leviticus', 'NUM': 'Numbers',
  'DEU': 'Deuteronomy', 'JOS': 'Joshua', 'JDG': 'Judges', 'RUT': 'Ruth',
  '1SA': '1 Samuel', '2SA': '2 Samuel', '1KI': '1 Kings', '2KI': '2 Kings',
  '1CH': '1 Chronicles', '2CH': '2 Chronicles', 'EZR': 'Ezra', 'NEH': 'Nehemiah',
  'EST': 'Esther', 'JOB': 'Job', 'PSA': 'Psalms', 'PRO': 'Proverbs',
  'ECC': 'Ecclesiastes', 'SNG': 'Song of Songs', 'ISA': 'Isaiah', 'JER': 'Jeremiah',
  'LAM': 'Lamentations', 'EZK': 'Ezekiel', 'DAN': 'Daniel', 'HOS': 'Hosea',
  'JOL': 'Joel', 'AMO': 'Amos', 'OBA': 'Obadiah', 'JON': 'Jonah',
  'MIC': 'Micah', 'NAM': 'Nahum', 'HAB': 'Habakkuk', 'ZEP': 'Zephaniah',
  'HAG': 'Haggai', 'ZEC': 'Zechariah', 'MAL': 'Malachi',
  'MAT': 'Matthew', 'MRK': 'Mark', 'LUK': 'Luke', 'JHN': 'John',
  'ACT': 'Acts', 'ROM': 'Romans', '1CO': '1 Corinthians', '2CO': '2 Corinthians',
  'GAL': 'Galatians', 'EPH': 'Ephesians', 'PHP': 'Philippians', 'COL': 'Colossians',
  '1TH': '1 Thessalonians', '2TH': '2 Thessalonians', '1TI': '1 Timothy',
  '2TI': '2 Timothy', 'TIT': 'Titus', 'PHM': 'Philemon', 'HEB': 'Hebrews',
  'JAS': 'James', '1PE': '1 Peter', '2PE': '2 Peter', '1JN': '1 John',
  '2JN': '2 John', '3JN': '3 John', 'JUD': 'Jude', 'REV': 'Revelation'
};

// Route labels
const ROUTE_LABELS = {
  '/': 'Home',
  '/manuscripts': 'Manuscripts',
  '/lsi': 'Spirit AI',
  '/about': 'About',
  '/lsi/demo': 'Audio Demo'
};

export const useBreadcrumbs = () => {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const breadcrumbs = [];
    const pathSegments = location.pathname.split('/').filter(Boolean);

    // Always start with Home
    breadcrumbs.push({ label: 'Home', path: '/' });

    // Build path progressively
    let currentPath = '';

    for (const segment of pathSegments) {
      currentPath += `/${segment}`;

      // Check for known routes
      if (ROUTE_LABELS[currentPath]) {
        breadcrumbs.push({
          label: ROUTE_LABELS[currentPath],
          path: currentPath
        });
      }
    }

    // For manuscripts page, add book/chapter/verse from search params
    if (location.pathname.startsWith('/manuscripts')) {
      const book = searchParams.get('book');
      const chapter = searchParams.get('chapter');
      const verse = searchParams.get('verse');

      if (book) {
        const bookName = BOOK_NAMES[book] || book;
        breadcrumbs.push({
          label: bookName,
          path: `/manuscripts?book=${book}&chapter=1&verse=1`
        });

        if (chapter) {
          breadcrumbs.push({
            label: `Ch ${chapter}`,
            path: `/manuscripts?book=${book}&chapter=${chapter}&verse=1`
          });

          if (verse && verse !== '1') {
            breadcrumbs.push({
              label: `v${verse}`,
              path: `/manuscripts?book=${book}&chapter=${chapter}&verse=${verse}`
            });
          }
        }
      }
    }

    return breadcrumbs;
  }, [location.pathname, searchParams]);
};

export default useBreadcrumbs;
