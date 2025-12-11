/**
 * ManuscriptViewer Component
 * Displays Bible verses in multiple manuscripts (Hebrew, Greek, English)
 * with divine name restoration toggle
 */

import React, { useState, useEffect } from 'react';
import { getVerse, getChapter } from '../api/verses';
import { restoreVerse, restoreChapter, preloadNameMappings } from '../api/restoration';
import { getCrossReferences, getOTQuotations, highlightQuotations } from '../api/crossReferences';
import { getCanonicalBook } from '../api/canonicalBooks';
import ManuscriptSkeleton from './ManuscriptSkeleton';
import ManuscriptCarousel from './ManuscriptCarousel';
import '../styles/manuscripts.css';

const ManuscriptViewer = ({ book, chapter, verse, onVerseChange, isReaderMode }) => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRestored, setShowRestored] = useState(true);
  const [viewMode, setViewMode] = useState('chapter'); // Default to Chapter View for better context
  const [crossReferences, setCrossReferences] = useState([]);
  const [crossRefCount, setCrossRefCount] = useState(0);
  const [quotations, setQuotations] = useState([]);
  const [bookName, setBookName] = useState('');

  // Preload name mappings on component mount to optimize performance
  useEffect(() => {
    preloadNameMappings().catch(err => {
      console.error('Failed to preload name mappings:', err);
    });
  }, []);

  // Fetch canonical book name
  useEffect(() => {
    async function loadBookName() {
      if (book) {
        try {
          // Try to get canonical name, fallback to book code
          const bookData = await getCanonicalBook(book);
          setBookName(bookData?.book_name || book);
        } catch (err) {
          console.warn('Failed to load book name:', err);
          setBookName(book);
        }
      }
    }
    loadBookName();
  }, [book]);

  // Effect: Force Chapter View when Reader Mode is enabled
  useEffect(() => {
    if (isReaderMode) {
      setViewMode('chapter');
    }
  }, [isReaderMode]);

  useEffect(() => {
    async function loadVerses() {
      try {
        setLoading(true);
        setError(null);

        // Define all manuscripts to try loading
        // Order: English first, then Hebrew, Greek, Latin, Aramaic
        const allManuscripts = [
          // English (displayed first for accessibility)
          { code: 'WEB', name: 'World English Bible', lang: 'english' },

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

          // Latin
          { code: 'VUL', name: 'Vulgate', lang: 'latin' },

          // Aramaic
          { code: 'ONKELOS', name: 'Targum Onkelos', lang: 'aramaic' },
          { code: 'PESHITTA', name: 'Peshitta (Syriac)', lang: 'aramaic' }
        ];

        // Try to load from all manuscripts (verse or chapter mode)
        const manuscriptPromises = allManuscripts.map(async (ms) => {
          try {
            if (viewMode === 'chapter') {
              // Chapter mode: fetch all verses in the chapter
              const verses = await getChapter(ms.code, book, chapter);
              return verses && verses.length > 0 ? {
                name: ms.name,
                lang: ms.lang,
                manuscript: ms.code,
                verses: verses
              } : null;
            } else {
              // Verse mode: fetch single verse
              const v = await getVerse(ms.code, book, chapter, verse);
              return v ? { ...v, name: ms.name, lang: ms.lang } : null;
            }
          } catch {
            return null;
          }
        });

        const results = await Promise.all(manuscriptPromises);

        // Filter out null results (failed fetches)
        const validManuscripts = results.filter(m => m !== null);

        // Apply restoration if enabled
        const processedManuscripts = showRestored
          ? await Promise.all(validManuscripts.map(async (m) => {
            if (viewMode === 'chapter') {
              const restoredVerses = await restoreChapter(m.verses);
              return { ...m, verses: restoredVerses };
            } else {
              return restoreVerse(m);
            }
          }))
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
  }, [book, chapter, verse, showRestored, viewMode]);

  // Load cross-references for the current verse
  useEffect(() => {
    async function loadCrossReferences() {
      if (!book || !chapter || !verse) return;

      try {
        const refs = await getCrossReferences(book, chapter, verse);
        setCrossReferences(refs);
        setCrossRefCount(refs.length);
      } catch (err) {
        console.error('Failed to load cross-references:', err);
        setCrossReferences([]);
        setCrossRefCount(0);
      }
    }

    loadCrossReferences();
  }, [book, chapter, verse]);

  // Load OT quotations for NT verses
  useEffect(() => {
    async function loadQuotations() {
      if (!book || !chapter || !verse) return;

      try {
        // Get the English (WEB) verse text for quotation detection
        const webManuscript = manuscripts.find(ms => ms.manuscript === 'WEB');
        if (!webManuscript) {
          return;
        }

        const quots = await getOTQuotations(book, chapter, verse, webManuscript.text);
        setQuotations(quots);
      } catch (err) {
        console.error('Failed to load quotations:', err);
        setQuotations([]);
      }
    }

    if (manuscripts.length > 0) {
      loadQuotations();
    }
  }, [book, chapter, verse, manuscripts]);

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

  const highlightRestoredNames = (text, restorations, manuscriptCode) => {
    let highlightedText = text;

    // Apply quotation highlighting ONLY to WEB (English) manuscript
    // (quotations are detected from WEB text with English quotes)
    if (quotations && quotations.length > 0 && manuscriptCode === 'WEB') {
      highlightedText = highlightQuotations(highlightedText, quotations);
    }

    // Then apply divine name restoration highlights
    if (restorations && restorations.length > 0) {
      restorations.forEach(restoration => {
        const pattern = new RegExp(restoration.restored, 'g');
        highlightedText = highlightedText.replace(
          pattern,
          `<span class="restored-name" title="Restored from: ${restoration.original}">${restoration.restored}</span>`
        );
      });
    }

    return highlightedText;
  };

  if (loading) {
    return <ManuscriptSkeleton />;
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
    // Ethiopian Orthodox books that aren't imported yet
    const ethiopianBooks = ['ENO', 'JUB', 'MEQ'];
    const isEthiopian = ethiopianBooks.includes(book);

    return (
      <div className="manuscript-viewer">
        <div className="manuscript-error">
          <h3>No manuscripts available for {book} {chapter}:{verse}</h3>
          {isEthiopian ? (
            <>
              <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#666' }}>
                <strong>{book === 'ENO' ? '1 Enoch (Ethiopic Enoch)' : book === 'JUB' ? 'Jubilees' : 'Meqabyan (Ethiopian Maccabees)'}</strong> is an <strong>Ethiopian Orthodox</strong> book that is not yet available in our manuscript database.
              </p>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                Ethiopian Orthodox books are currently being prepared for import. These books are unique to the Ethiopian canon and require specialized manuscript sources.
              </p>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>
                <strong>Currently available:</strong> All 66 Protestant canon books + 18 deuterocanonical books (Tobit, Judith, Wisdom, Sirach, Baruch, 1-4 Maccabees, 1-2 Esdras, Additions to Esther/Daniel, Prayer of Manasseh, Psalm 151)
              </p>
            </>
          ) : (
            <>
              <p style={{ marginTop: '1rem', fontSize: '0.95rem', color: '#666' }}>
                This verse may be from a book that is not yet included in all manuscripts.
              </p>
              <p style={{ marginTop: '0.75rem', fontSize: '0.9rem', color: '#666' }}>
                Most deuterocanonical books are available in World English Bible (WEB), with additional support in Septuagint (LXX) and Vulgate (VUL) being added.
              </p>
            </>
          )}
          <p style={{ marginTop: '1rem', fontSize: '0.9rem', fontStyle: 'italic', color: '#888' }}>
            Please try selecting a different book from the dropdown menu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="manuscript-viewer">
      {/* Enhanced Hero Section */}
      <div className="manuscript-header hero-section">
        <h1>All4Yah Manuscript Viewer</h1>
        <p className="tagline">"Restoring the Word, verse by verse."</p>

        <div className="mission-banner">
          <div className="mission-content">
            <h2>✦ Restored Divine Names</h2>
            <p className="mission-text">
              Experience Scripture as originally written. We restore the sacred names that were
              replaced by tradition: <strong className="restored-name-example">יהוה</strong> (YHWH) appears as <strong className="restored-name-example">Yahuah</strong>,
              <strong className="restored-name-example"> יהושע</strong> (Yehoshua) / <strong className="restored-name-example">Ἰησοῦς</strong> (Iesous) as <strong className="restored-name-example">Yahusha</strong>,
              and <strong className="restored-name-example">אלהים</strong> (Elohim) / <strong className="restored-name-example">θεός</strong> (theos) as <strong className="restored-name-example">Elohim</strong>.
            </p>
            <div className="mission-stats">
              <span className="stat"><strong>5,518×</strong> Yahuah in OT</span>
              <span className="stat-divider">•</span>
              <span className="stat"><strong>12 manuscripts</strong></span>
              <span className="stat-divider">•</span>
              <span className="stat"><strong>248,871 verses</strong></span>
            </div>
          </div>
        </div>

        <p className="verse-reference">
          <span className="verse-number">{book} {chapter}:{verse}</span>
          Parallel Manuscript Display
        </p>
      </div>

      {/* View Mode Toggle */}
      <div className="view-mode-toggle" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <button
          className={`view-toggle-btn ${viewMode === 'verse' ? 'active' : ''}`}
          onClick={() => setViewMode('verse')}
          aria-pressed={viewMode === 'verse'}
        >
          📄 Verse View
        </button>
        <button
          className={`view-toggle-btn ${viewMode === 'chapter' ? 'active' : ''}`}
          onClick={() => setViewMode('chapter')}
          aria-pressed={viewMode === 'chapter'}
        >
          📖 Chapter View
        </button>
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

      {/* Modern Carousel Manuscript Display */}
      <ManuscriptCarousel
        manuscripts={manuscripts}
        viewMode={viewMode}
        showRestored={showRestored}
        crossRefCount={crossRefCount}
        crossReferences={crossReferences}
        quotations={quotations}
        highlightRestoredNames={highlightRestoredNames}
        highlightQuotations={highlightQuotations}
        getLanguageClass={getLanguageClass}
        bookName={bookName}
      />

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
