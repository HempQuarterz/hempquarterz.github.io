/**
 * All4Yah Canonical Books API
 * Provides functions for retrieving canonical book metadata from Supabase
 */

import { supabase } from '../config/supabase';

/**
 * Get all canonical books with metadata
 * @param {Object} options - Query options
 * @param {Array<number>} options.tiers - Filter by canonical tiers (e.g., [1, 2])
 * @param {string} options.orderBy - Sort field (default: 'canonical_tier')
 * @returns {Promise<Array>} Array of canonical book objects
 */
export async function getCanonicalBooks(options = {}) {
  try {
    const {
      tiers = null,
      orderBy = 'canonical_tier'
    } = options;

    let query = supabase
      .from('canonical_books')
      .select('*');

    // Filter by canonical tiers if specified
    if (tiers && tiers.length > 0) {
      query = query.in('canonical_tier', tiers);
    }

    // Order by specified field
    query = query.order(orderBy, { ascending: true });

    // Secondary sort by biblical order (order_number) for books in same tier
    if (orderBy !== 'order_number') {
      query = query.order('order_number', { ascending: true });
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get canonical books: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('getCanonicalBooks error:', err);
    throw err;
  }
}

/**
 * Get a single canonical book by code
 * @param {string} bookCode - Book code (e.g., 'GEN', 'MAT', 'WIS')
 * @returns {Promise<Object>} Canonical book object
 */
export async function getCanonicalBook(bookCode) {
  try {
    const { data, error } = await supabase
      .from('canonical_books')
      .select('*')
      .eq('book_code', bookCode)
      .single();

    if (error) {
      throw new Error(`Failed to get canonical book ${bookCode}: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('getCanonicalBook error:', err);
    throw err;
  }
}

/**
 * Get book counts by canonical tier
 * @returns {Promise<Object>} Object with tier counts (e.g., { 1: 66, 2: 21, 3: 2, 4: 1 })
 */
export async function getTierCounts() {
  try {
    const { data, error } = await supabase
      .from('canonical_books')
      .select('canonical_tier');

    if (error) {
      throw new Error(`Failed to get tier counts: ${error.message}`);
    }

    // Count books per tier
    const counts = data.reduce((acc, book) => {
      const tier = book.canonical_tier;
      acc[tier] = (acc[tier] || 0) + 1;
      return acc;
    }, {});

    return counts;
  } catch (err) {
    console.error('getTierCounts error:', err);
    throw err;
  }
}

/**
 * Get books by testament
 * @param {string} testament - Testament ('OT' or 'NT')
 * @param {Array<number>} tiers - Optional filter by canonical tiers
 * @returns {Promise<Array>} Array of canonical book objects
 */
export async function getBooksByTestament(testament, tiers = null) {
  try {
    let query = supabase
      .from('canonical_books')
      .select('*')
      .eq('testament', testament)
      .order('canonical_tier', { ascending: true })
      .order('order_number', { ascending: true });

    // Filter by tiers if specified
    if (tiers && tiers.length > 0) {
      query = query.in('canonical_tier', tiers);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to get ${testament} books: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('getBooksByTestament error:', err);
    throw err;
  }
}

/**
 * Get books with high provenance confidence (>= threshold)
 * @param {number} threshold - Minimum provenance confidence (0.0-1.0, default: 0.80)
 * @returns {Promise<Array>} Array of canonical book objects
 */
export async function getHighProvenanceBooks(threshold = 0.80) {
  try {
    const { data, error } = await supabase
      .from('canonical_books')
      .select('*')
      .gte('provenance_confidence', threshold)
      .order('provenance_confidence', { ascending: false });

    if (error) {
      throw new Error(`Failed to get high provenance books: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('getHighProvenanceBooks error:', err);
    throw err;
  }
}

/**
 * Search canonical books by name
 * @param {string} searchTerm - Search term for book name
 * @param {Array<number>} tiers - Optional filter by canonical tiers
 * @returns {Promise<Array>} Array of matching canonical book objects
 */
export async function searchCanonicalBooks(searchTerm, tiers = null) {
  try {
    let query = supabase
      .from('canonical_books')
      .select('*')
      .ilike('book_name', `%${searchTerm}%`)
      .order('canonical_tier', { ascending: true })
      .order('order_number', { ascending: true });

    // Filter by tiers if specified
    if (tiers && tiers.length > 0) {
      query = query.in('canonical_tier', tiers);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to search canonical books: ${error.message}`);
    }

    return data;
  } catch (err) {
    console.error('searchCanonicalBooks error:', err);
    throw err;
  }
}

// Export all functions
const canonicalBooksApi = {
  getCanonicalBooks,
  getCanonicalBook,
  getTierCounts,
  getBooksByTestament,
  getHighProvenanceBooks,
  searchCanonicalBooks
};

export default canonicalBooksApi;
