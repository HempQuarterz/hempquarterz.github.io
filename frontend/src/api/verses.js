/**
 * All4Yah Verses API
 * Provides functions for retrieving Bible verses from Supabase
 */

import { supabase } from '../config/supabase';
import {
  restoreVerse,
  restoreParallelVerse,
  restoreChapter
} from './restoration';

/**
 * Get manuscript ID by code
 */
async function getManuscriptId(code) {
  const { data, error } = await supabase
    .from('manuscripts')
    .select('id')
    .eq('code', code)
    .single();

  if (error) {
    throw new Error(`Failed to get manuscript ${code}: ${error.message}`);
  }

  return data.id;
}

/**
 * Get a single verse by reference
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Object>} Verse data
 */
export async function getVerse(manuscript, book, chapter, verse) {
  try {
    const manuscriptId = await getManuscriptId(manuscript);

    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse, text, strong_numbers')
      .eq('manuscript_id', manuscriptId)
      .eq('book', book)
      .eq('chapter', chapter)
      .eq('verse', verse)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to get verse: ${error.message}`);
    }

    // Return null if verse doesn't exist for this manuscript
    if (!data) {
      return null;
    }

    return {
      manuscript,
      ...data
    };
  } catch (err) {
    console.error('getVerse error:', err);
    throw err;
  }
}

/**
 * Get parallel verses (Hebrew + English) by reference
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Object>} Object with hebrew and english properties
 */
export async function getParallelVerse(book, chapter, verse) {
  try {
    const [hebrew, english] = await Promise.all([
      getVerse('WLC', book, chapter, verse),
      getVerse('WEB', book, chapter, verse)
    ]);

    return {
      reference: `${book} ${chapter}:${verse}`,
      hebrew,
      english
    };
  } catch (err) {
    console.error('getParallelVerse error:', err);
    throw err;
  }
}

/**
 * Get all verses in a chapter
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @param {number} chapter - Chapter number
 * @returns {Promise<Array>} Array of verse objects
 */
export async function getChapter(manuscript, book, chapter) {
  try {
    const manuscriptId = await getManuscriptId(manuscript);

    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse, text, strong_numbers')
      .eq('manuscript_id', manuscriptId)
      .eq('book', book)
      .eq('chapter', chapter)
      .order('verse');

    if (error) {
      throw new Error(`Failed to get chapter: ${error.message}`);
    }

    return data.map(v => ({
      manuscript,
      ...v
    }));
  } catch (err) {
    console.error('getChapter error:', err);
    throw err;
  }
}

/**
 * Get parallel chapter (Hebrew + English)
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @param {number} chapter - Chapter number
 * @returns {Promise<Object>} Object with hebrew and english arrays
 */
export async function getParallelChapter(book, chapter) {
  try {
    const [hebrew, english] = await Promise.all([
      getChapter('WLC', book, chapter),
      getChapter('WEB', book, chapter)
    ]);

    return {
      reference: `${book} ${chapter}`,
      hebrew,
      english,
      verseCount: hebrew.length
    };
  } catch (err) {
    console.error('getParallelChapter error:', err);
    throw err;
  }
}

/**
 * Search verses by Strong's number
 * @param {string} strongNumber - Strong's number (e.g., 'H3068' for YHWH)
 * @param {number} limit - Maximum results to return (default: 10)
 * @returns {Promise<Array>} Array of verses containing the Strong's number
 */
export async function searchByStrongsNumber(strongNumber, limit = 10) {
  try {
    const manuscriptId = await getManuscriptId('WLC');

    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse, text, strong_numbers')
      .eq('manuscript_id', manuscriptId)
      .contains('strong_numbers', [strongNumber])
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search by Strong's number: ${error.message}`);
    }

    return data.map(v => ({
      manuscript: 'WLC',
      reference: `${v.book} ${v.chapter}:${v.verse}`,
      ...v
    }));
  } catch (err) {
    console.error('searchByStrongsNumber error:', err);
    throw err;
  }
}

/**
 * Search verses by text content
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} searchText - Text to search for
 * @param {number} limit - Maximum results to return (default: 10)
 * @returns {Promise<Array>} Array of matching verses
 */
export async function searchByText(manuscript, searchText, limit = 10) {
  try {
    const manuscriptId = await getManuscriptId(manuscript);

    const { data, error } = await supabase
      .from('verses')
      .select('book, chapter, verse, text, strong_numbers')
      .eq('manuscript_id', manuscriptId)
      .ilike('text', `%${searchText}%`)
      .limit(limit);

    if (error) {
      throw new Error(`Failed to search by text: ${error.message}`);
    }

    return data.map(v => ({
      manuscript,
      reference: `${v.book} ${v.chapter}:${v.verse}`,
      ...v
    }));
  } catch (err) {
    console.error('searchByText error:', err);
    throw err;
  }
}

/**
 * Get all verses containing the divine name (יהוה - YHWH)
 * @param {number} limit - Maximum results to return (default: 10)
 * @returns {Promise<Array>} Array of verses with YHWH
 */
export async function getYHWHVerses(limit = 10) {
  return searchByStrongsNumber('H3068', limit);
}

/**
 * Get verse count for a book
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @returns {Promise<number>} Number of verses in the book
 */
export async function getBookVerseCount(manuscript, book) {
  try {
    const manuscriptId = await getManuscriptId(manuscript);

    const { count, error } = await supabase
      .from('verses')
      .select('*', { count: 'exact', head: true })
      .eq('manuscript_id', manuscriptId)
      .eq('book', book);

    if (error) {
      throw new Error(`Failed to get verse count: ${error.message}`);
    }

    return count;
  } catch (err) {
    console.error('getBookVerseCount error:', err);
    throw err;
  }
}

/**
 * Get chapter count for a book
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @returns {Promise<number>} Number of chapters in the book
 */
export async function getBookChapterCount(manuscript, book) {
  try {
    const manuscriptId = await getManuscriptId(manuscript);

    const { data, error } = await supabase
      .from('verses')
      .select('chapter')
      .eq('manuscript_id', manuscriptId)
      .eq('book', book);

    if (error) {
      throw new Error(`Failed to get chapter count: ${error.message}`);
    }

    // Get unique chapters
    const chapters = [...new Set(data.map(v => v.chapter))];
    return chapters.length;
  } catch (err) {
    console.error('getBookChapterCount error:', err);
    throw err;
  }
}

/**
 * Get available chapters for a book
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @returns {Promise<Array<number>>} Array of chapter numbers available
 */
export async function getBookChapters(book) {
  try {
    const { data, error } = await supabase
      .from('verses')
      .select('chapter')
      .eq('book', book)
      .order('chapter');

    if (error) {
      throw new Error(`Failed to get chapters for ${book}: ${error.message}`);
    }

    // Get unique chapters and sort
    const chapters = [...new Set(data.map(v => v.chapter))].sort((a, b) => a - b);
    return chapters;
  } catch (err) {
    console.error('getBookChapters error:', err);
    throw err;
  }
}

/**
 * Get available verses for a chapter
 * @param {string} book - Book code (e.g., 'GEN', 'PSA')
 * @param {number} chapter - Chapter number
 * @returns {Promise<Array<number>>} Array of verse numbers available
 */
export async function getChapterVerses(book, chapter) {
  try {
    const { data, error } = await supabase
      .from('verses')
      .select('verse')
      .eq('book', book)
      .eq('chapter', chapter)
      .order('verse');

    if (error) {
      throw new Error(`Failed to get verses for ${book} ${chapter}: ${error.message}`);
    }

    // Get unique verses and sort
    const verses = [...new Set(data.map(v => v.verse))].sort((a, b) => a - b);
    return verses;
  } catch (err) {
    console.error('getChapterVerses error:', err);
    throw err;
  }
}

/**
 * Get all available books
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @returns {Promise<Array>} Array of book codes
 */
export async function getBooks(manuscript) {
  try {
    const manuscriptId = await getManuscriptId(manuscript);

    const { data, error } = await supabase
      .from('verses')
      .select('book');

    if (error) {
      throw new Error(`Failed to get books: ${error.message}`);
    }

    // Get unique books and sort
    const books = [...new Set(data.map(v => v.book))].sort();
    return books;
  } catch (err) {
    console.error('getBooks error:', err);
    throw err;
  }
}

/**
 * Get verse with divine name restoration
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Object>} Verse with restored divine names
 */
export async function getRestoredVerse(manuscript, book, chapter, verse) {
  try {
    const originalVerse = await getVerse(manuscript, book, chapter, verse);
    return restoreVerse(originalVerse);
  } catch (err) {
    console.error('getRestoredVerse error:', err);
    throw err;
  }
}

/**
 * Get parallel verse with divine name restoration
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Object>} Parallel verse with restored divine names
 */
export async function getRestoredParallelVerse(book, chapter, verse) {
  try {
    const parallelVerse = await getParallelVerse(book, chapter, verse);
    return restoreParallelVerse(parallelVerse);
  } catch (err) {
    console.error('getRestoredParallelVerse error:', err);
    throw err;
  }
}

/**
 * Get chapter with divine name restoration
 * @param {string} manuscript - Manuscript code ('WLC' or 'WEB')
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @returns {Promise<Array>} Chapter verses with restored divine names
 */
export async function getRestoredChapter(manuscript, book, chapter) {
  try {
    const originalChapter = await getChapter(manuscript, book, chapter);
    return restoreChapter(originalChapter);
  } catch (err) {
    console.error('getRestoredChapter error:', err);
    throw err;
  }
}

// Export all functions
export default {
  getVerse,
  getParallelVerse,
  getChapter,
  getParallelChapter,
  searchByStrongsNumber,
  searchByText,
  getYHWHVerses,
  getBookVerseCount,
  getBookChapterCount,
  getBookChapters,
  getChapterVerses,
  getBooks,
  getRestoredVerse,
  getRestoredParallelVerse,
  getRestoredChapter
};
