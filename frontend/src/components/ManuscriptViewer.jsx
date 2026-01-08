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
import { SpatialSidebar } from './SpatialSidebar';
import { AuroraBackground } from './ui/AuroraBackground';
import '../styles/manuscripts.css';

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
  const [showRestored, setShowRestored] = useState(true);
  const [viewMode, setViewMode] = useState('chapter');
  const [crossReferences, setCrossReferences] = useState([]);
  const [crossRefCount, setCrossRefCount] = useState(0);
  const [quotations, setQuotations] = useState([]);
  const [bookName, setBookName] = useState('');

  // Preload name mappings on component mount
  useEffect(() => {
    preloadNameMappings().catch(console.error);
  }, []);

  // Fetch canonical book name
  useEffect(() => {
    async function loadBookName() {
      if (book) {
        try {
          const bookData = await getCanonicalBook(book);
          setBookName(bookData?.book_name || book);
        } catch (err) {
          setBookName(book);
        }
      }
    }
    loadBookName();
  }, [book]);

  // Force Chapter View when Reader Mode is enabled
  useEffect(() => {
    if (isReaderMode) setViewMode('chapter');
  }, [isReaderMode]);

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
    <div className="relative min-h-screen text-slate-100 flex">
      {/* 1. Spatial Background */}
      <div className="fixed inset-0 z-[-1]">
        <AuroraBackground />
      </div>

      {/* 2. Spatial Sidebar (Controls) */}
      <SpatialSidebar
        currentBook={book}
        currentChapter={chapter}
        currentVerse={verse}
        onBookChange={onBookChange}
        onChapterChange={onChapterChange}
        onVerseChange={onVerseChange}
        showRestored={showRestored}
        toggleRestoration={() => setShowRestored(!showRestored)}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* 3. Main Content Area (Glass Scroll) */}
      <div className="flex-1 ml-16 p-4 md:p-8 transition-all duration-300">
        <div className="max-w-4xl mx-auto">

          {/* Header Info - Simplified */}
          <div className="mb-8 text-center">
            <h1 className="font-serif text-3xl md:text-5xl text-brand-gold mb-2 drop-shadow-lg">
              {bookName} {chapter}
            </h1>
            <p className="text-sm text-gray-400 font-mono tracking-widest uppercase">
              {viewMode === 'chapter' ? 'Full Chapter' : `Verse ${verse}`} • {manuscripts.length} Manuscripts Loaded
            </p>
          </div>

          {/* Error Display */}
          {error && <div className="p-4 bg-red-900/50 rounded-lg text-red-200">{error}</div>}

          {/* Empty State / Deuterocanonical Notice */}
          {!loading && !error && manuscripts.length === 0 && (
            <div className="glass-panel p-8 text-center rounded-2xl">
              <h3 className="text-xl text-brand-gold mb-4">No Manuscripts Available</h3>
              <p className="text-gray-300">This book may be currently unavailable or requires specific imports.</p>
            </div>
          )}

          {/* The Reader (Carousel) */}
          {!loading && !error && manuscripts.length > 0 && (
            <div className="relative z-10">
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
            </div>
          )}

          {/* Render children (like Consolidated Panel) */}
          {children && (
            <div className="mt-8 relative z-10">
              {children}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ManuscriptViewer;
