import React, { useEffect, useState } from 'react';
import { getChapterVerses } from '../api/verses';
import Loading from './Loading';

/**
 * VerseSelector - Navigation component for selecting verses
 *
 * Fetches available verses for a given book and chapter from Supabase.
 *
 * @param {Object} props
 * @param {string} props.book - Book code (e.g., 'GEN')
 * @param {number} props.chapter - Chapter number
 * @param {number} props.selectedVerse - Currently selected verse number
 * @param {Function} props.onVerseSelect - Callback when verse is selected: (verseNumber) => void
 */
const VerseSelector = ({ book, chapter, selectedVerse, onVerseSelect }) => {
  const [verses, setVerses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVerses = async () => {
      if (!book || !chapter) {
        setVerses([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const versesData = await getChapterVerses(book, chapter);
        setVerses(versesData);
      } catch (err) {
        console.error('Failed to load verses:', err);
        setError('Failed to load verses. Please try again.');
        setVerses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVerses();
  }, [book, chapter]);

  if (!book || !chapter) {
    return (
      <div className="card" style={{ padding: '1.5rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', margin: 0 }}>
          Please select a book and chapter to view verses
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
        Select Verse
      </h3>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(45px, 1fr))',
        gap: '0.5rem',
        maxHeight: '300px',
        overflowY: 'auto',
        padding: '0.5rem'
      }}>
        {verses.map((verseNum) => (
          <button
            key={verseNum}
            onClick={() => onVerseSelect(verseNum)}
            className={`card ${selectedVerse === verseNum ? 'selected' : ''}`}
            aria-label={`Select verse ${verseNum}`}
            style={{
              textAlign: 'center',
              padding: '0.75rem 0.5rem',
              border: selectedVerse === verseNum
                ? '2px solid var(--primary-color)'
                : '1px solid var(--border-color)',
              backgroundColor: selectedVerse === verseNum
                ? 'var(--primary-bg, rgba(59, 130, 246, 0.1))'
                : 'var(--bg-secondary)',
              cursor: 'pointer',
              fontWeight: selectedVerse === verseNum ? '600' : '500',
              fontSize: '0.85rem',
              transition: 'all var(--transition-fast)'
            }}
          >
            {verseNum}
          </button>
        ))}
      </div>
    </div>
  );
};

export default VerseSelector;
