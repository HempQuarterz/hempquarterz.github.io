/**
 * Word Alignment API
 * Fetches word-by-word alignment data for interlinear display
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Get word alignments for a specific verse
 * @param {string} sourceManuscript - Source manuscript code (e.g., 'WLC', 'SBLGNT')
 * @param {string} targetManuscript - Target manuscript code (e.g., 'WEB')
 * @param {string} book - Book code (e.g., 'GEN', 'MAT')
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<Array>} Array of word alignment objects
 */
export async function getWordAlignments(sourceManuscript, targetManuscript, book, chapter, verse) {
  try {
    // Get manuscript IDs
    const { data: sourceMs } = await supabase
      .from('manuscripts')
      .select('id')
      .eq('code', sourceManuscript)
      .single();

    const { data: targetMs } = await supabase
      .from('manuscripts')
      .select('id')
      .eq('code', targetManuscript)
      .single();

    if (!sourceMs || !targetMs) {
      console.warn(`Manuscript not found: ${sourceManuscript} or ${targetManuscript}`);
      return [];
    }

    // Fetch alignments
    const { data, error } = await supabase
      .from('word_alignments')
      .select('*')
      .eq('source_manuscript_id', sourceMs.id)
      .eq('target_manuscript_id', targetMs.id)
      .eq('source_book', book)
      .eq('source_chapter', chapter)
      .eq('source_verse', verse)
      .order('source_word_position');

    if (error) {
      console.error('Error fetching alignments:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getWordAlignments:', error);
    return [];
  }
}

/**
 * Check if word alignments exist for a verse
 * @param {string} sourceManuscript - Source manuscript code
 * @param {string} targetManuscript - Target manuscript code
 * @param {string} book - Book code
 * @param {number} chapter - Chapter number
 * @param {number} verse - Verse number
 * @returns {Promise<boolean>} True if alignments exist
 */
export async function hasWordAlignments(sourceManuscript, targetManuscript, book, chapter, verse) {
  const alignments = await getWordAlignments(sourceManuscript, targetManuscript, book, chapter, verse);
  return alignments.length > 0;
}

/**
 * Get all available alignment pairs for a book
 * (Useful for showing which interlinear views are available)
 * @param {string} book - Book code
 * @returns {Promise<Array>} Array of {source, target} manuscript pairs
 */
export async function getAvailableAlignments(book) {
  try {
    const { data, error } = await supabase
      .from('word_alignments')
      .select(`
        source_manuscript:manuscripts!word_alignments_source_manuscript_id_fkey(code, name),
        target_manuscript:manuscripts!word_alignments_target_manuscript_id_fkey(code, name)
      `)
      .eq('source_book', book)
      .limit(1000);

    if (error) {
      console.error('Error fetching available alignments:', error);
      return [];
    }

    // Get unique pairs
    const pairs = new Map();
    data?.forEach(item => {
      const key = `${item.source_manuscript.code}-${item.target_manuscript.code}`;
      if (!pairs.has(key)) {
        pairs.set(key, {
          source: item.source_manuscript,
          target: item.target_manuscript
        });
      }
    });

    return Array.from(pairs.values());
  } catch (error) {
    console.error('Error in getAvailableAlignments:', error);
    return [];
  }
}
