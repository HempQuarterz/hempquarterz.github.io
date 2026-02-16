import React, { useEffect, useState, useMemo } from 'react';
import { getCanonicalBooks } from '../api/canonicalBooks';
import CanonicalBadge from './CanonicalBadge';
import Loading from './Loading';
import '../styles/book-selector.css';

/**
 * BookSelector - Navigation component for selecting Bible books
 *
 * Fetches canonical books from Supabase and displays them grouped by testament.
 * Supports canonical tier filtering (Tier 1-4).
 *
 * @param {Object} props
 * @param {string} props.selectedBook - Currently selected book code (e.g., 'GEN')
 * @param {Function} props.onBookSelect - Callback when book is selected: (bookCode) => void
 * @param {Array<number>} props.selectedTiers - Canonical tiers to display (default: [1, 2])
 */
const BookSelector = ({ selectedBook, onBookSelect, selectedTiers = [1, 2] }) => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const booksData = await getCanonicalBooks({ tiers: selectedTiers });
        setBooks(booksData);
      } catch (err) {
        console.error('Failed to load canonical books:', err);
        setError('Failed to load books. Please try again.');
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [selectedTiers]);

  // Filter books by search term
  const filteredBooks = useMemo(() =>
    books.filter(book =>
      book.book_name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [books, searchTerm]
  );

  // Group books by testament
  const oldTestament = useMemo(() =>
    filteredBooks.filter(book => book.testament === 'OT'),
    [filteredBooks]
  );

  const newTestament = useMemo(() =>
    filteredBooks.filter(book => book.testament === 'NT'),
    [filteredBooks]
  );

  const deuterocanonical = useMemo(() =>
    filteredBooks.filter(book => book.testament === 'Deuterocanon'),
    [filteredBooks]
  );

  const handleBookClick = (bookCode) => {
    onBookSelect(bookCode);
  };

  if (loading) {
    return <Loading type="skeleton" />;
  }

  if (error) {
    return (
      <div className="card" style={{
        padding: '1.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--error-bg, #fee)',
        color: 'var(--error-text, #c33)'
      }}>
        <p style={{ marginBottom: '1rem' }}>{error}</p>
        <button
          className="btn btn-primary"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  const renderBookGroup = (books, title) => (
    <div className="bs-section">
      <h3 className="bs-section-title">{title}</h3>
      <div className="bs-grid">
        {books.map((book) => (
          <button
            key={book.book_code}
            onClick={() => handleBookClick(book.book_code)}
            className={`bs-book-btn ${selectedBook === book.book_code ? 'bs-book-btn--selected' : ''}`}
            aria-label={`Select ${book.book_name}`}
          >
            <p className="bs-book-name">{book.book_name}</p>
            {book.canonical_tier && (
              <CanonicalBadge
                tier={book.canonical_tier}
                showEmoji={true}
                showLabel={false}
                showTooltip={true}
                compact={true}
              />
            )}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      {/* Search Bar */}
      <div className="bs-search-wrapper">
        <input
          type="search"
          placeholder="Search for a book..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search for a Bible book"
          className="bs-search-input"
        />
      </div>

      {oldTestament.length > 0 && renderBookGroup(oldTestament, 'Old Testament')}
      {newTestament.length > 0 && renderBookGroup(newTestament, 'New Testament')}
      {deuterocanonical.length > 0 && renderBookGroup(deuterocanonical, 'Deuterocanonical & Apocrypha')}
    </div>
  );
};

export default BookSelector;
