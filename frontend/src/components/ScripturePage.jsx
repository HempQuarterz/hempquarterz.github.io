import React, { useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import DOMPurify from 'dompurify';
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
    if (bibleId && verseId) {
      dispatch(fetchVerse({ bibleId, verseId }));
    }
  }, [dispatch, bibleId, verseId]);

  // Sanitize HTML before rendering
  const createSafeMarkup = useCallback((htmlString) => {
    const sanitized = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['p', 'span', 'sup', 'br', 'em', 'strong', 'i', 'b'],
      ALLOWED_ATTR: ['class']
    });
    return { __html: sanitized };
  }, []);

  const handleSaveVerse = useCallback(() => {
    // TODO: Implement save verse functionality
    alert('Save verse feature coming soon!');
  }, []);

  const handleShareVerse = useCallback(async () => {
    if (navigator.share && verse) {
      try {
        await navigator.share({
          title: verse.reference || 'Bible Verse',
          text: verse.content?.replace(/<[^>]*>/g, '') || '',
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          alert('Sharing failed. Please try again.');
        }
      }
    } else {
      alert('Share feature not supported on this device.');
    }
  }, [verse]);

  const handleCopyVerse = useCallback(async () => {
    if (verse && verse.content) {
      try {
        const textContent = verse.content.replace(/<[^>]*>/g, '');
        await navigator.clipboard.writeText(`${verse.reference || ''}\n${textContent}`);
        alert('Verse copied to clipboard!');
      } catch (err) {
        alert('Failed to copy verse. Please try again.');
      }
    }
  }, [verse]);

  return (
    <div className="fade-in">
      <ModernHeader title="Scripture" />

      <main className="container" style={{ paddingTop: '2rem' }}>
        {loading ? (
          <Loading type="verse" />
        ) : error ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '2rem' }}
            role="alert"
          >
            <p style={{ color: 'var(--error)' }}>Error loading verse: {error}</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => dispatch(fetchVerse({ bibleId, verseId }))}
              aria-label="Retry loading verse"
            >
              Retry
            </button>
          </div>
        ) : verse && verse.content ? (
          <div>
            <article className="verse-card">
              <h2 style={{
                marginBottom: '1rem',
                fontSize: '1.5rem',
                color: 'var(--primary)'
              }}>
                {verse.reference || verseId}
              </h2>
              <div
                className="verse-content"
                dangerouslySetInnerHTML={createSafeMarkup(verse.content)}
              />
            </article>

            {/* Action Buttons */}
            <div
              role="toolbar"
              aria-label="Verse actions"
              style={{
                marginTop: '2rem',
                display: 'flex',
                gap: '1rem',
                flexWrap: 'wrap'
              }}
            >
              <button
                className="btn btn-primary"
                onClick={handleSaveVerse}
                aria-label="Save this verse"
              >
                <span style={{ marginRight: '0.5rem' }} aria-hidden="true">⭐</span>
                Save Verse
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleShareVerse}
                aria-label="Share this verse"
              >
                <span style={{ marginRight: '0.5rem' }} aria-hidden="true">📤</span>
                Share
              </button>
              <button
                className="btn btn-secondary"
                onClick={handleCopyVerse}
                aria-label="Copy verse to clipboard"
              >
                <span style={{ marginRight: '0.5rem' }} aria-hidden="true">📋</span>
                Copy
              </button>
            </div>

            {/* Navigation */}
            <nav
              aria-label="Verse navigation"
              style={{
                marginTop: '3rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                className="btn btn-secondary"
                onClick={() => navigate(-1)}
                aria-label="Go back to previous page"
              >
                ← Previous
              </button>
              <Link
                to={`/verse/${bibleId}/${abbr}/${book}/${chapter}`}
                className="btn btn-secondary"
                style={{ textDecoration: 'none' }}
                aria-label="View full chapter"
              >
                View Chapter
              </Link>
              <button
                className="btn btn-secondary"
                disabled
                aria-label="Next verse (not implemented)"
                title="Next verse navigation coming soon"
              >
                Next →
              </button>
            </nav>
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
