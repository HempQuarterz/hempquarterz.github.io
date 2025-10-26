import React, { useEffect, useState, useMemo } from 'react';
import { useLocation, Link } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG, getApiHeaders } from '../config/api';
import { OLD_TESTAMENT_BOOKS, NEW_TESTAMENT_BOOKS } from '../constants/bibleData';
import { logApiError } from '../utils/debug';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import '../styles/modern.css';

const BookPage = () => {
  const [bookList, setBookList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const location = useLocation();
  const bibleVersionID = new URLSearchParams(location.search).get('version');
  const abbreviation = new URLSearchParams(location.search).get('abbr');

  useEffect(() => {
    const abortController = new AbortController();

    const fetchBooks = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/bibles/${bibleVersionID}/books`,
          {
            headers: getApiHeaders(),
            signal: abortController.signal
          }
        );

        setBookList(response.data.data);
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          logApiError(`/bibles/${bibleVersionID}/books`, err);
          setError('Failed to load books. Please try again.');
          setBookList([]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (bibleVersionID) {
      fetchBooks();
    }

    return () => {
      abortController.abort();
    };
  }, [bibleVersionID]);


  // Memoize filtered books to avoid recalculation on every render
  const filteredBooks = useMemo(() =>
    bookList.filter(book =>
      book.name.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    [bookList, searchTerm]
  );

  // Group books by testament using constants
  const oldTestament = useMemo(() =>
    filteredBooks.filter(book => OLD_TESTAMENT_BOOKS.includes(book.id)),
    [filteredBooks]
  );

  const newTestament = useMemo(() =>
    filteredBooks.filter(book => NEW_TESTAMENT_BOOKS.includes(book.id)),
    [filteredBooks]
  );

  return (
    <div className="fade-in">
      <ModernHeader title={abbreviation} />
      
      <main className="container" style={{ paddingTop: '2rem' }}>
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
                      key={book.id}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.id}`}
                      className="card"
                      aria-label={`Open ${book.name}`}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <p style={{ fontWeight: '500' }}>{book.name}</p>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* New Testament */}
            {newTestament.length > 0 && (
              <div>
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
                      key={book.id}
                      to={`/chapter/${bibleVersionID}/${abbreviation}/${book.id}`}
                      className="card"
                      aria-label={`Open ${book.name}`}
                      style={{
                        textAlign: 'center',
                        padding: '1rem',
                        textDecoration: 'none',
                        color: 'var(--text-primary)'
                      }}
                    >
                      <p style={{ fontWeight: '500' }}>{book.name}</p>
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
