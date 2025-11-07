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
    <div className="fade-in">
      <ModernHeader
        title="All4Yah Manuscripts"
        subtitle="Original Hebrew, Greek & English with Divine Name Restoration"
      />

      <main className="container" style={{ paddingTop: '2rem', maxWidth: '1600px' }}>
        {/* Action Buttons */}
        <div style={{ marginBottom: '1rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
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

        {/* Gematria Panel */}
        {showGematria && (
          <div style={{ marginBottom: '2rem' }}>
            <GematriaPanel
              initialText=""
              initialLanguage="hebrew"
              onClose={() => setShowGematria(false)}
            />
          </div>
        )}

        {/* Compact Navigation */}
        {!showSearch && !showGematria && (
          <CompactNavigation
            selectedVerse={selectedVerse}
            onVerseChange={handleVerseChange}
          />
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
              />
            </div>

            {/* Consolidated Panel - All Features in Tabs */}
            <ConsolidatedPanel
              book={selectedVerse.book}
              chapter={selectedVerse.chapter}
              verse={selectedVerse.verse}
              currentVerseText={currentVerseText}
              onNavigate={handleVerseChange}
            />
          </>
        )}
      </main>
    </div>
  );
};

export default ManuscriptsPage;
