/**
 * ThematicDiscoveryPanel Component - Tier 6
 * AI-powered thematic discovery for finding semantically similar verses
 * Uses Transformers.js for client-side semantic similarity
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  generateEmbedding,
  findSimilarVerses,
  generateThematicTags,
  preloadModel,
} from '../api/embeddings';
import { getVerses } from '../api/verses';
import '../styles/thematicDiscovery.css';

const ThematicDiscoveryPanel = ({ book, chapter, verse, currentVerseText, onNavigate }) => {
  const [isModelLoading, setIsModelLoading] = useState(false);
  const [modelProgress, setModelProgress] = useState(0);
  const [isSearching, setIsSearching] = useState(false);
  const [similarVerses, setSimilarVerses] = useState([]);
  const [thematicTags, setThematicTags] = useState([]);
  const [error, setError] = useState(null);
  const [versePool, setVersePool] = useState([]);
  const [poolLoading, setPoolLoading] = useState(false);
  const [selectedThreshold, setSelectedThreshold] = useState(0.6);
  const [maxResults, setMaxResults] = useState(10);

  const abortControllerRef = useRef(null);

  /**
   * Preload the ML model on component mount
   */
  useEffect(() => {
    async function loadModel() {
      try {
        setIsModelLoading(true);
        setError(null);

        await preloadModel((progress) => {
          if (progress?.progress) {
            setModelProgress(Math.round(progress.progress));
          }
        });

        setIsModelLoading(false);
        console.log('✅ Thematic discovery model loaded');
      } catch (err) {
        console.error('Failed to load thematic discovery model:', err);
        setError('Failed to load AI model. Please refresh the page.');
        setIsModelLoading(false);
      }
    }

    loadModel();
  }, []);

  /**
   * Generate thematic tags for current verse
   */
  useEffect(() => {
    if (currentVerseText) {
      try {
        const tags = generateThematicTags(currentVerseText);
        setThematicTags(tags);
      } catch (err) {
        console.error('Failed to generate thematic tags:', err);
      }
    }
  }, [currentVerseText]);

  /**
   * Build verse pool from entire Bible for similarity search
   * In production, this should be cached or pre-computed
   */
  const buildVersePool = useCallback(async () => {
    if (poolLoading || versePool.length > 0) return;

    try {
      setPoolLoading(true);
      setError(null);

      // For demo: Load a sample of verses from various books
      // In production: Load from pre-computed embedding database
      const sampleBooks = ['GEN', 'PSA', 'ISA', 'MAT', 'JHN', 'ROM', 'REV'];
      const sampleChapters = [1, 1, 53, 5, 3, 8, 21]; // Notable chapters
      const sampleVerses = [1, 1, 1, 1, 16, 28, 1]; // Notable verses

      const versePromises = sampleBooks.map(async (bookCode, idx) => {
        try {
          const versesData = await getVerses(bookCode, sampleChapters[idx]);
          return versesData
            .filter(v => v.verse <= 10) // First 10 verses of each chapter
            .map(v => ({
              book: bookCode,
              chapter: sampleChapters[idx],
              verse: v.verse,
              text: v.restored_text || v.text,
              manuscript: v.manuscript_code,
            }));
        } catch (err) {
          console.error(`Failed to load ${bookCode}:`, err);
          return [];
        }
      });

      const allVerses = (await Promise.all(versePromises)).flat();

      // Generate embeddings for all verses
      console.log(`📊 Generating embeddings for ${allVerses.length} verses...`);
      const versesWithEmbeddings = await Promise.all(
        allVerses.map(async (v) => {
          const embedding = await generateEmbedding(v.text);
          return { ...v, embedding };
        })
      );

      setVersePool(versesWithEmbeddings);
      setPoolLoading(false);
      console.log(`✅ Verse pool ready: ${versesWithEmbeddings.length} verses`);
    } catch (err) {
      console.error('Failed to build verse pool:', err);
      setError('Failed to prepare verse database for search');
      setPoolLoading(false);
    }
  }, [poolLoading, versePool.length]);

  /**
   * Search for thematically similar verses
   */
  const discoverSimilarVerses = useCallback(async () => {
    if (!currentVerseText || isModelLoading || poolLoading) {
      return;
    }

    // Build verse pool first if not already loaded
    if (versePool.length === 0) {
      await buildVersePool();
      return;
    }

    try {
      setIsSearching(true);
      setError(null);

      // Generate embedding for current verse
      console.log('🔍 Searching for thematically similar verses...');
      const queryEmbedding = await generateEmbedding(currentVerseText);

      // Find similar verses
      const similar = findSimilarVerses(
        queryEmbedding,
        versePool,
        maxResults,
        selectedThreshold
      );

      // Filter out the current verse
      const filtered = similar.filter(
        v => !(v.book === book && v.chapter === chapter && v.verse === verse)
      );

      setSimilarVerses(filtered);
      setIsSearching(false);
      console.log(`✅ Found ${filtered.length} similar verses`);
    } catch (err) {
      console.error('Similarity search failed:', err);
      setError('Failed to search for similar verses');
      setIsSearching(false);
    }
  }, [
    currentVerseText,
    isModelLoading,
    poolLoading,
    versePool,
    book,
    chapter,
    verse,
    maxResults,
    selectedThreshold,
    buildVersePool,
  ]);

  /**
   * Handle navigation to a similar verse
   */
  const handleVerseClick = (verseData) => {
    if (onNavigate) {
      onNavigate({
        book: verseData.book,
        chapter: verseData.chapter,
        verse: verseData.verse,
      });
    }
  };

  /**
   * Render similarity score as stars
   */
  const renderSimilarityStars = (similarity) => {
    const stars = Math.round(similarity * 5);
    return '⭐'.repeat(stars) + '☆'.repeat(5 - stars);
  };

  /**
   * Get color for similarity score
   */
  const getSimilarityColor = (similarity) => {
    if (similarity >= 0.8) return '#2E7D32'; // High similarity - green
    if (similarity >= 0.6) return '#F57C00'; // Medium similarity - orange
    return '#1976D2'; // Lower similarity - blue
  };

  return (
    <div className="thematic-discovery-container">
      {/* Header */}
      <div className="discovery-header">
        <h3>🧠 AI-Powered Thematic Discovery</h3>
        <p>Find verses with similar spiritual themes using semantic AI</p>
      </div>

      {/* Model Loading State */}
      {isModelLoading && (
        <div className="discovery-loading">
          <div className="loading-spinner"></div>
          <p>Loading AI model... {modelProgress}%</p>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${modelProgress}%` }}
            ></div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="discovery-error">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Thematic Tags */}
      {thematicTags.length > 0 && !isModelLoading && (
        <div className="thematic-tags-section">
          <h4>📚 Themes in this verse:</h4>
          <div className="thematic-tags">
            {thematicTags.map((tag, idx) => (
              <span key={idx} className="thematic-tag">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Search Controls */}
      {!isModelLoading && (
        <div className="discovery-controls">
          <div className="control-group">
            <label htmlFor="threshold-slider">
              Similarity Threshold: {(selectedThreshold * 100).toFixed(0)}%
            </label>
            <input
              id="threshold-slider"
              type="range"
              min="0.3"
              max="0.9"
              step="0.05"
              value={selectedThreshold}
              onChange={(e) => setSelectedThreshold(parseFloat(e.target.value))}
              disabled={isSearching || poolLoading}
            />
          </div>

          <div className="control-group">
            <label htmlFor="max-results">Max Results:</label>
            <select
              id="max-results"
              value={maxResults}
              onChange={(e) => setMaxResults(parseInt(e.target.value))}
              disabled={isSearching || poolLoading}
            >
              <option value="5">5 verses</option>
              <option value="10">10 verses</option>
              <option value="15">15 verses</option>
              <option value="20">20 verses</option>
            </select>
          </div>

          <button
            className="discover-button"
            onClick={discoverSimilarVerses}
            disabled={isSearching || poolLoading || !currentVerseText}
          >
            {poolLoading
              ? '⏳ Building verse database...'
              : isSearching
              ? '🔍 Searching...'
              : '🔍 Discover Similar Verses'}
          </button>
        </div>
      )}

      {/* Similar Verses Results */}
      {similarVerses.length > 0 && !isSearching && (
        <div className="similar-verses-section">
          <h4>✨ Thematically Similar Verses ({similarVerses.length})</h4>
          <div className="similar-verses-list">
            {similarVerses.map((similarVerse, idx) => (
              <div
                key={idx}
                className="similar-verse-card"
                onClick={() => handleVerseClick(similarVerse)}
              >
                <div className="verse-header">
                  <span className="verse-reference">
                    <strong>
                      {similarVerse.book} {similarVerse.chapter}:{similarVerse.verse}
                    </strong>
                  </span>
                  <span
                    className="similarity-score"
                    style={{ color: getSimilarityColor(similarVerse.similarity) }}
                  >
                    {(similarVerse.similarity * 100).toFixed(1)}%
                  </span>
                </div>
                <div className="similarity-stars">
                  {renderSimilarityStars(similarVerse.similarity)}
                </div>
                <p className="verse-text">{similarVerse.text}</p>
                <div className="verse-footer">
                  <span className="manuscript-badge">{similarVerse.manuscript}</span>
                  <span className="click-hint">Click to navigate →</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {similarVerses.length === 0 && !isSearching && !isModelLoading && !poolLoading && versePool.length > 0 && (
        <div className="no-results">
          <p>
            No similar verses found above {(selectedThreshold * 100).toFixed(0)}% similarity.
            Try lowering the threshold or searching again.
          </p>
        </div>
      )}

      {/* Info Footer */}
      <div className="discovery-footer">
        <p>
          <strong>How it works:</strong> This AI system uses semantic embeddings to find verses
          with similar spiritual meaning, even if they don't share the same words. Powered by
          Transformers.js running 100% in your browser - no data sent to servers.
        </p>
      </div>
    </div>
  );
};

export default ThematicDiscoveryPanel;
