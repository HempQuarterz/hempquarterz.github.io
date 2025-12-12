/**
 * Search API - Full-text search across verses and Strong's lexicon
 * Supports: verse text search, Strong's number search, lexicon keyword search
 */

import { supabase } from '../config/supabase';

/**
 * Search verses by text content using PostgreSQL full-text search
 * @param {string} query - Search query text
 * @param {Object} options - Search options
 * @param {string[]} options.manuscripts - Filter by manuscript codes (e.g., ['WLC', 'SBLGNT', 'WEB'])
 * @param {string[]} options.books - Filter by book codes (e.g., ['GEN', 'MAT'])
 * @param {number} options.limit - Maximum results to return (default: 50)
 * @returns {Promise<Array>} Array of verse objects with relevance scores
 */
export async function searchVerses(query, options = {}) {
  const {
    manuscripts = [],
    books = [],
    limit = 50
  } = options;

  try {
    // Build query with full-text search
    let queryBuilder = supabase
      .from('verses')
      .select(`
        id,
        manuscript_id,
        manuscripts!inner(code, name, language),
        book,
        chapter,
        verse,
        text,
        strong_numbers,
        ts_rank(to_tsvector('english', text), plainto_tsquery('english', '${query}')) as relevance
      `)
      .textSearch('text', query, {
        type: 'plain',
        config: 'english'
      })
      .order('relevance', { ascending: false })
      .limit(limit);

    // Filter by manuscripts if specified
    if (manuscripts.length > 0) {
      queryBuilder = queryBuilder.in('manuscripts.code', manuscripts);
    }

    // Filter by books if specified
    if (books.length > 0) {
      queryBuilder = queryBuilder.in('book', books);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Verse search error:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Failed to search verses:', err);
    throw err;
  }
}

/**
 * Search Strong's lexicon by number or keyword
 * @param {string} query - Strong's number (e.g., "H3068", "G2424") or keyword
 * @returns {Promise<Array>} Array of lexicon entries
 */
export async function searchStrongs(query) {
  try {
    // Determine if query is a Strong's number (starts with H or G followed by digits)
    const isStrongsNumber = /^[HG]\d+$/i.test(query.trim());

    let queryBuilder = supabase
      .from('lexicon')
      .select('*');

    if (isStrongsNumber) {
      // Exact match on Strong's number
      queryBuilder = queryBuilder.eq('strong_number', query.toUpperCase());
    } else {
      // Full-text search on original_word, transliteration, and definition
      queryBuilder = queryBuilder.textSearch(
        'original_word,transliteration,definition',
        query,
        {
          type: 'plain',
          config: 'english'
        }
      );
    }

    queryBuilder = queryBuilder.limit(20);

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Lexicon search error:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Failed to search lexicon:', err);
    throw err;
  }
}

/**
 * Get all verses containing a specific Strong's number
 * @param {string} strongsNumber - Strong's number (e.g., "H3068", "G2424")
 * @param {Object} options - Query options
 * @param {string[]} options.manuscripts - Filter by manuscript codes
 * @param {number} options.limit - Maximum results (default: 100)
 * @returns {Promise<Array>} Array of verses containing the Strong's number
 */
export async function getVersesByStrongs(strongsNumber, options = {}) {
  const {
    manuscripts = [],
    limit = 100
  } = options;

  try {
    let queryBuilder = supabase
      .from('verses')
      .select(`
        id,
        manuscript_id,
        manuscripts!inner(code, name, language),
        book,
        chapter,
        verse,
        text,
        strong_numbers
      `)
      .contains('strong_numbers', [strongsNumber.toUpperCase()])
      .limit(limit);

    // Filter by manuscripts if specified
    if (manuscripts.length > 0) {
      queryBuilder = queryBuilder.in('manuscripts.code', manuscripts);
    }

    const { data, error } = await queryBuilder;

    if (error) {
      console.error('Strong\'s verse search error:', error);
      throw error;
    }

    return data || [];
  } catch (err) {
    console.error('Failed to get verses by Strong\'s number:', err);
    throw err;
  }
}

/**
 * Get search suggestions based on partial query
 * @param {string} query - Partial search query
 * @param {string} type - Type of suggestions: 'books', 'strongs', 'keywords'
 * @returns {Promise<Array>} Array of suggestions
 */
export async function getSearchSuggestions(query, type = 'keywords') {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    if (type === 'books') {
      // Get book suggestions
      const { data, error } = await supabase
        .from('canonical_books')
        .select('code, long_name, short_name')
        .or(`code.ilike.%${query}%,long_name.ilike.%${query}%,short_name.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    }

    if (type === 'strongs') {
      // Get Strong's number suggestions
      const { data, error } = await supabase
        .from('lexicon')
        .select('strong_number, transliteration, definition')
        .or(`strong_number.ilike.${query}%,transliteration.ilike.%${query}%`)
        .limit(10);

      if (error) throw error;
      return data || [];
    }

    // Default: keyword suggestions from recent searches (if we add search history later)
    return [];
  } catch (err) {
    console.error('Failed to get search suggestions:', err);
    return [];
  }
}

/**
 * Perform combined search across verses and lexicon
 * @param {string} query - Search query
 * @param {Object} options - Search options
 * @returns {Promise<Object>} Object containing verse results and lexicon results
 */
export async function searchAll(query, options = {}) {
  try {
    const [verses, lexicon] = await Promise.all([
      searchVerses(query, { ...options, limit: options.versesLimit || 20 }),
      searchStrongs(query)
    ]);

    return {
      verses,
      lexicon,
      total: verses.length + lexicon.length
    };
  } catch (err) {
    console.error('Combined search failed:', err);
    throw err;
  }
}
