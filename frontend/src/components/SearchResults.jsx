/**
 * SearchResults Component - Display verse and lexicon search results
 */

import React, { useState } from 'react';
import { restoreVerse } from '../api/restoration';
import '../styles/search.css';

const SearchResults = ({ results, query, onNavigate, loading = false }) => {
  const [restorationEnabled, setRestorationEnabled] = useState(true);
  const [expandedLexicon, setExpandedLexicon] = useState(new Set());

  if (loading) {
    return (
      <div className="search-results-container">
        <div className="search-loading">
          <div className="loading-spinner"></div>
          <p>Searching manuscripts...</p>
        </div>
      </div>
    );
  }

  if (!results) {
    return null;
  }

  const { verses = [], lexicon = [], total = 0 } = results;

  if (total === 0) {
    return (
      <div className="search-results-container">
        <div className="search-empty">
          <p>No results found for "{query}"</p>
          <p className="search-empty-hint">
            Try searching for:
            <br />
            • Divine names: Yahuah, Yahusha, Elohim
            <br />
            • Strong's numbers: H3068, G2424
            <br />
            • Keywords: love, faith, redemption
            <br />• Book codes: GEN, MAT, REV
          </p>
        </div>
      </div>
    );
  }

  const toggleLexiconExpansion = (strongNumber) => {
    setExpandedLexicon((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(strongNumber)) {
        newSet.delete(strongNumber);
      } else {
        newSet.add(strongNumber);
      }
      return newSet;
    });
  };

  const handleVerseClick = (verse) => {
    if (onNavigate) {
      onNavigate({
        book: verse.book,
        chapter: verse.chapter,
        verse: verse.verse
      });
    }
  };

  const highlightQuery = (text, query) => {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="search-highlight">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  const renderVerseResult = (verse) => {
    const manuscript = verse.manuscripts || {};
    const reference = `${verse.book} ${verse.chapter}:${verse.verse}`;
    let displayText = verse.text;

    // Apply divine name restoration if enabled
    if (restorationEnabled) {
      const restored = restoreVerse(verse);
      displayText = restored.text || verse.text;
    }

    return (
      <div
        key={`${verse.manuscript_id}-${verse.book}-${verse.chapter}-${verse.verse}`}
        className="search-result-item verse-result"
        onClick={() => handleVerseClick(verse)}
      >
        <div className="verse-result-header">
          <span className="verse-reference">{reference}</span>
          <span className="verse-manuscript">
            {manuscript.name} ({manuscript.code})
          </span>
        </div>
        <div className="verse-text">{highlightQuery(displayText, query)}</div>
        {verse.strong_numbers && verse.strong_numbers.length > 0 && (
          <div className="verse-strongs">
            {verse.strong_numbers.slice(0, 10).map((num, idx) => (
              <span key={idx} className="strong-tag">
                {num}
              </span>
            ))}
            {verse.strong_numbers.length > 10 && (
              <span className="strong-tag-more">+{verse.strong_numbers.length - 10} more</span>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderLexiconResult = (entry) => {
    const isExpanded = expandedLexicon.has(entry.strong_number);

    return (
      <div
        key={entry.strong_number}
        className="search-result-item lexicon-result"
        onClick={() => toggleLexiconExpansion(entry.strong_number)}
      >
        <div className="lexicon-result-header">
          <span className="lexicon-strong">{entry.strong_number}</span>
          <span className="lexicon-transliteration">{entry.transliteration}</span>
          <span className="lexicon-language">{entry.language === 'hebrew' ? '🔯' : '✝'}</span>
        </div>
        <div className="lexicon-original">{entry.original_word}</div>
        <div className={`lexicon-definition ${isExpanded ? 'expanded' : ''}`}>
          {highlightQuery(entry.definition, query)}
        </div>
        {!isExpanded && entry.definition?.length > 150 && (
          <div className="lexicon-expand-hint">Click to read more...</div>
        )}
      </div>
    );
  };

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h2>
          Search Results for "{query}" ({total})
        </h2>
        {verses.length > 0 && (
          <label className="restoration-toggle">
            <input
              type="checkbox"
              checked={restorationEnabled}
              onChange={(e) => setRestorationEnabled(e.target.checked)}
            />
            <span>Show Divine Name Restoration</span>
          </label>
        )}
      </div>

      {lexicon.length > 0 && (
        <section className="search-results-section">
          <h3 className="search-section-title">
            Strong's Lexicon ({lexicon.length})
          </h3>
          <div className="search-results-list">
            {lexicon.map((entry) => renderLexiconResult(entry))}
          </div>
        </section>
      )}

      {verses.length > 0 && (
        <section className="search-results-section">
          <h3 className="search-section-title">
            Verses ({verses.length})
          </h3>
          <div className="search-results-list">
            {verses.map((verse) => renderVerseResult(verse))}
          </div>
        </section>
      )}
    </div>
  );
};

export default SearchResults;
