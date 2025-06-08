import React, { useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectSelectedVerse, selectLoading, selectError, fetchVerse } from '../bibleSlice';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import '../styles/modern.css';

const ScripturePage = () => {
  const dispatch = useDispatch();
  const verse = useSelector(selectSelectedVerse);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const { bibleId, abbr, book, chapter, verseId } = useParams();
  const navigate = useNavigate();
 

  useEffect(() => {
    console.log('Bible ID:', bibleId); 
    console.log('Verse ID:', verseId); 

    if (bibleId && verseId) {
      dispatch(fetchVerse({ bibleId, verseId }));
    }
  }, [dispatch, bibleId, verseId]);

  const createMarkup = (htmlString) => {
    return { __html: htmlString };
  };

  return (
    <div className="fade-in">
      <ModernHeader title="Scripture" />
      
      <main className="container" style={{ paddingTop: '2rem' }}>
        {loading ? (
          <Loading type="verse" />
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--error)' }}>Error loading verse</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              onClick={() => dispatch(fetchVerse({ bibleId, verseId }))}
            >
              Retry
            </button>
          </div>
        ) : verse && verse.content ? (
          <div>
            <div className="verse-card">
              <h2 style={{ 
                marginBottom: '1rem', 
                fontSize: '1.5rem',
                color: 'var(--primary)'
              }}>
                {verse.reference || verseId}
              </h2>
              <div 
                className="verse-content"
                dangerouslySetInnerHTML={createMarkup(verse.content)} 
              />
            </div>
            
            {/* Action Buttons */}
            <div style={{ 
              marginTop: '2rem',
              display: 'flex',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <button className="btn btn-primary">
                <span style={{ marginRight: '0.5rem' }}>⭐</span>
                Save Verse
              </button>
              <button className="btn btn-secondary">
                <span style={{ marginRight: '0.5rem' }}>📤</span>
                Share
              </button>
              <button className="btn btn-secondary">
                <span style={{ marginRight: '0.5rem' }}>📋</span>
                Copy
              </button>
            </div>

            {/* Navigation */}
            <div style={{ 
              marginTop: '3rem',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
              >
                ← Previous
              </button>
              <Link 
                to={`/verse/${bibleId}/${abbr}/${book}/${chapter}`}
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
              >
                View Chapter
              </Link>
              <button className="btn btn-secondary">
                Next →
              </button>
            </div>
          </div>
        ) : (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p>No verse content available</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default ScripturePage;
