/**
 * ManuscriptViewer Component
 * Displays Bible verses in multiple manuscripts (Hebrew, Greek, English)
 * with divine name restoration toggle
 */

import React, { useState, useEffect } from 'react';
import { getVerse } from '../api/verses';
import { restoreVerse } from '../api/restoration';
import Loading from './Loading';
import '../styles/manuscripts.css';

const ManuscriptViewer = ({ book, chapter, verse }) => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRestored, setShowRestored] = useState(true);

  useEffect(() => {
    async function loadVerses() {
      try {
        setLoading(true);
        setError(null);

        // Determine which manuscripts to load based on testament
        const isOldTestament = !['MAT', 'MRK', 'LUK', 'JHN', 'ACT', 'ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD', 'REV'].includes(book);

        const manuscriptPromises = [];

        if (isOldTestament) {
          // Old Testament: WLC (Hebrew) + WEB (English)
          manuscriptPromises.push(
            getVerse('WLC', book, chapter, verse)
              .then(v => ({ ...v, name: 'Westminster Leningrad Codex', lang: 'hebrew' }))
              .catch(() => null)
          );
          manuscriptPromises.push(
            getVerse('WEB', book, chapter, verse)
              .then(v => ({ ...v, name: 'World English Bible', lang: 'english' }))
              .catch(() => null)
          );
        } else {
          // New Testament: SBLGNT (Greek) + WEB (English)
          manuscriptPromises.push(
            getVerse('SBLGNT', book, chapter, verse)
              .then(v => ({ ...v, name: 'SBL Greek New Testament', lang: 'greek' }))
              .catch(() => null)
          );
          manuscriptPromises.push(
            getVerse('WEB', book, chapter, verse)
              .then(v => ({ ...v, name: 'World English Bible', lang: 'english' }))
              .catch(() => null)
          );
        }

        const results = await Promise.all(manuscriptPromises);

        // Filter out null results (failed fetches)
        const validManuscripts = results.filter(m => m !== null);

        // Apply restoration if enabled
        const processedManuscripts = showRestored
          ? await Promise.all(validManuscripts.map(m => restoreVerse(m)))
          : validManuscripts;

        setManuscripts(processedManuscripts);
        setLoading(false);
      } catch (err) {
        console.error('Error loading manuscripts:', err);
        setError(err.message || 'Failed to load manuscripts');
        setLoading(false);
      }
    }

    if (book && chapter && verse) {
      loadVerses();
    }
  }, [book, chapter, verse, showRestored]);

  const handleToggleRestoration = () => {
    setShowRestored(!showRestored);
  };

  const getLanguageClass = (lang) => {
    switch (lang) {
      case 'hebrew':
        return 'hebrew-text';
      case 'greek':
        return 'greek-text';
      case 'english':
      default:
        return 'english-text';
    }
  };

  const highlightRestoredNames = (text, restorations) => {
    if (!restorations || restorations.length === 0) {
      return text;
    }

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

  if (loading) {
    return (
      <div className="manuscript-viewer">
        <Loading type="manuscripts" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="manuscript-viewer">
        <div className="manuscript-error">
          <strong>Error loading manuscripts:</strong> {error}
        </div>
      </div>
    );
  }

  if (manuscripts.length === 0) {
    return (
      <div className="manuscript-viewer">
        <div className="manuscript-error">
          No manuscripts found for {book} {chapter}:{verse}
        </div>
      </div>
    );
  }

  return (
    <div className="manuscript-viewer">
      {/* Header */}
      <div className="manuscript-header">
        <h1>All4Yah Manuscript Viewer</h1>
        <p className="verse-reference">
          <span className="verse-number">{book} {chapter}:{verse}</span>
          Parallel Manuscript Display
        </p>
      </div>

      {/* Restoration Toggle */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button
          className={`restoration-toggle ${showRestored ? 'active' : ''}`}
          onClick={handleToggleRestoration}
          aria-pressed={showRestored}
        >
          {showRestored ? '✦ Names Restored' : 'Show Restored Names'}
        </button>
        {showRestored && (
          <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666', fontStyle: 'italic' }}>
            Divine names displayed as Yahuah, Yahusha, Elohim
          </p>
        )}
      </div>

      {/* Parallel Manuscript Display */}
      <div className="parallel-view">
        {manuscripts.map((ms, index) => (
          <div key={index} className="manuscript-panel">
            <h3>{ms.name}</h3>
            <div className="manuscript-meta">
              {ms.manuscript} • {ms.lang === 'hebrew' ? 'Hebrew' : ms.lang === 'greek' ? 'Greek' : 'English'}
            </div>
            <div
              className={getLanguageClass(ms.lang)}
              dangerouslySetInnerHTML={{
                __html: showRestored && ms.restorations
                  ? highlightRestoredNames(ms.text, ms.restorations)
                  : ms.text
              }}
            />
            {showRestored && ms.restored && ms.restorations && ms.restorations.length > 0 && (
              <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #e0e0e0', paddingTop: '0.75rem' }}>
                <strong>Restorations:</strong>
                <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                  {ms.restorations.map((r, i) => (
                    <li key={i}>
                      {r.original} → <strong className="restored-name">{r.restored}</strong>
                      {r.strongNumber && ` (${r.strongNumber})`}
                      {r.count && ` - ${r.count}×`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Info Footer */}
      <div style={{ textAlign: 'center', marginTop: '3rem', padding: '2rem', borderTop: '2px solid #e0e0e0' }}>
        <p style={{ fontSize: '0.9rem', color: '#666', maxWidth: '700px', margin: '0 auto' }}>
          <strong>All4Yah Mission:</strong> Restoring the Word, verse by verse.
          We use original manuscripts and transparent scholarship to reveal Scripture
          with the original names of Yahuah and Yahusha.
        </p>
      </div>
    </div>
  );
};

export default ManuscriptViewer;
