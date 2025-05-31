// components/SearchPage.jsx - Modern search functionality
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { searchPassages, selectSearchResults, selectLoading } from '../bibleSlice';
import axios from 'axios';

const SearchPage = () => {
  const dispatch = useDispatch();
  const searchResults = useSelector(selectSearchResults);
  const loading = useSelector(selectLoading);
  
  const [query, setQuery] = useState('');
  const [selectedBible, setSelectedBible] = useState('de4e12af7f28f599-02'); // Default KJV
  const [bibles, setBibles] = useState([]);
  const [searchHistory, setSearchHistory] = useState([]);
  
  const apiKey = '5875acef5839ebced9e807466f8ee3ce';

  useEffect(() => {
    // Load search history from localStorage
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    setSearchHistory(history);
    
    // Fetch available Bibles
    const fetchBibles = async () => {
      try {
        const response = await axios.get('https://api.scripture.api.bible/v1/bibles', {
          headers: { 'api-key': apiKey }
        });
        setBibles(response.data.data);
      } catch (error) {
        console.error('Error fetching Bibles', error);
      }
    };
    
    fetchBibles();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;

    // Add to search history
    const newHistory = [query, ...searchHistory.filter(h => h !== query)].slice(0, 10);
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));

    // Perform search
    dispatch(searchPassages({ 
      bibleId: selectedBible, 
      query: query.trim(),
      limit: 20 
    }));
  };

  const highlightSearchTerm = (text, term) => {
    if (!term) return text;
    
    const regex = new RegExp(`(${term})`, 'gi');
    return text.split(regex).map((part, index) => 
      regex.test(part) ? (
        <mark key={index} style={{ 
          backgroundColor: 'rgba(var(--primary-color), 0.2)',
          fontWeight: '600',
          padding: '0 2px',
          borderRadius: '2px'
        }}>
          {part}
        </mark>
      ) : part
    );
  };

  const clearHistory = () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
  };

  return (
    <div className="search-page">
      <div className="search-container">
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif",
          fontSize: '2.5rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          Search the Scriptures
        </h1>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-box">
            <svg 
              className="search-icon" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            
            <input
              type="text"
              className="search-input"
              placeholder="Search for verses, words, or phrases..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            
            <select
              value={selectedBible}
              onChange={(e) => setSelectedBible(e.target.value)}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                padding: '0.5rem',
                border: 'none',
                background: 'transparent',
                color: 'var(--text-primary)',
                cursor: 'pointer'
              }}
            >
              {bibles.map(bible => (
                <option key={bible.id} value={bible.id}>
                  {bible.abbreviation}
                </option>
              ))}
            </select>
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ marginTop: '1rem', width: '100%' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="loading-spinner"></span>
                Searching...
              </>
            ) : (
              'Search'
            )}
          </button>
        </form>

        {/* Search History */}
        {searchHistory.length > 0 && !loading && searchResults.length === 0 && (
          <div style={{ marginTop: '2rem' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              marginBottom: '1rem'
            }}>
              <h3 style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
                Recent Searches
              </h3>
              <button 
                onClick={clearHistory}
                className="btn btn-secondary"
                style={{ fontSize: '0.75rem', padding: '0.25rem 0.75rem' }}
              >
                Clear
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {searchHistory.map((term, index) => (
                <button
                  key={index}
                  className="btn btn-secondary"
                  onClick={() => {
                    setQuery(term);
                    handleSearch({ preventDefault: () => {} });
                  }}
                  style={{ fontSize: '0.875rem' }}
                >
                  {term}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Results */}
        {searchResults && searchResults.verses && (
          <div style={{ marginTop: '3rem' }}>
            <h2 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1.5rem',
              color: 'var(--text-primary)'
            }}>
              {searchResults.total} Results for "{query}"
            </h2>
            
            <div className="search-results">
              {searchResults.verses.map((verse, index) => (
                <div 
                  key={index} 
                  className="card"
                  style={{ marginBottom: '1rem' }}
                >
                  <Link
                    to={`/scripture/${selectedBible}/${verse.bibleId}/${verse.bookId}/${verse.bookId}/${verse.id}`}
                    style={{ textDecoration: 'none', color: 'inherit' }}
                  >
                    <h3 style={{ 
                      color: 'var(--primary-color)',
                      fontSize: '1.125rem',
                      marginBottom: '0.5rem'
                    }}>
                      {verse.reference}
                    </h3>
                    <p style={{ 
                      fontSize: '1rem',
                      lineHeight: '1.6',
                      color: 'var(--text-secondary)'
                    }}>
                      {highlightSearchTerm(verse.text || '', query)}
                    </p>
                  </Link>
                </div>
              ))}
            </div>
            
            {searchResults.total > searchResults.verses.length && (
              <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Showing {searchResults.verses.length} of {searchResults.total} results
                </p>
                <button className="btn btn-primary">
                  Load More Results
                </button>
              </div>
            )}
          </div>
        )}
        
        {/* No Results */}
        {searchResults && searchResults.total === 0 && (
          <div style={{ 
            textAlign: 'center', 
            marginTop: '3rem',
            color: 'var(--text-secondary)'
          }}>
            <p style={{ fontSize: '1.125rem' }}>
              No results found for "{query}"
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              Try searching with different keywords or check your spelling
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;