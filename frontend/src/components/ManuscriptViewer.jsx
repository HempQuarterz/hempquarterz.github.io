/**
 * ManuscriptViewer Component
 * Displays Bible verses in multiple manuscripts (Hebrew, Greek, English)
 * with divine name restoration toggle
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getVerse, getChapter } from '../api/verses';
import { restoreVerse, restoreChapter, preloadNameMappings } from '../api/restoration';
import { getCrossReferences, getOTQuotations, highlightQuotations } from '../api/crossReferences';
import { BIBLE_BOOKS } from '../utils/bibleStructure';
import ManuscriptSkeleton from './ManuscriptSkeleton';
import ManuscriptCarousel from './ManuscriptCarousel';
import InterlinearViewer from './InterlinearViewer';
import { useDockContext } from './navigation/GlobalDockProvider';
import { AuroraBackground } from './ui/AuroraBackground';
import '../styles/manuscripts.css';

// Animation variants for verse transitions
const contentVariants = {
  initial: { opacity: 0, y: 20 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

const ManuscriptViewer = ({
  book,
  chapter,
  verse,
  onVerseChange,
  onBookChange,
  onChapterChange,
  isReaderMode,
  children
}) => {
  const [manuscripts, setManuscripts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showInterlinear, setShowInterlinear] = useState(false);
  const [crossReferences, setCrossReferences] = useState([]);
  const [crossRefCount, setCrossRefCount] = useState(0);
  const [quotations, setQuotations] = useState([]);
  const [bookName, setBookName] = useState('');

  // Get settings from dock context (provided by GlobalDockProvider)
  const dockContext = useDockContext();
  const showRestored = dockContext?.showRestored ?? true;
  const viewMode = dockContext?.viewMode ?? 'chapter';

  // Preload name mappings on component mount
  useEffect(() => {
    preloadNameMappings().catch(console.error);
  }, []);

  // Resolve book name from local data (avoids async race condition)
  useEffect(() => {
    if (book) {
      const found = BIBLE_BOOKS.find(b => b.id === book);
      setBookName(found?.name || book);
    }
  }, [book]);

  // Force Chapter View when Reader Mode is enabled
  useEffect(() => {
    if (isReaderMode && dockContext?.setViewMode) {
      dockContext.setViewMode('chapter');
    }
  }, [isReaderMode, dockContext]);

  useEffect(() => {
    async function loadVerses() {
      try {
        setLoading(true);
        setError(null);

        const allManuscripts = [
          { code: 'WEB', name: 'World English Bible', lang: 'english' },
          { code: 'WLC', name: 'Westminster Leningrad Codex', lang: 'hebrew' },
          { code: 'DSS', name: 'Dead Sea Scrolls', lang: 'hebrew' },
          { code: 'LXX', name: 'Septuagint (LXX)', lang: 'greek' },
          { code: 'SBLGNT', name: 'SBL Greek New Testament', lang: 'greek' },
          { code: 'BYZMT', name: 'Byzantine Majority Text', lang: 'greek' },
          { code: 'TR', name: 'Textus Receptus', lang: 'greek' },
          { code: 'N1904', name: 'Nestle 1904', lang: 'greek' },
          { code: 'SIN', name: 'Codex Sinaiticus', lang: 'greek' },
          { code: 'VUL', name: 'Vulgate', lang: 'latin' },
          { code: 'ONKELOS', name: 'Targum Onkelos', lang: 'aramaic' },
          { code: 'PESHITTA', name: 'Peshitta (Syriac)', lang: 'aramaic' }
        ];

        const manuscriptPromises = allManuscripts.map(async (ms) => {
          try {
            if (viewMode === 'chapter') {
              const verses = await getChapter(ms.code, book, chapter);
              return verses && verses.length > 0 ? {
                name: ms.name,
                lang: ms.lang,
                manuscript: ms.code,
                verses: verses
              } : null;
            } else {
              const v = await getVerse(ms.code, book, chapter, verse);
              return v ? { ...v, name: ms.name, lang: ms.lang } : null;
            }
          } catch {
            return null;
          }
        });

        const results = await Promise.all(manuscriptPromises);
        const validManuscripts = results.filter(m => m !== null);

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

  // Load Cross References & Quotations
  useEffect(() => {
    if (book && chapter && verse) {
      getCrossReferences(book, chapter, verse)
        .then(refs => { setCrossReferences(refs); setCrossRefCount(refs.length); })
        .catch(() => { setCrossReferences([]); setCrossRefCount(0); });
    }
  }, [book, chapter, verse]);

  useEffect(() => {
    if (manuscripts.length > 0 && book && chapter && verse) {
      const webManuscript = manuscripts.find(ms => ms.manuscript === 'WEB');
      if (webManuscript) {
        getOTQuotations(book, chapter, verse, webManuscript.text)
          .then(setQuotations)
          .catch(() => setQuotations([]));
      }
    }
  }, [book, chapter, verse, manuscripts]);

  // Language & Highlight Helpers
  const getLanguageClass = (lang) => {
    if (lang === 'hebrew' || lang === 'aramaic') return 'hebrew-text';
    if (lang === 'greek') return 'greek-text';
    return 'english-text';
  };

  const highlightRestoredNames = (text, restorations, manuscriptCode) => {
    let highlightedText = text;
    if (quotations?.length > 0 && manuscriptCode === 'WEB') {
      highlightedText = highlightQuotations(highlightedText, quotations);
    }
    if (restorations?.length > 0) {
      restorations.forEach(r => {
        const pattern = new RegExp(r.restored, 'g');
        highlightedText = highlightedText.replace(
          pattern,
          `<span class="restored-name" title="Restored from: ${r.original}">${r.restored}</span>`
        );
      });
    }
    return highlightedText;
  };

  if (loading) return <ManuscriptSkeleton />;

  return (
    <div className="manuscript-page-wrapper">
      {/* 1. Spatial Background */}
      <div className="manuscript-bg-layer">
        <AuroraBackground />
      </div>

      {/* Note: Navigation is now handled by CovenantDock at App level */}

      {/* 2. Main Content Area (Glass Scroll) */}
      <div className="manuscript-content-area">
        <div className="manuscript-inner">

          {/* Header Info - Simplified */}
          <div className="manuscript-page-header">
            <h1 className="manuscript-page-title">
              {bookName} {chapter}
            </h1>
            <p className="manuscript-page-subtitle">
              {viewMode === 'chapter' ? 'Full Chapter' : `Verse ${verse}`} &bull; {manuscripts.length} Manuscripts Loaded
            </p>
            {/* Interlinear Toggle - only shows in verse mode */}
            {viewMode === 'verse' && (
              <button
                onClick={() => setShowInterlinear(!showInterlinear)}
                className={`interlinear-toggle ${
                  showInterlinear ? 'interlinear-toggle--active' : 'interlinear-toggle--inactive'
                }`}
              >
                {showInterlinear ? 'Hide Interlinear' : 'Show Interlinear'}
              </button>
            )}
          </div>

          {/* Error Display */}
          {error && <div className="error-banner">{error}</div>}

          {/* Empty State / Deuterocanonical Notice */}
          {!loading && !error && manuscripts.length === 0 && (
            <div className="glass-panel empty-state-panel">
              <h3 className="text-brand-gold" style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>No Manuscripts Available</h3>
              <p className="text-gray-300">This book may be currently unavailable or requires specific imports.</p>
            </div>
          )}

          {/* The Reader (Carousel) - with verse transition animations */}
          <AnimatePresence mode="wait">
            {!loading && !error && manuscripts.length > 0 && (
              <motion.div
                key={`${book}-${chapter}-${verse}-${viewMode}`}
                variants={contentVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                style={{ position: 'relative', zIndex: 10 }}
              >
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
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interlinear Word-by-Word View */}
          {showInterlinear && viewMode === 'verse' && (
            <div className="content-section" style={{ position: 'relative', zIndex: 10 }}>
              <InterlinearViewer
                sourceManuscript="WLC"
                targetManuscript="WEB"
                book={book}
                chapter={chapter}
                verse={verse}
              />
            </div>
          )}

          {/* Render children (like Consolidated Panel) */}
          {children && (
            <div className="content-section--lg" style={{ position: 'relative', zIndex: 10 }}>
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManuscriptViewer;
