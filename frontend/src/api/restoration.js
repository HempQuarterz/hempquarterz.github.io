/**
 * All4Yah Name Restoration API
 * Provides functions for restoring divine names in Bible text
 */

import { supabase } from '../config/supabase';

// Cache for name mappings to avoid repeated database queries
let nameMappingsCache = null;
let nameMappingsPromise = null;

/**
 * Safely parse a regex pattern from string
 * @param {string} patternString - String representation of regex (e.g., "/pattern/gi")
 * @returns {RegExp|null} Parsed regex or null if invalid
 */
function parseRegexPattern(patternString) {
  try {
    // Parse pattern like "/foo/gi" into components
    const match = patternString.match(/^\/(.*)\/([gimsuvy]*)$/);
    if (match) {
      return new RegExp(match[1], match[2]);
    }
    // Fallback: try as plain pattern
    return new RegExp(patternString, 'g');
  } catch (err) {
    console.error('Failed to parse regex pattern:', patternString, err);
    return null;
  }
}

/**
 * Load all name mappings from database
 * @returns {Promise<Array>} Array of name mapping objects
 */
async function loadNameMappings() {
  // If cache exists, return it immediately
  if (nameMappingsCache) {
    return nameMappingsCache;
  }

  // If a request is already in progress, return the same promise
  if (nameMappingsPromise) {
    return nameMappingsPromise;
  }

  // Start new request
  nameMappingsPromise = supabase
    .from('name_mappings')
    .select('*')
    .order('original_text')
    .then(({ data, error }) => {
      if (error) {
        nameMappingsPromise = null; // Reset on error
        throw new Error(`Failed to load name mappings: ${error.message}`);
      }
      nameMappingsCache = data;
      nameMappingsPromise = null; // Clear promise after success
      return data;
    });

  return nameMappingsPromise;
}

/**
 * Preload name mappings into cache
 * Call this early to avoid multiple requests
 * @returns {Promise<void>}
 */
export async function preloadNameMappings() {
  await loadNameMappings();
}

/**
 * Clear the mappings cache (useful for testing or updates)
 */
export function clearMappingsCache() {
  nameMappingsCache = null;
  nameMappingsPromise = null;
}

/**
 * Restore divine names in text using Strong's numbers
 * This is the most accurate method as it uses the original language concordance
 *
 * @param {string} text - The verse text
 * @param {Array<string>} strongNumbers - Array of Strong's numbers for the verse
 * @param {string} language - 'hebrew' or 'english'
 * @returns {Promise<Object>} Object with restored text and metadata
 */
export async function restoreByStrongsNumbers(text, strongNumbers, language) {
  try {
    const mappings = await loadNameMappings();

    // Filter mappings relevant to this language and that have Strong's numbers
    const relevantMappings = mappings.filter(m =>
      m.context_rules &&
      m.context_rules.language === language &&
      m.strong_number &&
      strongNumbers && strongNumbers.includes(m.strong_number)
    );

    if (relevantMappings.length === 0) {
      return {
        text,
        restored: false,
        restorations: []
      };
    }

    let restoredText = text;
    const restorations = [];

    for (const mapping of relevantMappings) {
      const original = mapping.original_text;
      const restored = mapping.restored_rendering;

      // For Hebrew and Aramaic, do simple word replacement
      if (language === 'hebrew' || language === 'aramaic') {
        if (restoredText.includes(original)) {
          restoredText = restoredText.replace(new RegExp(original, 'g'), restored);
          restorations.push({
            original,
            restored,
            strongNumber: mapping.strong_number,
            count: (text.match(new RegExp(original, 'g')) || []).length
          });
        }
      }
      // For English and Greek, use pattern matching if available
      else if ((language === 'english' || language === 'greek') && mapping.context_rules.pattern) {
        const pattern = parseRegexPattern(mapping.context_rules.pattern);
        if (pattern) {
          const matches = restoredText.match(pattern);

          if (matches) {
            restoredText = restoredText.replace(pattern, restored);
            restorations.push({
              original,
              restored,
              strongNumber: mapping.strong_number,
              count: matches.length
            });
          }
        }
      }
    }

    return {
      text: restoredText,
      original: text,
      restored: restorations.length > 0,
      restorations,
      method: 'strongs_numbers'
    };
  } catch (err) {
    console.error('restoreByStrongsNumbers error:', err);
    throw err;
  }
}

/**
 * Restore divine names in text using pattern matching
 * Useful when Strong's numbers are not available
 *
 * @param {string} text - The verse text
 * @param {string} language - 'hebrew' or 'english'
 * @returns {Promise<Object>} Object with restored text and metadata
 */
export async function restoreByPattern(text, language) {
  try {
    const mappings = await loadNameMappings();

    // Filter mappings relevant to this language
    const relevantMappings = mappings.filter(m =>
      m.context_rules &&
      m.context_rules.language === language
    );

    if (relevantMappings.length === 0) {
      return {
        text,
        restored: false,
        restorations: []
      };
    }

    let restoredText = text;
    const restorations = [];

    for (const mapping of relevantMappings) {
      const original = mapping.original_text;
      const restored = mapping.restored_rendering;

      if (mapping.context_rules.pattern) {
        const pattern = parseRegexPattern(mapping.context_rules.pattern);
        if (pattern) {
          const matches = restoredText.match(pattern);

          if (matches) {
            restoredText = restoredText.replace(pattern, restored);
            restorations.push({
              original,
              restored,
              count: matches.length,
              method: 'pattern'
            });
          }
        }
      } else if (mapping.context_rules.whole_word) {
        // Simple whole word replacement
        const wordPattern = new RegExp(`\\b${original}\\b`, 'g');
        const matches = restoredText.match(wordPattern);

        if (matches) {
          restoredText = restoredText.replace(wordPattern, restored);
          restorations.push({
            original,
            restored,
            count: matches.length,
            method: 'whole_word'
          });
        }
      }
    }

    return {
      text: restoredText,
      original: text,
      restored: restorations.length > 0,
      restorations,
      method: 'pattern_matching'
    };
  } catch (err) {
    console.error('restoreByPattern error:', err);
    throw err;
  }
}

/**
 * Restore a verse object (includes both text and Strong's numbers)
 *
 * @param {Object} verse - Verse object from getVerse() or getParallelVerse()
 * @returns {Promise<Object>} Verse with restored text
 */
export async function restoreVerse(verse) {
  try {
    // Determine language based on manuscript
    let language;
    if (verse.manuscript === 'WLC' || verse.manuscript === 'DSS') {
      language = 'hebrew';
    } else if (verse.manuscript === 'SBLGNT' || verse.manuscript === 'LXX' ||
               verse.manuscript === 'BYZMT' || verse.manuscript === 'TR' ||
               verse.manuscript === 'N1904' || verse.manuscript === 'SIN') {
      language = 'greek';
    } else if (verse.manuscript === 'PESHITTA' || verse.manuscript === 'ONKELOS') {
      language = 'aramaic';
    } else {
      language = 'english';
    }

    // Use Strong's numbers if available (Hebrew only)
    if (verse.strong_numbers && verse.strong_numbers.length > 0) {
      const result = await restoreByStrongsNumbers(
        verse.text,
        verse.strong_numbers,
        language
      );

      return {
        ...verse,
        text: result.text,
        originalText: result.original,
        restored: result.restored,
        restorations: result.restorations
      };
    }

    // Fall back to pattern matching (English, Greek, or Hebrew without Strong's)
    const result = await restoreByPattern(verse.text, language);

    return {
      ...verse,
      text: result.text,
      originalText: result.original,
      restored: result.restored,
      restorations: result.restorations
    };
  } catch (err) {
    console.error('restoreVerse error:', err);
    throw err;
  }
}

/**
 * Restore a parallel verse (both Hebrew and English)
 *
 * @param {Object} parallelVerse - Parallel verse object from getParallelVerse()
 * @returns {Promise<Object>} Parallel verse with restored text
 */
export async function restoreParallelVerse(parallelVerse) {
  try {
    const [restoredHebrew, restoredEnglish] = await Promise.all([
      restoreVerse(parallelVerse.hebrew),
      restoreVerse(parallelVerse.english)
    ]);

    return {
      ...parallelVerse,
      hebrew: restoredHebrew,
      english: restoredEnglish,
      restored: restoredHebrew.restored || restoredEnglish.restored
    };
  } catch (err) {
    console.error('restoreParallelVerse error:', err);
    throw err;
  }
}

/**
 * Restore an array of verses (e.g., a chapter)
 *
 * @param {Array} verses - Array of verse objects
 * @returns {Promise<Array>} Array of verses with restored text
 */
export async function restoreChapter(verses) {
  try {
    return Promise.all(verses.map(verse => restoreVerse(verse)));
  } catch (err) {
    console.error('restoreChapter error:', err);
    throw err;
  }
}

/**
 * Get all available name mappings
 *
 * @returns {Promise<Array>} Array of name mapping objects
 */
export async function getNameMappings() {
  return loadNameMappings();
}

// Export all functions
const restorationApi = {
  restoreByStrongsNumbers,
  restoreByPattern,
  restoreVerse,
  restoreParallelVerse,
  restoreChapter,
  getNameMappings,
  preloadNameMappings,
  clearMappingsCache
};

export default restorationApi;
