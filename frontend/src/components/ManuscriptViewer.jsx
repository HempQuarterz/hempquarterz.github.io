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

        // Define all manuscripts to try loading
        const allManuscripts = [
          // Hebrew OT
          { code: 'WLC', name: 'Westminster Leningrad Codex', lang: 'hebrew' },
          { code: 'DSS', name: 'Dead Sea Scrolls', lang: 'hebrew' },

          // Greek (LXX for OT, NT manuscripts for NT)
          { code: 'LXX', name: 'Septuagint (LXX)', lang: 'greek' },
          { code: 'SBLGNT', name: 'SBL Greek New Testament', lang: 'greek' },
          { code: 'BYZMT', name: 'Byzantine Majority Text', lang: 'greek' },
          { code: 'TR', name: 'Textus Receptus', lang: 'greek' },
          { code: 'N1904', name: 'Nestle 1904', lang: 'greek' },
          { code: 'SIN', name: 'Codex Sinaiticus', lang: 'greek' },

          // Aramaic
          { code: 'ONKELOS', name: 'Targum Onkelos', lang: 'aramaic' },

          // Latin
          { code: 'VUL', name: 'Vulgate', lang: 'latin' },

          // English
          { code: 'WEB', name: 'World English Bible', lang: 'english' }
        ];

        // Try to load from all manuscripts
        const manuscriptPromises = allManuscripts.map(ms =>
          getVerse(ms.code, book, chapter, verse)
            .then(v => v ? { ...v, name: ms.name, lang: ms.lang } : null)
            .catch(() => null)
        );

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
      case 'aramaic':
        return 'hebrew-text'; // Aramaic uses same RTL styling as Hebrew
      case 'latin':
        return 'english-text'; // Latin uses same LTR styling as English
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
          <h3>No manuscripts available for {book} {chapter}:{verse}</h3>
          <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#666' }}>
            This verse may be from a deuterocanonical book that is not yet included in the WLC, SBLGNT, or WEB manuscripts.
            Deuterocanonical books are available in the Septuagint (LXX) and Vulgate (VUL) manuscripts.
          </p>
          <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>
            We're working on expanding manuscript coverage. Please try selecting a different book.
          </p>
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
              {ms.manuscript} • {ms.lang === 'hebrew' ? 'Hebrew' : ms.lang === 'greek' ? 'Greek' : ms.lang === 'aramaic' ? 'Aramaic' : ms.lang === 'latin' ? 'Latin' : 'English'}
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

      {/* Deuterocanonical Notice */}
      {['1ES', '1MA', '2ES', '2MA', '3MA', '4MA', 'BAR', 'BEL', 'ESG', 'JDT', 'LJE', 'MAN', 'PS2', 'S3Y', 'SIR', 'SUS', 'TOB', 'WIS', 'MEQ', 'ENO', 'JUB'].includes(book) && (
        <div style={{
          marginTop: '2rem',
          padding: '1.5rem',
          background: '#fff3cd',
          border: '1px solid #ffc107',
          borderRadius: '8px',
          color: '#856404'
        }}>
          <h4 style={{ margin: '0 0 0.75rem 0', color: '#856404', fontSize: '1rem' }}>
            📖 Deuterocanonical Book Notice
          </h4>
          <p style={{ margin: '0 0 0.5rem 0', fontSize: '0.95rem', lineHeight: '1.6' }}>
            <strong>{book}</strong> is a deuterocanonical book recognized by Catholic and Orthodox traditions but not included in the Protestant 66-book canon.
          </p>
          <p style={{ margin: 0, fontSize: '0.9rem', lineHeight: '1.6' }}>
            <strong>Available manuscripts:</strong> World English Bible (WEB) in English, Septuagint (LXX) in Greek, and Vulgate (VUL) in Latin.
            All deuterocanonical books are now available with parallel manuscript views.
          </p>
        </div>
      )}

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
