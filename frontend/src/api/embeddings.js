/**
 * Verse Embedding Service - Tier 6
 * Generates semantic embeddings for Bible verses using Transformers.js
 * Enables thematic discovery through AI-powered similarity search
 */

import { pipeline, cos_sim } from '@huggingface/transformers';

/**
 * Singleton class for managing the embedding pipeline
 * Ensures only one model instance is loaded in memory
 */
class EmbeddingPipeline {
  static task = 'feature-extraction';
  static model = 'Xenova/all-MiniLM-L6-v2'; // 384-dim multilingual embeddings
  static instance = null;
  static isLoading = false;
  static loadPromise = null;

  /**
   * Get or create the embedding pipeline instance
   * @param {Function} progress_callback - Optional callback for model loading progress
   * @returns {Promise<Pipeline>} The feature extraction pipeline
   */
  static async getInstance(progress_callback = null) {
    if (this.instance === null) {
      if (this.isLoading) {
        // Wait for existing load to complete
        return this.loadPromise;
      }

      this.isLoading = true;
      this.loadPromise = pipeline(this.task, this.model, {
        progress_callback,
        dtype: 'q8', // Quantized for faster loading and smaller size
      });

      try {
        this.instance = await this.loadPromise;
        console.log('✅ Embedding model loaded successfully');
      } catch (error) {
        console.error('❌ Failed to load embedding model:', error);
        this.isLoading = false;
        throw error;
      }

      this.isLoading = false;
    }

    return this.instance;
  }

  /**
   * Unload the pipeline to free memory
   */
  static async unload() {
    if (this.instance !== null) {
      await this.instance.dispose?.();
      this.instance = null;
      console.log('🗑️ Embedding model unloaded');
    }
  }
}

/**
 * Generate embedding vector for a verse text
 * @param {string} verseText - The verse text to embed
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Float32Array>} 384-dimensional embedding vector
 */
export async function generateEmbedding(verseText, onProgress = null) {
  if (!verseText || typeof verseText !== 'string') {
    throw new Error('Invalid verse text for embedding generation');
  }

  try {
    const extractor = await EmbeddingPipeline.getInstance(onProgress);

    // Generate embedding with mean pooling and L2 normalization
    const output = await extractor(verseText, {
      pooling: 'mean',    // Average all token embeddings
      normalize: true,    // L2 normalization for cosine similarity
    });

    return output.data;
  } catch (error) {
    console.error('Failed to generate embedding:', error);
    throw new Error(`Embedding generation failed: ${error.message}`);
  }
}

/**
 * Generate embeddings for multiple verses in batch
 * @param {Array<string>} verseTexts - Array of verse texts
 * @param {Function} onProgress - Optional progress callback
 * @returns {Promise<Array<Float32Array>>} Array of embedding vectors
 */
export async function generateBatchEmbeddings(verseTexts, onProgress = null) {
  if (!Array.isArray(verseTexts) || verseTexts.length === 0) {
    throw new Error('Invalid verse texts array for batch embedding');
  }

  try {
    const extractor = await EmbeddingPipeline.getInstance(onProgress);

    // Generate all embeddings in parallel
    const embeddings = await Promise.all(
      verseTexts.map(text =>
        extractor(text, {
          pooling: 'mean',
          normalize: true,
        })
      )
    );

    return embeddings.map(output => output.data);
  } catch (error) {
    console.error('Failed to generate batch embeddings:', error);
    throw new Error(`Batch embedding generation failed: ${error.message}`);
  }
}

/**
 * Calculate cosine similarity between two embedding vectors
 * @param {Float32Array} embedding1 - First embedding vector
 * @param {Float32Array} embedding2 - Second embedding vector
 * @returns {number} Similarity score between -1 and 1 (higher = more similar)
 */
export function calculateSimilarity(embedding1, embedding2) {
  if (!embedding1 || !embedding2) {
    throw new Error('Invalid embeddings for similarity calculation');
  }

  return cos_sim(embedding1, embedding2);
}

/**
 * Find verses most similar to a query verse
 * @param {Float32Array} queryEmbedding - Query verse embedding
 * @param {Array<Object>} versePool - Pool of verses with embeddings
 * @param {number} topK - Number of similar verses to return
 * @param {number} minSimilarity - Minimum similarity threshold (0-1)
 * @returns {Array<Object>} Top K similar verses with similarity scores
 */
export function findSimilarVerses(queryEmbedding, versePool, topK = 10, minSimilarity = 0.5) {
  if (!queryEmbedding || !Array.isArray(versePool)) {
    throw new Error('Invalid parameters for similarity search');
  }

  // Calculate similarity scores for all verses
  const scoredVerses = versePool.map(verse => ({
    ...verse,
    similarity: calculateSimilarity(queryEmbedding, verse.embedding),
  }));

  // Filter by minimum similarity and sort by score (descending)
  return scoredVerses
    .filter(verse => verse.similarity >= minSimilarity)
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, topK);
}

/**
 * Generate thematic tags based on verse content using pattern matching
 * This is a simple heuristic approach - can be enhanced with NLP later
 * @param {string} verseText - The verse text to analyze
 * @returns {Array<string>} Array of thematic tags
 */
export function generateThematicTags(verseText) {
  const text = verseText.toLowerCase();
  const tags = [];

  // Thematic patterns (can be expanded)
  const themePatterns = {
    love: /\b(love|beloved|charity|affection|compassion)\b/i,
    faith: /\b(faith|believe|trust|confidence)\b/i,
    hope: /\b(hope|expect|anticipate)\b/i,
    peace: /\b(peace|calm|tranquil|rest)\b/i,
    joy: /\b(joy|rejoice|glad|happiness|delight)\b/i,
    salvation: /\b(salvation|save|rescue|redeem|deliver)\b/i,
    grace: /\b(grace|mercy|kindness|favor)\b/i,
    prayer: /\b(pray|prayer|supplication|petition)\b/i,
    worship: /\b(worship|praise|glorify|exalt)\b/i,
    justice: /\b(justice|righteous|fair|just)\b/i,
    wisdom: /\b(wisdom|wise|understanding|knowledge)\b/i,
    forgiveness: /\b(forgive|pardon|mercy|clemency)\b/i,
    covenant: /\b(covenant|promise|oath|vow)\b/i,
    creation: /\b(create|creation|made|form|establish)\b/i,
    prophecy: /\b(prophet|prophesy|foretell|predict)\b/i,
    kingdom: /\b(kingdom|reign|rule|throne)\b/i,
    judgment: /\b(judge|judgment|condemn)\b/i,
    sacrifice: /\b(sacrifice|offering|altar)\b/i,
    resurrection: /\b(resurrect|resurrection|rise|raised)\b/i,
    holiness: /\b(holy|holiness|sanctify|sacred)\b/i,
  };

  // Check each pattern
  for (const [tag, pattern] of Object.entries(themePatterns)) {
    if (pattern.test(text)) {
      tags.push(tag);
    }
  }

  // Add divine name tag if present
  if (/\b(yahuah|yahusha|elohim)\b/i.test(text)) {
    tags.push('divine-name');
  }

  return tags;
}

/**
 * Cluster verses into thematic groups using similarity
 * @param {Array<Object>} verses - Verses with embeddings
 * @param {number} threshold - Similarity threshold for clustering (0-1)
 * @returns {Array<Array<Object>>} Array of verse clusters
 */
export function clusterVersesByTheme(verses, threshold = 0.7) {
  if (!Array.isArray(verses) || verses.length === 0) {
    return [];
  }

  const clusters = [];
  const visited = new Set();

  verses.forEach((verse, idx) => {
    if (visited.has(idx)) return;

    const cluster = [verse];
    visited.add(idx);

    // Find similar verses for this cluster
    verses.forEach((otherVerse, otherIdx) => {
      if (visited.has(otherIdx)) return;

      const similarity = calculateSimilarity(verse.embedding, otherVerse.embedding);
      if (similarity >= threshold) {
        cluster.push(otherVerse);
        visited.add(otherIdx);
      }
    });

    clusters.push(cluster);
  });

  // Sort clusters by size (largest first)
  return clusters.sort((a, b) => b.length - a.length);
}

/**
 * Preload the embedding model for faster first use
 * @param {Function} onProgress - Optional progress callback
 */
export async function preloadModel(onProgress = null) {
  try {
    console.log('⏳ Preloading embedding model...');
    await EmbeddingPipeline.getInstance(onProgress);
    console.log('✅ Model preloaded successfully');
  } catch (error) {
    console.error('❌ Failed to preload model:', error);
    throw error;
  }
}

/**
 * Unload the embedding model to free memory
 */
export async function unloadModel() {
  await EmbeddingPipeline.unload();
}

// Export the pipeline class for advanced usage
export { EmbeddingPipeline };
