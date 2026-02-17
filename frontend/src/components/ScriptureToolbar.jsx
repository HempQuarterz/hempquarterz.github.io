/**
 * ScriptureToolbar - Inline chapter/book navigation
 * Compact toolbar with prev/next arrows, book selector, and chapter grid.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BIBLE_BOOKS, getAdjacentChapter } from '../utils/bibleStructure';
import '../styles/scripture-toolbar.css';

const ChevronLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronDown = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const ScriptureToolbar = ({ book, chapter, bookName, onBookChange, onChapterChange }) => {
  const [showBookSelector, setShowBookSelector] = useState(false);
  const [showChapterSelector, setShowChapterSelector] = useState(false);
  const [bookFilter, setBookFilter] = useState('');
  const [testamentTab, setTestamentTab] = useState('all');
  const bookSearchRef = useRef(null);

  const currentBook = BIBLE_BOOKS.find(b => b.id === book);
  const maxChapters = currentBook?.chapters || 1;

  const prev = getAdjacentChapter(book, chapter, 'prev');
  const next = getAdjacentChapter(book, chapter, 'next');

  const navigate = useCallback((target) => {
    if (!target) return;
    if (target.book !== book) {
      onBookChange(target.book);
    } else {
      onChapterChange(target.chapter);
    }
  }, [book, onBookChange, onChapterChange]);

  // Close popovers on Escape
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') {
        setShowBookSelector(false);
        setShowChapterSelector(false);
      }
    };
    if (showBookSelector || showChapterSelector) {
      window.addEventListener('keydown', handleKey);
      return () => window.removeEventListener('keydown', handleKey);
    }
  }, [showBookSelector, showChapterSelector]);

  // Auto-focus search when book popover opens
  useEffect(() => {
    if (showBookSelector && bookSearchRef.current) {
      bookSearchRef.current.focus();
    }
  }, [showBookSelector]);

  const toggleBookSelector = () => {
    setShowChapterSelector(false);
    setShowBookSelector(prev => !prev);
    setBookFilter('');
    setTestamentTab('all');
  };

  const toggleChapterSelector = () => {
    setShowBookSelector(false);
    setShowChapterSelector(prev => !prev);
  };

  const selectBook = (bookId) => {
    setShowBookSelector(false);
    setBookFilter('');
    onBookChange(bookId);
  };

  const selectChapter = (ch) => {
    setShowChapterSelector(false);
    onChapterChange(ch);
  };

  // Filter books by testament tab and search text
  const filteredBooks = BIBLE_BOOKS.filter(b => {
    if (testamentTab === 'old' && b.testament !== 'Old') return false;
    if (testamentTab === 'new' && b.testament !== 'New') return false;
    if (testamentTab === 'dc' && b.testament !== 'Deuterocanon') return false;
    if (bookFilter) {
      return b.name.toLowerCase().includes(bookFilter.toLowerCase());
    }
    return true;
  });

  return (
    <div className="scripture-toolbar" role="toolbar" aria-label="Scripture navigation">
      {/* Prev button */}
      <button
        className="st-nav-btn"
        onClick={() => navigate(prev)}
        disabled={!prev}
        aria-label="Previous chapter"
      >
        <ChevronLeft />
        <span className="st-nav-label">Prev</span>
      </button>

      {/* Book + Chapter selectors */}
      <div className="st-selectors">
        {/* Book selector */}
        <div className="st-popover-anchor">
          <button
            className={`st-selector ${showBookSelector ? 'st-selector--active' : ''}`}
            onClick={toggleBookSelector}
            aria-expanded={showBookSelector}
            aria-haspopup="listbox"
          >
            {bookName} <ChevronDown />
          </button>

          {showBookSelector && (
            <>
              <div className="st-popover-backdrop" onClick={() => setShowBookSelector(false)} />
              <div className="st-popover st-book-popover" role="listbox" aria-label="Select book">
                <div className="st-popover-tabs" role="tablist">
                  {[['all', 'All'], ['old', 'OT'], ['new', 'NT'], ['dc', 'DC']].map(([key, label]) => (
                    <button
                      key={key}
                      role="tab"
                      aria-selected={testamentTab === key}
                      className={testamentTab === key ? 'active' : ''}
                      onClick={() => setTestamentTab(key)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <input
                  ref={bookSearchRef}
                  className="st-book-search"
                  type="text"
                  placeholder="Search books..."
                  value={bookFilter}
                  onChange={(e) => setBookFilter(e.target.value)}
                  aria-label="Filter books"
                />
                <div className="st-book-list">
                  {filteredBooks.map(b => (
                    <button
                      key={b.id}
                      role="option"
                      aria-selected={b.id === book}
                      className={`st-book-item ${b.id === book ? 'active' : ''}`}
                      onClick={() => selectBook(b.id)}
                    >
                      {b.name}
                      <span className="st-book-item-chapters">{b.chapters} ch</span>
                    </button>
                  ))}
                  {filteredBooks.length === 0 && (
                    <div style={{ padding: '1rem', textAlign: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '0.85rem' }}>
                      No books found
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Chapter selector */}
        <div className="st-popover-anchor">
          <button
            className={`st-selector ${showChapterSelector ? 'st-selector--active' : ''}`}
            onClick={toggleChapterSelector}
            aria-expanded={showChapterSelector}
            aria-haspopup="listbox"
          >
            Ch {chapter} <ChevronDown />
          </button>

          {showChapterSelector && (
            <>
              <div className="st-popover-backdrop" onClick={() => setShowChapterSelector(false)} />
              <div className="st-popover st-chapter-popover" role="listbox" aria-label="Select chapter">
                <div className="st-chapter-grid">
                  {Array.from({ length: maxChapters }, (_, i) => i + 1).map(n => (
                    <button
                      key={n}
                      role="option"
                      aria-selected={n === chapter}
                      className={`st-chapter-btn ${n === chapter ? 'active' : ''}`}
                      onClick={() => selectChapter(n)}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Next button */}
      <button
        className="st-nav-btn"
        onClick={() => navigate(next)}
        disabled={!next}
        aria-label="Next chapter"
      >
        <span className="st-nav-label">Next</span>
        <ChevronRight />
      </button>
    </div>
  );
};

export default ScriptureToolbar;
