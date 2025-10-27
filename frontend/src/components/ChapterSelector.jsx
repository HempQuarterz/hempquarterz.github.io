import React, { useEffect, useState } from 'react';
import { getBookChapters } from '../api/verses';
import Loading from './Loading';

/**
 * ChapterSelector - Navigation component for selecting chapters
 *
 * Fetches available chapters for a given book from Supabase.
 *
 * @param {Object} props
 * @param {string} props.book - Book code (e.g., 'GEN')
 * @param {number} props.selectedChapter - Currently selected chapter number
 * @param {Function} props.onChapterSelect - Callback when chapter is selected: (chapterNumber) => void
 */
const ChapterSelector = ({ book, selectedChapter, onChapterSelect }) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchChapters = async () => {
      if (!book) {
        setChapters([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const chaptersData = await getBookChapters(book);
        setChapters(chaptersData);
      } catch (err) {
        console.error('Failed to load chapters:', err);
        setError('Failed to load chapters. Please try again.');
        setChapters([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChapters();
  }, [book]);

  if (!book) {
    return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Please select a book to view chapters
        </p>
      </div>
    );
  }

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
      <h3 style={{
        fontSize: '1rem',
        marginBottom: '1rem',
        color: 'var(--text-secondary)',
        fontWeight: '600'
      }}>
        Select Chapter
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(50px, 1fr))',
        gap: '0.5rem',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '0.5rem'
      }}>
        {chapters.map((chapterNum) => (
          <button
            key={chapterNum}
            onClick={() => onChapterSelect(chapterNum)}
            className={`card ${selectedChapter === chapterNum ? 'selected' : ''}`}
            aria-label={`Select chapter ${chapterNum}`}
            style={{
              textAlign: 'center',
              padding: '0.75rem 0.5rem',
              border: selectedChapter === chapterNum
                ? '2px solid var(--primary-color)'
                : '1px solid var(--border-color)',
              backgroundColor: selectedChapter === chapterNum
                ? 'var(--primary-bg, rgba(59, 130, 246, 0.1))'
                : 'var(--bg-secondary)',
              cursor: 'pointer',
              fontWeight: selectedChapter === chapterNum ? '600' : '500',
              fontSize: '0.9rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            {chapterNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ChapterSelector;
