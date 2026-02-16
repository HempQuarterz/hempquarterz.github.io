/**
 * SearchBar Component - Global search input with suggestions
 */

import React, { useState, useEffect, useRef } from 'react';
import { getSearchSuggestions } from '../api/search';
import '../styles/search.css';

const AVAILABLE_MANUSCRIPTS = ['WEB', 'WLC', 'SBLGNT', 'LXX'];

const SearchBar = ({ onSearch, placeholder = "Search verses, Strong's numbers, or keywords...", autoFocus = false, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [selectedManuscripts, setSelectedManuscripts] = useState(new Set());
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Load suggestions as user types
  useEffect(() => {
    const loadSuggestions = async () => {
      if (query.length < 2) {
        setSuggestions([]);
        return;
      }

      try {
        // Determine suggestion type based on query pattern
        let type = 'keywords';
        if (/^[HG]\d/i.test(query)) {
          type = 'strongs';
        } else if (/^[A-Z]{3}/i.test(query)) {
          type = 'books';
        }

        const results = await getSearchSuggestions(query, type);
        setSuggestions(results);
        setShowSuggestions(results.length > 0);
      } catch (err) {
        console.error('Failed to load suggestions:', err);
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target) &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleManuscript = (code) => {
    setSelectedManuscripts(prev => {
      const next = new Set(prev);
      if (next.has(code)) {
        next.delete(code);
      } else {
        next.add(code);
      }
      return next;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query.trim(), { manuscripts: [...selectedManuscripts] });
      setShowSuggestions(false);
    }
  };

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setSelectedSuggestionIndex(-1);
  };

  const handleSuggestionClick = (suggestion) => {
    let searchQuery = '';

    if (suggestion.strong_number) {
      // Strong's suggestion
      searchQuery = suggestion.strong_number;
    } else if (suggestion.code) {
      // Book suggestion
      searchQuery = suggestion.code;
    } else {
      searchQuery = suggestion;
    }

    setQuery(searchQuery);
    onSearch(searchQuery, { manuscripts: [...selectedManuscripts] });
    setShowSuggestions(false);
  };

  const handleKeyDown = (e) => {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) =>
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        if (selectedSuggestionIndex >= 0) {
          e.preventDefault();
          handleSuggestionClick(suggestions[selectedSuggestionIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedSuggestionIndex(-1);
        break;
      default:
        break;
    }
  };

  const renderSuggestion = (suggestion, index) => {
    const isSelected = index === selectedSuggestionIndex;

    if (suggestion.strong_number) {
      // Strong's lexicon suggestion
      return (
        <div
          key={suggestion.strong_number}
          className={`search-suggestion ${isSelected ? 'selected' : ''}`}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleSuggestionClick(suggestion)}
        >
          <div className="suggestion-primary">
            <strong>{suggestion.strong_number}</strong> - {suggestion.transliteration}
          </div>
          <div className="suggestion-secondary">
            {suggestion.definition?.substring(0, 100)}
            {suggestion.definition?.length > 100 ? '...' : ''}
          </div>
        </div>
      );
    }

    if (suggestion.code) {
      // Book suggestion
      return (
        <div
          key={suggestion.code}
          className={`search-suggestion ${isSelected ? 'selected' : ''}`}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleSuggestionClick(suggestion)}
        >
          <div className="suggestion-primary">
            <strong>{suggestion.code}</strong> - {suggestion.long_name}
          </div>
          {suggestion.short_name !== suggestion.long_name && (
            <div className="suggestion-secondary">{suggestion.short_name}</div>
          )}
        </div>
      );
    }

    // Generic suggestion
    return (
      <div
        key={index}
        className={`search-suggestion ${isSelected ? 'selected' : ''}`}
        onClick={() => handleSuggestionClick(suggestion)}
      >
        {suggestion}
      </div>
    );
  };

  return (
    <div className="search-bar-container">
      <form onSubmit={handleSubmit} className="search-form">
        <div className="search-input-wrapper">
          <label htmlFor="search-manuscripts" className="sr-only">Search manuscripts</label>
          <input
            id="search-manuscripts"
            ref={inputRef}
            type="text"
            value={query}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
            placeholder={placeholder}
            className="search-input"
            autoFocus={autoFocus}
            role="combobox"
            aria-expanded={showSuggestions}
            aria-autocomplete="list"
            aria-controls="search-suggestions-list"
          />
          <button type="submit" className="search-button" disabled={!query.trim()}>
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
            Search
          </button>
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div ref={suggestionsRef} className="search-suggestions" id="search-suggestions-list" role="listbox">
            {suggestions.map((suggestion, index) => renderSuggestion(suggestion, index))}
          </div>
        )}
      </form>

      <div className="search-filters">
        {AVAILABLE_MANUSCRIPTS.map(code => (
          <button
            key={code}
            type="button"
            className={`filter-chip ${selectedManuscripts.has(code) ? 'active' : ''}`}
            onClick={() => toggleManuscript(code)}
            aria-pressed={selectedManuscripts.has(code)}
          >
            {code}
          </button>
        ))}
      </div>

      <div className="search-tips">
        <span className="search-tip">
          Try: <code>Yahuah</code>, <code>H3068</code>, <code>love</code>, or <code>GEN</code>
        </span>
      </div>
    </div>
  );
};

export default SearchBar;
