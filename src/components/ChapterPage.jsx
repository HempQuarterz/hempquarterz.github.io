// components/ChapterPage.jsx - Modern chapter selection with grid layout
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const ChapterPage = () => {
  const [chapters, setChapters] = useState([]);
  const [bookName, setBookName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const { version: bibleId, abbr: abbreviation, book: bookId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchChapters = async () => {
      if (!bibleId || !bookId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        const response = await axios.get(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/books/${bookId}/chapters`,
          {
            headers: {
              'X-API-Key': '5875acef5839ebced9e807466f8ee3ce',
              'accept': 'application/json',
            },
          }
        );

        const chapterData = response.data.data || [];
        
        // Filter out intro chapters (usually have 'intro' in the ID)
        const regularChapters = chapterData.filter(
          chapter => !chapter.id.includes('intro')
        );

        setChapters(regularChapters);
        
        // Extract book name from the first chapter reference
        if (regularChapters.length > 0 && regularChapters[0].reference) {
          const bookNameMatch = regularChapters[0].reference.match(/^([^0-9]+)/);
          if (bookNameMatch) {
            setBookName(bookNameMatch[1].trim());
          }
        }
      } catch (error) {
        console.error('Error fetching chapters:', error);
        setError('Failed to load chapters. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [bibleId, bookId]);

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
        <button className="btn btn-primary" onClick={() => navigate(-1)}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '2rem',
          marginBottom: '0.5rem'
        }}>
          {bookName || bookId} Chapters
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {abbreviation} Bible
        </p>
      </div>

      {/* Chapters Grid */}
      <div className="chapter-grid fade-in">
        {chapters.map((chapter) => (
          <Link
            key={chapter.id}
            to={`/verse/${bibleId}/${abbreviation}/${bookId}/${chapter.id}`}
            className="chapter-card"
          >
            <div style={{ 
              fontSize: '1.5rem', 
              fontWeight: '600',
              color: 'var(--primary-color)'
            }}>
              {chapter.number}
            </div>
          </Link>
        ))}
      </div>

      {chapters.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          padding: '3rem'
        }}>
          No chapters found for this book.
        </div>
      )}

      {/* Navigation */}
      <div style={{ 
        marginTop: '3rem', 
        display: 'flex', 
        justifyContent: 'center',
        gap: '1rem'
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(`/book?version=${bibleId}&abbr=${abbreviation}`)}
        >
          ← Back to Books
        </button>
      </div>
    </div>
  );
};

export default ChapterPage;
