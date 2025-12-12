import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_CONFIG, getApiHeaders } from '../config/api';
import { logApiError } from '../utils/debug';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import '../styles/modern.css';

const ChapterPage = () => {
  const [chapterList, setChapterList] = useState([]);
  const [chapterContent, setChapterContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { version: bibleId, abbr: abbreviation, book: bookId } = useParams();
  const { chapterId } = useParams();

  useEffect(() => {
    const abortController = new AbortController();

    const fetchChapters = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/bibles/${bibleId}/books/${bookId}/chapters`,
          {
            headers: getApiHeaders(),
            signal: abortController.signal
          }
        );

        setChapterList(response.data.data);
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          logApiError(`/bibles/${bibleId}/books/${bookId}/chapters`, err);
          setError('Failed to load chapters. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    if (bibleId && abbreviation && bookId) {
      fetchChapters();
    }

    return () => {
      abortController.abort();
    };
  }, [bibleId, abbreviation, bookId]);

  useEffect(() => {
    const abortController = new AbortController();

    const fetchChapterContent = async () => {
      try {
        const response = await axios.get(
          `${API_CONFIG.BASE_URL}/bibles/${bibleId}/chapters/${chapterId}`,
          {
            headers: getApiHeaders(),
            signal: abortController.signal
          }
        );

        setChapterContent(response.data.data);
      } catch (err) {
        if (err.name !== 'AbortError' && err.name !== 'CanceledError') {
          logApiError(`/bibles/${bibleId}/chapters/${chapterId}`, err);
        }
      }
    };

    if (bibleId && chapterId) {
      fetchChapterContent();
    }

    return () => {
      abortController.abort();
    };
  }, [bibleId, chapterId]);

  return (
    <div className="fade-in">
      <ModernHeader title={bookId} />

      <main className="container" style={{ paddingTop: '2rem' }}>
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Select a Chapter</h2>
          <p style={{ color: 'var(--text-secondary)' }}>{abbreviation} - {bookId}</p>
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
          <div className="grid grid-cols-4" style={{ gap: '0.75rem' }}>
            {chapterList.map((chapter) => (
              <Link
                key={chapter.id}
                to={`/verse/${bibleId}/${abbreviation}/${bookId}/${chapter.id}`}
                className="card"
                aria-label={`Chapter ${chapter.number}`}
                style={{
                  textAlign: 'center',
                  padding: '1.5rem',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem',
                  fontWeight: '500'
                }}
              >
                {chapter.number}
              </Link>
            ))}
          </div>
        )}

        {chapterContent && chapterContent.length > 0 && (
          <div className="verse-card" style={{ marginTop: '2rem' }}>
            {chapterContent.map((verse, index) => (
              <p key={index} style={{ marginBottom: '1rem' }}>{verse}</p>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default ChapterPage;
