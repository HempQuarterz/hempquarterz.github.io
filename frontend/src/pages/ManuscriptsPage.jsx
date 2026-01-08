import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ManuscriptViewer from '../components/ManuscriptViewer';
import ConsolidatedPanel from '../components/ConsolidatedPanel';
import GematriaPanel from '../components/GematriaPanel';
import { setSelectedVerse } from '../manuscriptsSlice';
import '../styles/manuscripts.css';

const ManuscriptsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVerse = useSelector(state => state.manuscripts.selectedVerse);
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showGematria, setShowGematria] = useState(false);

  // Sync URL params with Redux state
  useEffect(() => {
    const book = searchParams.get('book');
    const chapter = searchParams.get('chapter');
    const verse = searchParams.get('verse');

    if (book && chapter && verse) {
      dispatch(setSelectedVerse({
        book,
        chapter: parseInt(chapter),
        verse: parseInt(verse)
      }));
    }
  }, [dispatch, searchParams]);

  const handleVerseChange = (newVerse) => {
    dispatch(setSelectedVerse(newVerse));
    setSearchParams({
      book: newVerse.book,
      chapter: newVerse.chapter,
      verse: newVerse.verse
    });
  };

  const toggleSearch = () => setShowSearch(!showSearch);
  const toggleGematria = () => setShowGematria(!showGematria);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Toggle Reader Mode with 'R'
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        setIsReaderMode(prev => !prev);
      }
      // Toggle Gematria with 'G'
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        setShowGematria(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={`fade-in ${isReaderMode ? 'reader-mode-active' : ''}`}>
      {/* Manuscript Viewer - Spatial Layout */}
      <ManuscriptViewer
        book={selectedVerse.book}
        chapter={selectedVerse.chapter}
        verse={selectedVerse.verse}
        onVerseChange={handleVerseChange}
        onBookChange={(b) => handleVerseChange({ ...selectedVerse, book: b, chapter: 1, verse: 1 })}
        onChapterChange={(c) => handleVerseChange({ ...selectedVerse, chapter: c, verse: 1 })}
        isReaderMode={isReaderMode}
      >
        {!isReaderMode && (
          <div className="consolidated-panel-wrapper">
            <ConsolidatedPanel
              book={selectedVerse.book}
              chapter={selectedVerse.chapter}
              verse={selectedVerse.verse}
              currentVerseText=""
              onNavigate={handleVerseChange}
            />
          </div>
        )}
      </ManuscriptViewer>

      {/* Search & Gematria Overlays (preserved, but positioned z-index high) */}
      <div style={{ position: 'fixed', top: '1rem', right: '1rem', zIndex: 50, display: 'flex', gap: '0.5rem' }}>
        {/* Search Button */}
        <button
          onClick={toggleSearch}
          className="glass-button-icon"
          title="Search"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        {/* Gematria Button */}
        <button
          onClick={toggleGematria}
          className="glass-button-icon"
          title="Gematria"
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.1)',
            backdropFilter: 'blur(10px)',
            border: '1px solid rgba(255,255,255,0.2)',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s ease'
          }}
        >
          <span style={{ fontWeight: 'bold' }}>G</span>
        </button>
      </div>

      {showSearch && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl max-w-xl w-full border border-gray-700 relative">
            <button onClick={toggleSearch} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <h2 className="text-xl font-bold text-brand-gold mb-4">Scripture Search</h2>
            <p className="text-gray-400">Search functionality would go here...</p>
          </div>
        </div>
      )}

      {showGematria && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-6 rounded-2xl max-w-xl w-full border border-gray-700 relative">
            <button onClick={toggleGematria} className="absolute top-4 right-4 text-gray-400 hover:text-white">✕</button>
            <GematriaPanel
              initialText=""
              initialLanguage="hebrew"
              onClose={() => setShowGematria(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ManuscriptsPage;
