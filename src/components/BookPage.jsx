// components/BookPage.jsx - Modern book selection with Testament grouping
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const BookPage = () => {
  const [books, setBooks] = useState({ old: [], new: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();
  
  const bibleId = new URLSearchParams(location.search).get('version');
  const abbreviation = new URLSearchParams(location.search).get('abbr');

  useEffect(() => {
    const fetchBooks = async () => {
      if (!bibleId) {
        setError('No Bible version selected');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/books`,
          {
            headers: {
              'X-API-Key': '5875acef5839ebced9e807466f8ee3ce',
              'accept': 'application/json',
            },
          }
        );

        // Group books by Testament
        const bookData = response.data.data;
        const oldTestament = [];
        const newTestament = [];

        bookData.forEach(book => {
          // Common Old Testament book IDs usually start with 'GEN' through 'MAL'
          const isOldTestament = book.id.match(/^(GEN|EXO|LEV|NUM|DEU|JOS|JDG|RUT|1SA|2SA|1KI|2KI|1CH|2CH|EZR|NEH|EST|JOB|PSA|PRO|ECC|SNG|ISA|JER|LAM|EZK|DAN|HOS|JOL|AMO|OBA|JON|MIC|NAM|HAB|ZEP|HAG|ZEC|MAL)/);
          
          const bookInfo = {
            ...book,
            abbreviation: book.abbreviation || book.id,
          };

          if (isOldTestament) {
            oldTestament.push(bookInfo);
          } else {
            newTestament.push(bookInfo);
          }
        });

        setBooks({ old: oldTestament, new: newTestament });
      } catch (error) {
        console.error('Error fetching books:', error);
        setError('Failed to load books. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, [bibleId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <h2 style={{ color: 'var(--error-color)', marginBottom: '1rem' }}>Error</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error}</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Go Back Home
        </button>
      </div>
    );
  }

  const renderBookSection = (title, bookList) => {
    if (bookList.length === 0) return null;

    return (
      <div style={{ marginBottom: '3rem' }}>
        <h3 style={{ 
          fontSize: '1.5rem', 
          color: 'var(--text-secondary)',
          marginBottom: '1.5rem',
          textAlign: 'center'
        }}>
          {title}
        </h3>
        <div className="book-grid fade-in">
          {bookList.map((book) => (
            <Link
              key={book.id}
              to={`/chapter/${bibleId}/${abbreviation}/${book.id}`}
              className="book-card"
            >
              <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                {book.name}
              </div>
              {book.abbreviation && (
                <div style={{ 
                  fontSize: '0.875rem', 
                  color: 'var(--text-secondary)',
                  opacity: 0.8
                }}>
                  {book.abbreviation}
                </div>
              )}
            </Link>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="container" style={{ padding: '2rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '2rem',
          marginBottom: '0.5rem'
        }}>
          Choose a Book
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {abbreviation} Bible
        </p>
      </div>

      {/* Book Sections */}
      {renderBookSection('Old Testament', books.old)}
      {renderBookSection('New Testament', books.new)}

      {/* Navigation */}
      <div style={{ 
        marginTop: '3rem', 
        display: 'flex', 
        justifyContent: 'center' 
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate('/')}
        >
          ← Back to Bible Versions
        </button>
      </div>
    </div>
  );
};

export default BookPage;
