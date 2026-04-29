import React, { useState, useEffect, useCallback, lazy, Suspense } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import ManuscriptViewer from '../components/ManuscriptViewer';
import ConsolidatedPanel from '../components/ConsolidatedPanel';
import GematriaPanel from '../components/GematriaPanel';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import { BibleNavigator } from '../components/Navigation';
import { searchAll, searchVerses } from '../api/search';
import { setSelectedVerse } from '../manuscriptsSlice';
import { getAdjacentChapter } from '../utils/bibleStructure';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { listVerifiedManuscripts } from '../api/iiif';
import '../styles/manuscripts.css';

// Lazy: pulls in OpenSeadragon (~120 KB) only when the user opens the modal.
const ManuscriptImageModal = lazy(() => import('../components/ManuscriptImageModal'));

const ManuscriptsPage = () => {
  const dispatch = useDispatch();
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedVerse = useSelector(state => state.manuscripts.selectedVerse);
  useDocumentTitle(selectedVerse?.book ? `${selectedVerse.book} ${selectedVerse.chapter}` : 'Scripture');
  const [isReaderMode, setIsReaderMode] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showGematria, setShowGematria] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchFilters, setSearchFilters] = useState({});
  const [searchOffset, setSearchOffset] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [showNavigator, setShowNavigator] = useState(false);
  const [showImagery, setShowImagery] = useState(false);
  const [showToolsMenu, setShowToolsMenu] = useState(false);
  const hasImagery = listVerifiedManuscripts().length > 0;

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

  // Auto-trigger search from URL ?search= param
  useEffect(() => {
    const urlQuery = searchParams.get('search');
    if (urlQuery && !showSearch) {
      setShowSearch(true);
      handleSearch(urlQuery);
    }
    // Only run on mount / when search param changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams.get('search')]);

  const handleVerseChange = useCallback((newVerse) => {
    const update = () => {
      dispatch(setSelectedVerse(newVerse));
      setSearchParams({
        book: newVerse.book,
        chapter: newVerse.chapter,
        verse: newVerse.verse
      });
    };
    if (typeof document !== 'undefined' && document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }, [dispatch, setSearchParams]);

  const toggleSearch = () => {
    setShowSearch(prev => !prev);
    if (showSearch) {
      setSearchResults(null);
      setSearchQuery('');
      setSearchOffset(0);
      setSearchFilters({});
      // Remove search param from URL
      const next = new URLSearchParams(searchParams);
      next.delete('search');
      setSearchParams(next, { replace: true });
    }
  };
  const toggleGematria = () => setShowGematria(!showGematria);

  const handleSearch = useCallback(async (query, filters = {}) => {
    setSearchQuery(query);
    setSearchFilters(filters);
    setSearchOffset(0);
    setSearchLoading(true);

    // Update URL with search query
    const next = new URLSearchParams(searchParams);
    next.set('search', query);
    setSearchParams(next, { replace: true });

    try {
      const results = await searchAll(query, { ...filters, versesLimit: 20 });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults({ verses: [], lexicon: [], total: 0 });
    } finally {
      setSearchLoading(false);
    }
  }, [searchParams, setSearchParams]);

  const handleLoadMore = useCallback(async () => {
    const newOffset = searchOffset + 20;
    setLoadingMore(true);
    try {
      const moreVerses = await searchVerses(searchQuery, {
        ...searchFilters,
        limit: 20,
        offset: newOffset
      });
      setSearchResults(prev => ({
        ...prev,
        verses: [...(prev?.verses || []), ...moreVerses],
        total: (prev?.total || 0) + moreVerses.length
      }));
      setSearchOffset(newOffset);
    } catch (err) {
      console.error('Load more failed:', err);
    } finally {
      setLoadingMore(false);
    }
  }, [searchQuery, searchFilters, searchOffset]);

  const handleSearchNavigate = useCallback((verse) => {
    handleVerseChange(verse);
    setShowSearch(false);
    setSearchResults(null);
    setSearchQuery('');
    setSearchOffset(0);
    setSearchFilters({});
    // Remove search param from URL
    const next = new URLSearchParams(searchParams);
    next.delete('search');
    setSearchParams(next, { replace: true });
  }, [handleVerseChange, searchParams, setSearchParams]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Escape closes search
      if (e.key === 'Escape' && showSearch) {
        toggleSearch();
        return;
      }
      // '/' opens search (when not in an input)
      if (e.key === '/' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        e.preventDefault();
        setShowSearch(true);
        return;
      }
      // Toggle Reader Mode with 'R'
      if (e.key.toLowerCase() === 'r' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        setIsReaderMode(prev => !prev);
      }
      // Toggle Gematria with 'G'
      if (e.key.toLowerCase() === 'g' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        setShowGematria(prev => !prev);
      }
      // Previous chapter with '['
      if (e.key === '[' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const prev = getAdjacentChapter(selectedVerse.book, selectedVerse.chapter, 'prev');
        if (prev) handleVerseChange({ book: prev.book, chapter: prev.chapter, verse: 1 });
      }
      // Next chapter with ']'
      if (e.key === ']' && !e.ctrlKey && !e.metaKey && !e.target.matches('input, textarea')) {
        e.preventDefault();
        const next = getAdjacentChapter(selectedVerse.book, selectedVerse.chapter, 'next');
        if (next) handleVerseChange({ book: next.book, chapter: next.chapter, verse: 1 });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSearch, selectedVerse, handleVerseChange]);

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

      {/* Floating Action Buttons.
          - Hidden entirely in reader mode (max reading area).
          - Desktop: all 4 actions show as a column.
          - Mobile: a single "Tools" toggle FAB stays visible; tapping it
            reveals the 4 actions stacked above (`tools-open` modifier).
            CSS in layout-utilities.css handles the show/hide. */}
      {!isReaderMode && <div className={`floating-actions ${showToolsMenu ? 'tools-open' : ''}`}>
        {/* Mobile-only Tools toggle — shown only at <769px via CSS. */}
        <button
          onClick={() => setShowToolsMenu(prev => !prev)}
          className="floating-action-btn floating-action-tools-toggle"
          aria-label={showToolsMenu ? 'Close tools menu' : 'Open tools menu'}
          aria-expanded={showToolsMenu}
        >
          {showToolsMenu ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          )}
        </button>
        {/* Browse Books Button */}
        <button
          onClick={() => { setShowNavigator(true); setShowToolsMenu(false); }}
          className="floating-action-btn"
          aria-label="Browse books"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
        </button>
        {/* Search Button */}
        <button
          onClick={() => { toggleSearch(); setShowToolsMenu(false); }}
          className="floating-action-btn"
          aria-label="Search manuscripts"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
        </button>
        {/* Gematria Button */}
        <button
          onClick={() => { toggleGematria(); setShowToolsMenu(false); }}
          className="floating-action-btn"
          aria-label="Open Gematria calculator"
        >
          <span style={{ fontWeight: 'bold' }}>G</span>
        </button>
        {/* Manuscript Imagery Button — only shown when at least one IIIF
            manifest in the registry is flagged verified. */}
        {hasImagery && (
          <button
            onClick={() => { setShowImagery(true); setShowToolsMenu(false); }}
            className="floating-action-btn"
            aria-label="Open manuscript page imagery"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
          </button>
        )}
      </div>}

      {/* Bible Navigator - Full-screen book/chapter/verse browser */}
      <BibleNavigator
        isOpen={showNavigator}
        onClose={() => setShowNavigator(false)}
        currentSelection={selectedVerse}
        onSelectionChange={(selection) => {
          handleVerseChange(selection);
          setShowNavigator(false);
        }}
      />

      {showSearch && (
        <div className="search-modal-overlay" role="dialog" aria-modal="true" aria-label="Search manuscripts" onClick={(e) => { if (e.target === e.currentTarget) toggleSearch(); }}>
          <div className="search-modal-container">
            <button onClick={toggleSearch} className="search-modal-close" aria-label="Close search">✕</button>
            <SearchBar onSearch={handleSearch} autoFocus={true} initialQuery={searchQuery} />
            <SearchResults
              results={searchResults}
              query={searchQuery}
              onNavigate={handleSearchNavigate}
              onLoadMore={handleLoadMore}
              loading={searchLoading}
              loadingMore={loadingMore}
            />
          </div>
        </div>
      )}

      {showGematria && (
        <div className="gematria-overlay" role="dialog" aria-modal="true" aria-label="Gematria calculator" onClick={(e) => { if (e.target === e.currentTarget) toggleGematria(); }}>
          <div className="gematria-panel-container">
            <button onClick={toggleGematria} className="gematria-close-btn" aria-label="Close Gematria">&#x2715;</button>
            <GematriaPanel
              initialText=""
              initialLanguage="hebrew"
              onClose={() => setShowGematria(false)}
            />
          </div>
        </div>
      )}

      {showImagery && (
        <Suspense fallback={null}>
          <ManuscriptImageModal
            open
            onClose={() => setShowImagery(false)}
            book={selectedVerse.book}
            chapter={selectedVerse.chapter}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ManuscriptsPage;
