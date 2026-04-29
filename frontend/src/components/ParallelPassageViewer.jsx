/**
 * ParallelPassageViewer Component
 * Displays parallel passages side-by-side for comparison
 * Part of Phase 1: Tier 3 implementation
 */

import React, { useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import { getVerse } from '../api/verses';
import { restoreVerse } from '../api/restoration';
import { getParallelPassages, formatCrossReference, getParallelTypeDisplayName } from '../api/crossReferences';
import Loading from './Loading';
import '../styles/parallel-passage.css';

const sanitize = (html) => DOMPurify.sanitize(html, { ALLOWED_TAGS: ['span', 'em', 'strong', 'mark'], ALLOWED_ATTR: ['class', 'title'] });

// Books outside the WEB canon. When the source book is EOTC, fall back to
// CHARLES (R.H. Charles English translation) so parallel passages from
// 1 Enoch / Jubilees / Ascension of Isaiah / Meqabyan / Kebra Nagast actually
// render text instead of an empty card.
const EOTC_BOOKS = new Set(['ENO', 'JUB', 'ASI', '1MQ', '2MQ', '3MQ', 'MEQ', 'KNG', 'TGO', 'GMA']);
const resolveManuscript = (manuscript, bookCode) => {
  if (manuscript) return manuscript;
  return EOTC_BOOKS.has(bookCode) ? 'CHARLES' : 'WEB';
};

const ParallelPassageViewer = ({ book, chapter, verse, onNavigate, sourceManuscript }) => {
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

      // Load source verse — fall back to CHARLES for EOTC books, WEB otherwise.
      const sourceKey = `${book}_${chapter}_${verse}`;
      const sourceMs = resolveManuscript(sourceManuscript, book);
      try {
        const sourceVerse = await getVerse(sourceMs, book, chapter, verse);
        if (sourceVerse) {
          const restoredVerse = showRestored ? await restoreVerse(sourceVerse) : sourceVerse;
          newVerses[sourceKey] = restoredVerse;
        }
      } catch (err) {
        console.error(`Failed to load source verse ${sourceKey} from ${sourceMs}:`, err);
      }

      // Load parallel verses in parallel — each parallel target may resolve to
      // a different manuscript (EOTC fallback for non-WEB-canon books).
      const parallelResults = await Promise.all(
        selectedParallels.map(async (parallel) => {
          const key = `${parallel.target_book}_${parallel.target_chapter}_${parallel.target_verse}`;
          const ms = resolveManuscript(sourceManuscript, parallel.target_book);
          try {
            const parallelVerse = await getVerse(ms, parallel.target_book, parallel.target_chapter, parallel.target_verse);
            if (!parallelVerse) return null;
            const restoredVerse = showRestored ? await restoreVerse(parallelVerse) : parallelVerse;
            return [key, restoredVerse];
          } catch (err) {
            console.error(`Failed to load parallel verse ${key} from ${ms}:`, err);
            return null;
          }
        })
      );
      for (const entry of parallelResults) {
        if (entry) newVerses[entry[0]] = entry[1];
      }

      setVerses(newVerses);
    }

    loadVerses();
  }, [selectedParallels, book, chapter, verse, showRestored, sourceManuscript]);

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
      <div className="pp-loading">
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
    <div className="pp-viewer">
      <div className="pp-header">
        <h3>Parallel Passages</h3>
        <p>{parallelPassages.length} parallel passage{parallelPassages.length !== 1 ? 's' : ''} found</p>
      </div>

      <div className="pp-content">
        {error && (
          <div className="pp-error">
            <strong>Error:</strong> {error}
          </div>
        )}

        <div>
          <h4 className="pp-section-title">Select passages to compare (max 2):</h4>
          <div className="pp-selector-list">
            {parallelPassages.map((parallel) => {
              const isSelected = selectedParallels.some(p =>
                p.target_book === parallel.target_book &&
                p.target_chapter === parallel.target_chapter &&
                p.target_verse === parallel.target_verse
              );

              return (
                <button
                  key={`${parallel.target_book}_${parallel.target_chapter}_${parallel.target_verse}`}
                  type="button"
                  onClick={() => handleSelectParallel(parallel)}
                  className={`pp-selector-btn${isSelected ? ' active' : ''}`}
                >
                  {formatCrossReference(parallel)}
                  <span className="pp-selector-type">
                    ({getParallelTypeDisplayName(parallel.parallelType)})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="pp-toggle-row">
          <button
            type="button"
            onClick={() => setShowRestored(!showRestored)}
            className={`pp-toggle-btn${showRestored ? ' active' : ''}`}
          >
            {showRestored ? '✦ Names Restored' : 'Show Restored Names'}
          </button>
        </div>

        {selectedParallels.length > 0 && (
          <div
            className="pp-grid"
            style={{ gridTemplateColumns: `repeat(${selectedParallels.length + 1}, 1fr)` }}
          >
            <div className="pp-source">
              <h4 className="pp-card-title">{book} {chapter}:{verse}</h4>
              {sourceVerse ? (
                <>
                  <div
                    className="pp-verse-text"
                    dangerouslySetInnerHTML={{
                      __html: sanitize(showRestored && sourceVerse.restorations
                        ? highlightRestoredNames(sourceVerse.text, sourceVerse.restorations)
                        : sourceVerse.text)
                    }}
                  />
                  <div className="pp-citation">{sourceVerse.manuscripts?.name || sourceVerse.manuscript || 'World English Bible'}</div>
                </>
              ) : (
                <p className="pp-loading-text">Loading...</p>
              )}
            </div>

            {selectedParallels.map((parallel) => {
              const key = `${parallel.target_book}_${parallel.target_chapter}_${parallel.target_verse}`;
              const parallelVerse = verses[key];

              return (
                <div key={key} className="pp-parallel">
                  <h4 className="pp-card-title">
                    {formatCrossReference(parallel)}
                    <button
                      type="button"
                      className="pp-jump-btn"
                      aria-label={`Jump to ${formatCrossReference(parallel)}`}
                      onClick={() => onNavigate({
                        book: parallel.target_book,
                        chapter: parallel.target_chapter,
                        verse: parallel.target_verse
                      })}
                    >
                      →
                    </button>
                  </h4>
                  {parallelVerse ? (
                    <>
                      <div
                        className="pp-verse-text"
                        dangerouslySetInnerHTML={{
                          __html: sanitize(showRestored && parallelVerse.restorations
                            ? highlightRestoredNames(parallelVerse.text, parallelVerse.restorations)
                            : parallelVerse.text)
                        }}
                      />
                      <div className="pp-citation">{parallelVerse.manuscripts?.name || parallelVerse.manuscript || 'World English Bible'}</div>
                    </>
                  ) : (
                    <p className="pp-loading-text">Loading...</p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {selectedParallels.length === 0 && (
          <p className="pp-empty">Select a parallel passage above to compare</p>
        )}
      </div>
    </div>
  );
};

export default ParallelPassageViewer;
