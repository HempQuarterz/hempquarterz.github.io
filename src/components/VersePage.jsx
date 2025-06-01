// components/VersePage.jsx - Modern verse listing with enhanced UI
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { fetchChapterVerses, fetchChapterText } from '../bibleSlice';
import axios from 'axios';

const VersePage = () => {
  const dispatch = useDispatch();
  const [verses, setVerses] = useState([]);
  const [chapterInfo, setChapterInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPreview, setShowPreview] = useState(true);
  
  const { version: bibleId, abbr: abbreviation, book: bookId, chapter: chapterId } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchVerseData = async () => {
      if (!bibleId || !chapterId) {
        setError('Missing required parameters');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        // Fetch verses for the chapter
        const response = await axios.get(
          `https://api.scripture.api.bible/v1/bibles/${bibleId}/chapters/${chapterId}/verses`,
          {
            headers: {
              'X-API-Key': '5875acef5839ebced9e807466f8ee3ce',
              'accept': 'application/json',
            },
          }
        );

        const verseData = response.data.data || [];
        setVerses(verseData);

        // Extract chapter info from first verse if available
        if (verseData.length > 0) {
          const firstVerse = verseData[0];
          const referenceMatch = firstVerse.reference?.match(/^(.+?)\s+(\d+)/);
          if (referenceMatch) {
            setChapterInfo({
              bookName: referenceMatch[1],
              chapterNumber: referenceMatch[2]
            });
          }
        }

        // Also fetch chapter text for preview (optional)
        try {
          await dispatch(fetchChapterText({ bibleId, chapterId }));
        } catch (err) {
          console.warn('Could not fetch chapter preview:', err);
        }

      } catch (error) {
        console.error('Error fetching verses:', error);
        setError('Failed to load verses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchVerseData();
  }, [dispatch, bibleId, chapterId]);

  const extractVerseNumber = (verse) => {
    // Extract verse number from ID or reference
    const match = verse.id?.match(/\.(\d+)$/) || verse.reference?.match(/:(\d+)$/);
    return match ? match[1] : verse.id;
  };

  const extractVerseText = (verse) => {
    // If verse has text property, use it; otherwise extract from reference
    if (verse.text) return verse.text;
    if (verse.reference) {
      const textMatch = verse.reference.match(/:\d+\s+(.+)/);
      return textMatch ? textMatch[1] : '';
    }
    return '';
  };

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
    <div className="container" style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: "'Playfair Display', serif", 
          fontSize: '2rem',
          marginBottom: '0.5rem'
        }}>
          {chapterInfo.bookName} Chapter {chapterInfo.chapterNumber}
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          {abbreviation} Bible - {verses.length} verses
        </p>
      </div>

      {/* Toggle Preview Button */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <button 
          className="btn btn-secondary"
          onClick={() => setShowPreview(!showPreview)}
          style={{ fontSize: '0.875rem' }}
        >
          {showPreview ? 'Hide' : 'Show'} Verse Previews
        </button>
      </div>

      {/* Verses List */}
      <div className="fade-in" style={{ marginBottom: '3rem' }}>
        {verses.map((verse) => {
          const verseNumber = extractVerseNumber(verse);
          const verseText = extractVerseText(verse);
          
          return (
            <Link
              key={verse.id}
              to={`/scripture/${bibleId}/${abbreviation}/${bookId}/${verse.id}`}
              style={{ 
                display: 'block',
                padding: '1rem',
                marginBottom: '0.75rem',
                borderRadius: 'var(--border-radius)',
                backgroundColor: 'var(--card-bg)',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                border: '1px solid transparent',
                ':hover': {
                  backgroundColor: 'var(--card-hover)',
                  borderColor: 'var(--primary-color)',
                  transform: 'translateY(-2px)'
                }
              }}
              className="verse-item"
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ 
                  minWidth: '3rem',
                  height: '3rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: 'var(--primary-color)',
                  color: 'white',
                  borderRadius: 'var(--border-radius)',
                  fontWeight: '600',
                  fontSize: '1.125rem'
                }}>
                  {verseNumber}
                </div>
                
                <div style={{ flex: 1 }}>
                  <div style={{ 
                    fontWeight: '500',
                    marginBottom: showPreview && verseText ? '0.5rem' : 0,
                    color: 'var(--text-primary)'
                  }}>
                    {verse.reference || `Verse ${verseNumber}`}
                  </div>
                  
                  {showPreview && verseText && (
                    <div style={{ 
                      fontSize: '0.875rem',
                      color: 'var(--text-secondary)',
                      lineHeight: '1.5',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical'
                    }}>
                      {verseText}
                    </div>
                  )}
                </div>
                
                <div style={{ 
                  color: 'var(--primary-color)',
                  fontSize: '1.25rem'
                }}>
                  →
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {verses.length === 0 && (
        <div style={{ 
          textAlign: 'center', 
          color: 'var(--text-secondary)',
          padding: '3rem'
        }}>
          No verses found for this chapter.
        </div>
      )}

      {/* Navigation */}
      <div style={{ 
        marginTop: '3rem', 
        display: 'flex', 
        justifyContent: 'space-between',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <button 
          className="btn btn-secondary" 
          onClick={() => navigate(`/chapter/${bibleId}/${abbreviation}/${bookId}`)}
        >
          ← Back to Chapters
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={() => {
            if (verses.length > 0) {
              navigate(`/scripture/${bibleId}/${abbreviation}/${bookId}/${verses[0].id}`);
            }
          }}
          disabled={verses.length === 0}
        >
          Read Full Chapter →
        </button>
      </div>
    </div>
  );
};

export default VersePage;
