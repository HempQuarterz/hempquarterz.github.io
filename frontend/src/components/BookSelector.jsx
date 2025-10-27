import React, { useEffect, useState, useMemo } from 'react';
import { getCanonicalBooks } from '../api/canonicalBooks';
import CanonicalBadge from './CanonicalBadge';
import Loading from './Loading';

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

  return (
    <div>
      {/* Search Bar */}
      <div style={{ marginBottom: '1.5rem' }}>
        <input
          type="search"
          placeholder="Search for a book..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search for a Bible book"
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            fontSize: '1rem',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-secondary)',
            color: 'var(--text-primary)',
            transition: 'all var(--transition-fast)'
          }}
        />
      </div>

      {/* Old Testament */}
      {oldTestament.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>
            Old Testament
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {oldTestament.map((book) => (
              <button
                key={book.book_code}
                onClick={() => handleBookClick(book.book_code)}
                className={`card ${selectedBook === book.book_code ? 'selected' : ''}`}
                aria-label={`Select ${book.book_name}`}
                style={{
                  textAlign: 'center',
                  padding: '1rem 0.5rem',
                  border: selectedBook === book.book_code
                    ? '2px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
                  backgroundColor: selectedBook === book.book_code
                    ? 'var(--primary-bg, rgba(59, 130, 246, 0.1))'
                    : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <p style={{ fontWeight: '500', margin: 0, fontSize: '0.9rem' }}>
                  {book.book_name}
                </p>
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
      )}

      {/* New Testament */}
      {newTestament.length > 0 && (
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>
            New Testament
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {newTestament.map((book) => (
              <button
                key={book.book_code}
                onClick={() => handleBookClick(book.book_code)}
                className={`card ${selectedBook === book.book_code ? 'selected' : ''}`}
                aria-label={`Select ${book.book_name}`}
                style={{
                  textAlign: 'center',
                  padding: '1rem 0.5rem',
                  border: selectedBook === book.book_code
                    ? '2px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
                  backgroundColor: selectedBook === book.book_code
                    ? 'var(--primary-bg, rgba(59, 130, 246, 0.1))'
                    : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <p style={{ fontWeight: '500', margin: 0, fontSize: '0.9rem' }}>
                  {book.book_name}
                </p>
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
      )}

      {/* Deuterocanonical/Apocrypha */}
      {deuterocanonical.length > 0 && (
        <div>
          <h3 style={{
            fontSize: '1.1rem',
            marginBottom: '1rem',
            color: 'var(--text-secondary)',
            fontWeight: '600'
          }}>
            Deuterocanonical & Apocrypha
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
            gap: '0.75rem'
          }}>
            {deuterocanonical.map((book) => (
              <button
                key={book.book_code}
                onClick={() => handleBookClick(book.book_code)}
                className={`card ${selectedBook === book.book_code ? 'selected' : ''}`}
                aria-label={`Select ${book.book_name}`}
                style={{
                  textAlign: 'center',
                  padding: '1rem 0.5rem',
                  border: selectedBook === book.book_code
                    ? '2px solid var(--primary-color)'
                    : '1px solid var(--border-color)',
                  backgroundColor: selectedBook === book.book_code
                    ? 'var(--primary-bg, rgba(59, 130, 246, 0.1))'
                    : 'var(--bg-secondary)',
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  alignItems: 'center',
                  transition: 'all var(--transition-fast)'
                }}
              >
                <p style={{ fontWeight: '500', margin: 0, fontSize: '0.9rem' }}>
                  {book.book_name}
                </p>
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
      )}
    </div>
  );
};

export default BookSelector;
