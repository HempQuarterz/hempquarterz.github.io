/**
 * CompactNavigation - Compact navigation bar for Book/Chapter/Verse selection
 * Provides a streamlined, space-efficient interface for scripture navigation
 */

import React, { useState, useEffect } from 'react';
import { getCanonicalBooks } from '../api/canonicalBooks';
import { getBookChapters, getChapterVerses } from '../api/verses';

const CompactNavigation = ({ selectedVerse, onVerseChange }) => {
  const [books, setBooks] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [verses, setVerses] = useState([]);
  const [isBookDropdownOpen, setIsBookDropdownOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Load books on mount
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const booksData = await getCanonicalBooks({ tiers: [1, 2] });
        setBooks(booksData);
      } catch (err) {
        console.error('Failed to load books:', err);
      }
    };
    fetchBooks();
  }, []);

  // Load chapters when book changes
  useEffect(() => {
    const fetchChapters = async () => {
      if (!selectedVerse.book) return;
      try {
        const chaptersData = await getBookChapters(selectedVerse.book);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Failed to load chapters:', err);
        setChapters([]);
      }
    };
    fetchChapters();
  }, [selectedVerse.book]);

  // Load verses when chapter changes
  useEffect(() => {
    const fetchVerses = async () => {
      if (!selectedVerse.book || !selectedVerse.chapter) return;
      try {
        const versesData = await getChapterVerses(selectedVerse.book, selectedVerse.chapter);
        setVerses(versesData);
      } catch (err) {
        console.error('Failed to load verses:', err);
        setVerses([]);
      }
    };
    fetchVerses();
  }, [selectedVerse.book, selectedVerse.chapter]);

  const selectedBookData = books.find(b => b.book_code === selectedVerse.book);

  const filteredBooks = books.filter(b =>
    b.book_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div style={{
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      padding: '1rem',
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      flexWrap: 'wrap'
    }}>
      {/* Book Selector */}
      <div style={{ position: 'relative', minWidth: '200px', flex: '1 1 200px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
          Book
        </label>
        <button
          onClick={() => setIsBookDropdownOpen(!isBookDropdownOpen)}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: '#fff',
            cursor: 'pointer',
            textAlign: 'left',
            fontSize: '0.95rem'
          }}
        >
          {selectedBookData ? selectedBookData.book_name : 'Select Book'} ▼
        </button>

        {isBookDropdownOpen && (
          <div style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            marginTop: '0.25rem',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            maxHeight: '400px',
            overflowY: 'auto',
            zIndex: 1000
          }}>
            {/* Search */}
            <input
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '0.5rem',
                border: 'none',
                borderBottom: '1px solid #ddd',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
            {/* Book List */}
            {filteredBooks.map(book => (
              <div
                key={book.book_code}
                onClick={() => {
                  onVerseChange({ book: book.book_code, chapter: 1, verse: 1 });
                  setIsBookDropdownOpen(false);
                  setSearchTerm('');
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#333',
                  background: book.book_code === selectedVerse.book ? '#e3f2fd' : '#fff',
                  borderBottom: '1px solid #f0f0f0'
                }}
                onMouseEnter={(e) => e.target.style.background = '#f5f5f5'}
                onMouseLeave={(e) => e.target.style.background = book.book_code === selectedVerse.book ? '#e3f2fd' : '#fff'}
              >
                {book.book_name}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chapter Selector */}
      <div style={{ minWidth: '120px', flex: '0 1 120px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
          Chapter
        </label>
        <select
          value={selectedVerse.chapter}
          onChange={(e) => onVerseChange({ ...selectedVerse, chapter: parseInt(e.target.value), verse: 1 })}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {chapters.map(ch => (
            <option key={ch} value={ch}>Chapter {ch}</option>
          ))}
        </select>
      </div>

      {/* Verse Selector */}
      <div style={{ minWidth: '120px', flex: '0 1 120px' }}>
        <label style={{ display: 'block', fontSize: '0.85rem', color: '#666', marginBottom: '0.25rem' }}>
          Verse
        </label>
        <select
          value={selectedVerse.verse}
          onChange={(e) => onVerseChange({ ...selectedVerse, verse: parseInt(e.target.value) })}
          style={{
            width: '100%',
            padding: '0.5rem 0.75rem',
            border: '1px solid #ddd',
            borderRadius: '4px',
            fontSize: '0.95rem',
            cursor: 'pointer'
          }}
        >
          {verses.map(v => (
            <option key={v} value={v}>Verse {v}</option>
          ))}
        </select>
      </div>

      {/* Reference Display */}
      <div style={{ flex: '1 1 150px', textAlign: 'right' }}>
        <div style={{ fontSize: '1.1rem', fontWeight: '600', color: '#2E7D32' }}>
          {selectedBookData && `${selectedBookData.book_name} ${selectedVerse.chapter}:${selectedVerse.verse}`}
        </div>
      </div>
    </div>
  );
};

export default CompactNavigation;
