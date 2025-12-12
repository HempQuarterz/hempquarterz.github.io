/**
 * ParallelPassageViewer Component
 * Displays parallel passages side-by-side for comparison
 * Part of Phase 1: Tier 3 implementation
 */

import React, { useState, useEffect } from 'react';
import { getVerse } from '../api/verses';
import { restoreVerse } from '../api/restoration';
import { getParallelPassages, formatCrossReference, getParallelTypeDisplayName } from '../api/crossReferences';
import Loading from './Loading';

const ParallelPassageViewer = ({ book, chapter, verse, onNavigate }) => {
  const [parallelPassages, setParallelPassages] = useState([]);
  const [selectedParallels, setSelectedParallels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verses, setVerses] = useState({});
  const [showRestored, setShowRestored] = useState(true);

  // Load parallel passages
  useEffect(() => {
    async function loadParallels() {
      if (!book || !chapter || !verse) return;

      try {
        setLoading(true);
        setError(null);

        const parallels = await getParallelPassages(book, chapter, verse);
        setParallelPassages(parallels);

        // Auto-select first parallel passage if available
        if (parallels.length > 0 && selectedParallels.length === 0) {
          setSelectedParallels([parallels[0]]);
        }

        setLoading(false);
      } catch (err) {
        console.error('Failed to load parallel passages:', err);
        setError(err.message || 'Failed to load parallel passages');
        setLoading(false);
      }
    }

    loadParallels();
  }, [book, chapter, verse]);

  // Load verse text for selected parallels
  useEffect(() => {
    async function loadVerses() {
      if (selectedParallels.length === 0) return;

      const newVerses = {};

      // Load source verse
      const sourceKey = `${book}_${chapter}_${verse}`;
      try {
        const sourceVerse = await getVerse('WEB', book, chapter, verse);
        if (sourceVerse) {
          const restoredVerse = showRestored ? await restoreVerse(sourceVerse) : sourceVerse;
          newVerses[sourceKey] = restoredVerse;
        }
      } catch (err) {
        console.error(`Failed to load source verse ${sourceKey}:`, err);
      }

      // Load parallel verses
      for (const parallel of selectedParallels) {
        const key = `${parallel.target_book}_${parallel.target_chapter}_${parallel.target_verse}`;
        try {
          const parallelVerse = await getVerse('WEB', parallel.target_book, parallel.target_chapter, parallel.target_verse);
          if (parallelVerse) {
            const restoredVerse = showRestored ? await restoreVerse(parallelVerse) : parallelVerse;
            newVerses[key] = restoredVerse;
          }
        } catch (err) {
          console.error(`Failed to load parallel verse ${key}:`, err);
        }
      }

      setVerses(newVerses);
    }

    loadVerses();
  }, [selectedParallels, book, chapter, verse, showRestored]);

  const handleSelectParallel = (parallel) => {
    // Toggle selection
    const isSelected = selectedParallels.some(p =>
      p.target_book === parallel.target_book &&
      p.target_chapter === parallel.target_chapter &&
      p.target_verse === parallel.target_verse
    );

    if (isSelected) {
      setSelectedParallels(selectedParallels.filter(p =>
        !(p.target_book === parallel.target_book &&
          p.target_chapter === parallel.target_chapter &&
          p.target_verse === parallel.target_verse)
      ));
    } else {
      // Limit to 2 parallel passages at once for better comparison
      if (selectedParallels.length >= 2) {
        setSelectedParallels([selectedParallels[1], parallel]);
      } else {
        setSelectedParallels([...selectedParallels, parallel]);
      }
    }
  };

  const highlightRestoredNames = (text, restorations) => {
    if (!restorations || restorations.length === 0) return text;

    let highlightedText = text;
    restorations.forEach(restoration => {
      const pattern = new RegExp(restoration.restored, 'g');
      highlightedText = highlightedText.replace(
        pattern,
        `<span class="restored-name" title="Restored from: ${restoration.original}">${restoration.restored}</span>`
      );
    });

    return highlightedText;
  };

  if (!book || !chapter || !verse) return null;

  if (loading) {
    return (
      <div style={{
        background: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        padding: '2rem',
        marginTop: '2rem'
      }}>
        <Loading type="parallel passages" />
      </div>
    );
  }

  if (parallelPassages.length === 0) {
    return null; // Don't show component if no parallel passages
  }

  const sourceKey = `${book}_${chapter}_${verse}`;
  const sourceVerse = verses[sourceKey];

  return (
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      marginTop: '2rem'
    }}>
      {/* Header */}
      <div style={{
        padding: '1rem',
        background: 'linear-gradient(135deg, #1976D2 0%, #2196F3 100%)',
        color: '#fff'
      }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
          📖 Parallel Passages
        </h3>
        <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
          {parallelPassages.length} parallel passage{parallelPassages.length !== 1 ? 's' : ''} found
        </p>
      </div>

      {/* Content */}
      <div style={{ padding: '1rem' }}>
        {error && (
          <div style={{
            padding: '1rem',
            background: '#ffebee',
            border: '1px solid #ef5350',
            borderRadius: '4px',
            color: '#c62828',
            marginBottom: '1rem'
          }}>
            <strong>Error:</strong> {error}
          </div>
        )}

        {/* Parallel Passage Selector */}
        <div style={{ marginBottom: '1rem' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.9rem', color: '#666' }}>
            Select passages to compare (max 2):
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {parallelPassages.map((parallel, index) => {
              const isSelected = selectedParallels.some(p =>
                p.target_book === parallel.target_book &&
                p.target_chapter === parallel.target_chapter &&
                p.target_verse === parallel.target_verse
              );

              return (
                <button
                  key={index}
                  onClick={() => handleSelectParallel(parallel)}
                  style={{
                    padding: '0.5rem 1rem',
                    border: `2px solid ${isSelected ? '#1976D2' : '#ddd'}`,
                    borderRadius: '20px',
                    background: isSelected ? '#e3f2fd' : '#fff',
                    color: isSelected ? '#1976D2' : '#666',
                    cursor: 'pointer',
                    fontSize: '0.85rem',
                    fontWeight: isSelected ? '600' : '400',
                    transition: 'all 0.2s ease'
                  }}
                >
                  {formatCrossReference(parallel)}
                  <span style={{ fontSize: '0.75rem', marginLeft: '0.5rem', opacity: 0.7 }}>
                    ({getParallelTypeDisplayName(parallel.parallelType)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Restoration Toggle */}
        <div style={{ textAlign: 'center', marginBottom: '1rem' }}>
          <button
            onClick={() => setShowRestored(!showRestored)}
            style={{
              padding: '0.5rem 1rem',
              fontSize: '0.85rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: showRestored ? '#2E7D32' : '#fff',
              color: showRestored ? '#fff' : '#666',
              cursor: 'pointer',
              fontWeight: showRestored ? '600' : '400'
            }}
          >
            {showRestored ? '✦ Names Restored' : 'Show Restored Names'}
          </button>
        </div>

        {/* Side-by-Side Comparison */}
        {selectedParallels.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${selectedParallels.length + 1}, 1fr)`,
            gap: '1rem',
            marginTop: '1rem'
          }}>
            {/* Source Verse */}
            <div style={{
              padding: '1rem',
              border: '2px solid #2E7D32',
              borderRadius: '8px',
              background: '#f1f8f4'
            }}>
              <h4 style={{ margin: '0 0 0.75rem 0', color: '#2E7D32', fontSize: '1rem' }}>
                {book} {chapter}:{verse}
              </h4>
              {sourceVerse ? (
                <>
                  <div
                    style={{
                      fontSize: '1rem',
                      lineHeight: '1.8',
                      color: '#333',
                      fontFamily: "'Cardo', serif"
                    }}
                    dangerouslySetInnerHTML={{
                      __html: showRestored && sourceVerse.restorations
                        ? highlightRestoredNames(sourceVerse.text, sourceVerse.restorations)
                        : sourceVerse.text
                    }}
                  />
                  <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                    World English Bible
                  </div>
                </>
              ) : (
                <p style={{ color: '#999', fontStyle: 'italic' }}>Loading...</p>
              )}
            </div>

            {/* Parallel Verses */}
            {selectedParallels.map((parallel, index) => {
              const key = `${parallel.target_book}_${parallel.target_chapter}_${parallel.target_verse}`;
              const parallelVerse = verses[key];

              return (
                <div
                  key={index}
                  style={{
                    padding: '1rem',
                    border: '2px solid #1976D2',
                    borderRadius: '8px',
                    background: '#e3f2fd'
                  }}
                >
                  <h4 style={{ margin: '0 0 0.75rem 0', color: '#1976D2', fontSize: '1rem' }}>
                    {formatCrossReference(parallel)}
                    <button
                      onClick={() => onNavigate({
                        book: parallel.target_book,
                        chapter: parallel.target_chapter,
                        verse: parallel.target_verse
                      })}
                      style={{
                        marginLeft: '0.5rem',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.7rem',
                        border: 'none',
                        borderRadius: '4px',
                        background: '#1976D2',
                        color: '#fff',
                        cursor: 'pointer'
                      }}
                    >
                      →
                    </button>
                  </h4>
                  {parallelVerse ? (
                    <>
                      <div
                        style={{
                          fontSize: '1rem',
                          lineHeight: '1.8',
                          color: '#333',
                          fontFamily: "'Cardo', serif"
                        }}
                        dangerouslySetInnerHTML={{
                          __html: showRestored && parallelVerse.restorations
                            ? highlightRestoredNames(parallelVerse.text, parallelVerse.restorations)
                            : parallelVerse.text
                        }}
                      />
                      <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#666', fontStyle: 'italic' }}>
                        World English Bible
                      </div>
                    </>
                  ) : (
                    <p style={{ color: '#999', fontStyle: 'italic' }}>Loading...</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedParallels.length === 0 && (
          <p style={{ textAlign: 'center', color: '#999', fontStyle: 'italic', padding: '2rem' }}>
            Select a parallel passage above to compare
          </p>
        )}
      </div>
    </div>
  );
};

export default ParallelPassageViewer;
