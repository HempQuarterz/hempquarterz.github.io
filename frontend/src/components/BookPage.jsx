import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '../constants/bibleData';
import { getCanonicalBooks, getTierCounts } from '../api/canonicalBooks';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import CanonicalBadge from './CanonicalBadge';
import CanonicalFilterPanel from './CanonicalFilterPanel';
import '../styles/modern.css';

const BookPage = () => {
  const [books, setBooks] = useState([]);
  const [tierCounts, setTierCounts] = useState({ 1: 66, 2: 21, 3: 2, 4: 1 });
  const [selectedTiers, setSelectedTiers] = useState([1, 2]); // Default: Canonical + Deuterocanonical
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const bibleVersionID = new URLSearchParams(location.search).get('version');
  const abbreviation = new URLSearchParams(location.search).get('abbr');

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch canonical books from Supabase (no Scripture API dependency)
        const [booksData, tierCountsData] = await Promise.all([
          getCanonicalBooks({ tiers: selectedTiers }),
          getTierCounts()
        ]);

        setBooks(booksData);
        setTierCounts(tierCountsData);
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


  // Filter books by search term (tier filtering already applied by API)
  const filteredBooks = useMemo(() =>
    books.filter(book =>
      book.book_name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [books, searchTerm]
  );

  // Group books by testament using canonical_books testament field
  const oldTestament = useMemo(() =>
    filteredBooks.filter(book => book.testament === 'OT' || OLD_TESTAMENT_BOOKS.includes(book.book_code)),
    [filteredBooks]
  );

  const newTestament = useMemo(() =>
    filteredBooks.filter(book => book.testament === 'NT' || NEW_TESTAMENT_BOOKS.includes(book.book_code)),
    [filteredBooks]
  );

  // Deuterocanonical books (Tier 2, 3, 4) - ONLY books not in OT or NT
  const deuterocanonical = useMemo(() =>
    filteredBooks.filter(book =>
      book.testament === 'Deuterocanon' &&
      !OLD_TESTAMENT_BOOKS.includes(book.book_code) &&
      !NEW_TESTAMENT_BOOKS.includes(book.book_code)
    ),
    [filteredBooks]
  );

  return (
    <div className="fade-in">
      <ModernHeader title={abbreviation} />

      <main className="container" style={{ paddingTop: '2rem' }}>
        {/* Canonical Tier Filter */}
        <div style={{ marginBottom: '1.5rem' }}>
          <CanonicalFilterPanel
            selectedTiers={selectedTiers}
            onTiersChange={setSelectedTiers}
            showCounts={true}
            tierCounts={tierCounts}
            compact={false}
          />
        </div>

        {/* Search Bar */}
        <div style={{ marginBottom: '2rem' }}>
          <label htmlFor="book-search" className="visually-hidden">
            Search for a Bible book
          </label>
          <input
            id="book-search"
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

        {loading ? (
          <Loading type="skeleton" />
        ) : error ? (
          <div
            className="card"
            style={{
              padding: '2rem',
              textAlign: 'center',
              backgroundColor: 'var(--error-bg, #fee)',
              color: 'var(--error-text, #c33)'
            }}
          >
            <p style={{ marginBottom: '1rem' }}>{error}</p>
            <button
              className="btn btn-primary"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        ) : (
          <div>
            {/* Old Testament */}
            {oldTestament.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  Old Testament
                </h3>
                <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
                  {oldTestament.map((book) => (
                    <Link
                      key={book.book_code}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.book_code}`}
                      className="card"
                      aria-label={`Open ${book.book_name}`}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}
                    >
                      <p style={{ fontWeight: '500', margin: 0 }}>{book.book_name}</p>
                      {book.canonical_tier && (
                        <CanonicalBadge
                          tier={book.canonical_tier}
                          showEmoji={true}
                          showLabel={false}
                          showTooltip={true}
                          compact={true}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Testament */}
            {newTestament.length > 0 && (
              <div style={{ marginBottom: '2rem' }}>
                <h3 style={{
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  New Testament
                </h3>
                <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
                  {newTestament.map((book) => (
                    <Link
                      key={book.book_code}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.book_code}`}
                      className="card"
                      aria-label={`Open ${book.book_name}`}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}
                    >
                      <p style={{ fontWeight: '500', margin: 0 }}>{book.book_name}</p>
                      {book.canonical_tier && (
                        <CanonicalBadge
                          tier={book.canonical_tier}
                          showEmoji={true}
                          showLabel={false}
                          showTooltip={true}
                          compact={true}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Deuterocanonical/Apocrypha */}
            {deuterocanonical.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  Deuterocanonical & Apocrypha
                </h3>
                <div className="grid grid-cols-3" style={{ gap: '0.75rem' }}>
                  {deuterocanonical.map((book) => (
                    <Link
                      key={book.book_code}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.book_code}`}
                      className="card"
                      aria-label={`Open ${book.book_name}`}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        alignItems: 'center'
                      }}
                    >
                      <p style={{ fontWeight: '500', margin: 0 }}>{book.book_name}</p>
                      {book.canonical_tier && (
                        <CanonicalBadge
                          tier={book.canonical_tier}
                          showEmoji={true}
                          showLabel={false}
                          showTooltip={true}
                          compact={true}
                        />
                      )}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default BookPage;
