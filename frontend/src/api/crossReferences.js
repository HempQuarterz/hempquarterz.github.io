/**
 * Cross-References API
 * Provides functions for retrieving biblical cross-references from Supabase
 *
 * Cross-references link related Bible passages, including:
 * - Parallel passages (same event in different books)
 * - Quotations (NT quoting OT)
 * - Allusions (indirect references)
 * - Thematic connections
 */

import { supabase } from '../config/supabase';

/**
 * Get all cross-references for a specific verse
 * @param {string} book - Book code (e.g., 'GEN', 'JHN')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Array>} Array of cross-reference objects
 */
export async function getCrossReferences(book, chapter, verse) {
  try {
    const { data, error } = await supabase
      .from('cross_references')
      .select('*')
      .eq('source_book', book)
      .eq('source_chapter', chapter)
      .eq('source_verse', verse)
      .order('target_book')
      .order('target_chapter')
      .order('target_verse');

    if (error) {
      throw new Error(`Failed to get cross-references: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('getCrossReferences error:', err);
    throw err;
  }
}

/**
 * Get cross-references grouped by category
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Object>} Cross-references grouped by category
 */
export async function getCrossReferencesByCategory(book, chapter, verse) {
  try {
    const references = await getCrossReferences(book, chapter, verse);

    // Group by category
    const grouped = {
      quotation: [],
      allusion: [],
      parallel: [],
      thematic: [],
      other: []
    };

    references.forEach(ref => {
      const category = ref.link_type || 'other';
      if (grouped[category]) {
        grouped[category].push(ref);
      } else {
        grouped.other.push(ref);
      }
    });

    return grouped;
  } catch (err) {
    console.error('getCrossReferencesByCategory error:', err);
    throw err;
  }
}

/**
 * Get count of cross-references for a verse
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<number>} Count of cross-references
 */
export async function getCrossReferenceCount(book, chapter, verse) {
  try {
    const { count, error } = await supabase
      .from('cross_references')
      .select('*', { count: 'exact', head: true })
      .eq('source_book', book)
      .eq('source_chapter', chapter)
      .eq('source_verse', verse);

    if (error) {
      throw new Error(`Failed to get cross-reference count: ${error.message}`);
    }

    return count || 0;
  } catch (err) {
    console.error('getCrossReferenceCount error:', err);
    throw err;
  }
}

/**
 * Get verses that reference this verse (reverse lookup)
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Array>} Array of verses that reference this one
 */
export async function getReferencingVerses(book, chapter, verse) {
  try {
    const { data, error } = await supabase
      .from('cross_references')
      .select('*')
      .eq('target_book', book)
      .eq('target_chapter', chapter)
      .eq('target_verse', verse)
      .order('source_book')
      .order('source_chapter')
      .order('source_verse');

    if (error) {
      throw new Error(`Failed to get referencing verses: ${error.message}`);
    }

    return data || [];
  } catch (err) {
    console.error('getReferencingVerses error:', err);
    throw err;
  }
}

/**
 * Format cross-reference for display
 * @param {Object} ref - Cross-reference object from database
 * @returns {string} Formatted reference string (e.g., "John 3:16")
 */
export function formatCrossReference(ref) {
  return `${ref.target_book} ${ref.target_chapter}:${ref.target_verse}`;
}

/**
 * Get category display name
 * @param {string} category - Category code
 * @returns {string} Human-readable category name
 */
export function getCategoryDisplayName(category) {
  const categoryNames = {
    quotation: 'Direct Quotation',
    allusion: 'Allusion',
    parallel: 'Parallel Passage',
    thematic: 'Thematic Connection',
    other: 'Related Passage'
  };

  return categoryNames[category] || categoryNames.other;
}

/**
 * Get category color for UI
 * @param {string} category - Category code
 * @returns {string} CSS color value
 */
export function getCategoryColor(category) {
  const categoryColors = {
    quotation: '#D32F2F',    // Red - Direct quotes
    allusion: '#F57C00',     // Orange - Indirect references
    parallel: '#388E3C',     // Green - Same events
    thematic: '#1976D2',     // Blue - Thematic links
    other: '#666666'         // Gray - Other
  };

  return categoryColors[category] || categoryColors.other;
}

/**
 * Detect parallel passages (synoptic gospels, Kings/Chronicles, etc.)
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Array>} Array of parallel passage objects
 */
export async function getParallelPassages(book, chapter, verse) {
  try {
    // Get all cross-references for this verse
    const references = await getCrossReferences(book, chapter, verse);

    // Get reverse references (verses that point to this one)
    const reverseRefs = await getReferencingVerses(book, chapter, verse);

    // Detect parallel passages based on bidirectional references
    const parallelPassages = [];

    // Check for bidirectional references (mutual cross-references = likely parallels)
    for (const ref of references) {
      const isBidirectional = reverseRefs.some(rev =>
        rev.source_book === ref.target_book &&
        rev.source_chapter === ref.target_chapter &&
        rev.source_verse === ref.target_verse
      );

      if (isBidirectional) {
        parallelPassages.push({
          ...ref,
          parallelType: 'bidirectional',
          similarity: 0.9 // High confidence for mutual references
        });
      }
    }

    // Detect synoptic gospel parallels (Matthew, Mark, Luke)
    const synopticBooks = ['MAT', 'MRK', 'LUK'];
    if (synopticBooks.includes(book)) {
      const synopticRefs = references.filter(ref =>
        synopticBooks.includes(ref.target_book) && ref.target_book !== book
      );

      synopticRefs.forEach(ref => {
        if (!parallelPassages.find(p =>
          p.target_book === ref.target_book &&
          p.target_chapter === ref.target_chapter &&
          p.target_verse === ref.target_verse
        )) {
          parallelPassages.push({
            ...ref,
            parallelType: 'synoptic',
            similarity: 0.85
          });
        }
      });
    }

    // Detect Kings/Chronicles parallels
    const kingsChroniclesMap = {
      '1KI': '1CH',
      '2KI': '2CH',
      '1CH': '1KI',
      '2CH': '2KI'
    };

    const parallelBook = kingsChroniclesMap[book];
    if (parallelBook) {
      const kcRefs = references.filter(ref => ref.target_book === parallelBook);
      kcRefs.forEach(ref => {
        if (!parallelPassages.find(p =>
          p.target_book === ref.target_book &&
          p.target_chapter === ref.target_chapter &&
          p.target_verse === ref.target_verse
        )) {
          parallelPassages.push({
            ...ref,
            parallelType: 'kingsChronicles',
            similarity: 0.95
          });
        }
      });
    }

    // Sort by similarity (highest first)
    parallelPassages.sort((a, b) => b.similarity - a.similarity);

    return parallelPassages;
  } catch (err) {
    console.error('getParallelPassages error:', err);
    throw err;
  }
}

/**
 * Get parallel type display name
 * @param {string} type - Parallel type code
 * @returns {string} Human-readable parallel type name
 */
export function getParallelTypeDisplayName(type) {
  const typeNames = {
    bidirectional: 'Mutual Reference',
    synoptic: 'Synoptic Gospel',
    kingsChronicles: 'Kings/Chronicles Parallel',
    other: 'Related Passage'
  };

  return typeNames[type] || typeNames.other;
}

// Export all functions
export default {
  getCrossReferences,
  getCrossReferencesByCategory,
  getCrossReferenceCount,
  getReferencingVerses,
  getParallelPassages,
  formatCrossReference,
  getCategoryDisplayName,
  getCategoryColor,
  getParallelTypeDisplayName
};
