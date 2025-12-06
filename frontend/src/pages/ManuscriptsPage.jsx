/**
 * ManuscriptsPage - Demo/Test Page for Manuscript Viewer
 * Showcases the All4Yah manuscript viewing capabilities
 */

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ManuscriptViewer from '../components/ManuscriptViewer';
import ModernHeader from '../components/ModernHeader';
import CompactNavigation from '../components/CompactNavigation';
import ConsolidatedPanel from '../components/ConsolidatedPanel';
import SearchBar from '../components/SearchBar';
import SearchResults from '../components/SearchResults';
import GematriaPanel from '../components/GematriaPanel';
import { getVerse } from '../api/verses';
import { searchAll } from '../api/search';
import '../styles/manuscripts.css';
import '../styles/reader-mode.css';

const ManuscriptsPage = () => {
  const { book, chapter, verse } = useParams();

  // Default to Genesis 1:1 if no params provided
  const [selectedVerse, setSelectedVerse] = useState({
    book: book || 'GEN',
    chapter: chapter ? parseInt(chapter) : 1,
    verse: verse ? parseInt(verse) : 1
  });

  // State for current verse text (for thematic discovery)
  const [currentVerseText, setCurrentVerseText] = useState('');

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [searchLoading, setSearchLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  // Gematria state
  const [showGematria, setShowGematria] = useState(false);

  // Reader Mode state
  const [isReaderMode, setIsReaderMode] = useState(false);

  // Toggle Reader Mode
  const toggleReaderMode = () => {
    setIsReaderMode(!isReaderMode);
    // Close other panels when entering reader mode
    if (!isReaderMode) {
      setShowSearch(false);
      setShowGematria(false);
    }
  };

  // Unified verse change handler for CompactNavigation
  const handleVerseChange = (newVerse) => {
    setSelectedVerse(newVerse);
    // Close search when navigating to a verse
    setShowSearch(false);
    setSearchResults(null);
  };

  // Handle search execution
  const handleSearch = async (query) => {
    if (!query || query.trim().length < 2) {
      return;
    }

    setSearchQuery(query);
    setSearchLoading(true);
    setShowSearch(true);

    try {
      const results = await searchAll(query, {
        versesLimit: 50
      });
      setSearchResults(results);
    } catch (err) {
      console.error('Search failed:', err);
      setSearchResults({ verses: [], lexicon: [], total: 0 });
    } finally {
      setSearchLoading(false);
    }
  };

  // Toggle search visibility
  const toggleSearch = () => {
    setShowSearch(!showSearch);
    if (showSearch) {
      setSearchResults(null);
      setSearchQuery('');
    }
    // Close gematria when opening search
    if (!showSearch) {
      setShowGematria(false);
    }
  };

  // Toggle gematria visibility
  const toggleGematria = () => {
    setShowGematria(!showGematria);
    // Close search when opening gematria
    if (!showGematria) {
      setShowSearch(false);
      setSearchResults(null);
    }
  };

  // Load current verse text for thematic discovery
  useEffect(() => {
    async function loadCurrentVerse() {
      try {
        // Load English verse for thematic analysis
        const verseData = await getVerse('WEB', selectedVerse.book, selectedVerse.chapter, selectedVerse.verse);
        if (verseData && verseData.text) {
          setCurrentVerseText(verseData.text);
        }
      } catch (err) {
        console.error('Failed to load current verse text:', err);
      }
    }

    loadCurrentVerse();
  }, [selectedVerse.book, selectedVerse.chapter, selectedVerse.verse]);

  return (
    <div className={`fade-in ${isReaderMode ? 'reader-mode-active' : ''}`}>
      {/* Reader Mode Toggle */}
      <button
        className={`reader-mode-toggle ${isReaderMode ? 'active' : ''}`}
        onClick={toggleReaderMode}
        title={isReaderMode ? "Exit Reader Mode" : "Enter Reader Mode"}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
        </svg>
        {isReaderMode ? "Exit Reader" : "Reader Mode"}
      </button>

      <div className="reader-mode-transition">
        <ModernHeader
          title="All4Yah Manuscripts"
          subtitle="Original Hebrew, Greek & English with Divine Name Restoration"
        />
      </div>

      <main className={`container ${isReaderMode ? 'reader-mode-container' : ''}`} style={{ paddingTop: '2rem', maxWidth: '1600px' }}>
        <div className="action-buttons" style={{ marginBottom: '1rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          {/* Search Toggle Button */}
          <button
            onClick={toggleSearch}
            style={{
              background: showSearch ? '#D4AF37' : 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8"></circle>
              <path d="m21 21-4.35-4.35"></path>
            </svg>
            {showSearch ? 'Hide Search' : 'Search Manuscripts'}
          </button>

          {/* Gematria Toggle Button */}
          <button
            onClick={toggleGematria}
            style={{
              background: showGematria ? '#D4AF37' : 'linear-gradient(135deg, #6A1B9A 0%, #8E24AA 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M12 6v6l4 2"></path>
            </svg>
            {showGematria ? 'Hide Gematria' : 'Gematria Explorer'}
          </button>
        </div>

        {/* Search Interface */}
        <div className={`search-interface ${showSearch ? 'active' : ''}`}>
          {showSearch && (
            <div style={{ marginBottom: '2rem' }}>
              <SearchBar onSearch={handleSearch} autoFocus={true} />
              <SearchResults
                results={searchResults}
                query={searchQuery}
                onNavigate={handleVerseChange}
                loading={searchLoading}
              />
            </div>
          )}
        </div>

        {/* Gematria Panel */}
        <div className={`gematria-panel ${showGematria ? 'active' : ''}`}>
          {showGematria && (
            <div style={{ marginBottom: '2rem' }}>
              <GematriaPanel
                initialText=""
                initialLanguage="hebrew"
                onClose={() => setShowGematria(false)}
              />
            </div>
          )}
        </div>

        {/* Compact Navigation */}
        {!showSearch && !showGematria && (
          <div className="compact-nav">
            <CompactNavigation
              selectedVerse={selectedVerse}
              onVerseChange={handleVerseChange}
            />
          </div>
        )}

        {/* Manuscript Viewer - Now at the top! */}
        {!showSearch && !showGematria && (
          <>
            <div style={{ marginTop: '2rem' }}>
              <ManuscriptViewer
                book={selectedVerse.book}
                chapter={selectedVerse.chapter}
                verse={selectedVerse.verse}
                onVerseChange={handleVerseChange}
                isReaderMode={isReaderMode}
              />
            </div>

            {/* Consolidated Panel - All Features in Tabs */}
            <div className="consolidated-panel">
              <ConsolidatedPanel
                book={selectedVerse.book}
                chapter={selectedVerse.chapter}
                verse={selectedVerse.verse}
                currentVerseText={currentVerseText}
                onNavigate={handleVerseChange}
              />
            </div>

            {/* Reader Mode Minimal Navigation */}
            {isReaderMode && (
              <div className="reader-nav">
                <button
                  className="reader-nav-btn"
                  onClick={() => handleVerseChange({ ...selectedVerse, chapter: Math.max(1, selectedVerse.chapter - 1) })}
                  title="Previous Chapter"
                  disabled={selectedVerse.chapter <= 1}
                >
                  ←
                </button>
                <div style={{ fontFamily: 'Cardo', fontWeight: 'bold', paddingTop: '12px' }}>
                  {selectedVerse.book} {selectedVerse.chapter}
                </div>
                <button
                  className="reader-nav-btn"
                  onClick={() => handleVerseChange({ ...selectedVerse, chapter: selectedVerse.chapter + 1 })}
                  title="Next Chapter"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default ManuscriptsPage;
