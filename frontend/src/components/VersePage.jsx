import React, { useEffect, useMemo, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import DOMPurify from 'dompurify';
import { selectVerses, selectChapterText, selectLoading, selectError, fetchChapterText, fetchVerses } from '../bibleSlice';
import ModernHeader from './ModernHeader';
import Loading from './Loading';
import '../styles/modern.css';

const VersePage = () => {
  const dispatch = useDispatch();
  const versesData = useSelector(selectVerses);
  const verses = useMemo(() => versesData || [], [versesData]);
  const chapterText = useSelector(selectChapterText);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const { version: bibleId, abbr: abbreviation, book: bookId, chapter: chapterId } = useParams();

  useEffect(() => {
    if (bibleId && abbreviation && bookId && chapterId) {
      dispatch(fetchVerses({ bibleId, chapterId }));
      dispatch(fetchChapterText({ bibleId, bookId, chapterId }));
    }
  }, [dispatch, bibleId, bookId, chapterId, abbreviation]);

  // Memoize formatting function
  const formatChapterContent = useCallback((content) => {
    if (!content) return '';

    // Add data attributes to verse numbers for CSS targeting
    let formattedContent = content.replace(
      /<sup class="v">(\d+)<\/sup>/g,
      (match, verseNum) => {
        const num = parseInt(verseNum);
        // Add line break after every 10th verse
        if (num % 10 === 0 && num !== 0) {
          return `<sup class="v" data-verse-num="${num}">${verseNum}</sup><br class="verse-group-break"/>`;
        }
        return `<sup class="v" data-verse-num="${num}">${verseNum}</sup>`;
      }
    );

    // Also handle span.v elements
    formattedContent = formattedContent.replace(
      /<span class="v">(\d+)<\/span>/g,
      (match, verseNum) => {
        const num = parseInt(verseNum);
        if (num % 10 === 0 && num !== 0) {
          return `<span class="v" data-verse-num="${num}">${verseNum}</span><br class="verse-group-break"/>`;
        }
        return `<span class="v" data-verse-num="${num}">${verseNum}</span>`;
      }
    );

    return formattedContent;
  }, []);

  // Sanitize HTML before rendering
  const createSafeMarkup = useCallback((htmlString) => {
    const sanitized = DOMPurify.sanitize(htmlString, {
      ALLOWED_TAGS: ['p', 'span', 'sup', 'br', 'em', 'strong', 'i', 'b'],
      ALLOWED_ATTR: ['class', 'data-verse-num']
    });
    return { __html: sanitized };
  }, []);

  return (
    <div className="fade-in">
      <ModernHeader title={`${bookId} ${chapterId?.replace(bookId + '.', '') || chapterId || ''}`} />

      <main className="container" style={{ paddingTop: '2rem' }}>
        {/* Chapter Content */}
        {loading ? (
          <Loading type="verse" />
        ) : error ? (
          <div
            className="card"
            style={{ textAlign: 'center', padding: '2rem' }}
            role="alert"
          >
            <p style={{ color: 'var(--error)' }}>Error loading content: {error}</p>
            <button
              className="btn btn-primary"
              style={{ marginTop: '1rem' }}
              onClick={() => {
                dispatch(fetchVerses({ bibleId, chapterId }));
                dispatch(fetchChapterText({ bibleId, bookId, chapterId }));
              }}
              aria-label="Retry loading chapter"
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Chapter Text */}
            {chapterText && chapterText.content && (
              <article className="verse-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                  {chapterText.reference || `${bookId} ${chapterId?.replace(bookId + '.', '') || chapterId || ''}`}
                </h2>
                <div
                  className="verse-content"
                  dangerouslySetInnerHTML={createSafeMarkup(formatChapterContent(chapterText.content))}
                />
              </article>
            )}

            {/* Verse Navigation */}
            {verses && verses.length > 0 ? (
              <nav style={{ marginTop: '3rem' }} aria-label="Verse navigation">
                <h3 style={{
                  fontSize: '1.25rem',
                  marginBottom: '1rem',
                  color: 'var(--text-secondary)'
                }}>
                  Navigate to Verse
                </h3>
                <div className="grid grid-cols-4" style={{ gap: '0.5rem' }}>
                  {verses.map((verse) => {
                    const verseNumber = verse.reference ? verse.reference.split(':').pop() : verse.id;
                    return (
                      <Link
                        key={verse.id}
                        to={`/scripture/${bibleId}/${bibleId}/${abbreviation}/${bookId}/${chapterId}/${verse.id}`}
                        className="btn btn-secondary"
                        aria-label={`Go to verse ${verseNumber}`}
                        style={{
                          textAlign: 'center',
                          padding: '0.75rem',
                          fontSize: '0.875rem'
                        }}
                      >
                        {verseNumber}
                      </Link>
                    );
                  })}
                </div>
              </nav>
            ) : (!loading && (
              <div className="card" style={{ textAlign: 'center', padding: '2rem', marginTop: '2rem' }}>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {!chapterText && !verses.length ? 'No content found for this chapter' :
                   !chapterText ? 'Chapter text not available' :
                   !verses.length ? 'No individual verses available' :
                   'Content not available'}
                </p>
                <p style={{ fontSize: '0.875rem', marginTop: '0.5rem', color: 'var(--text-tertiary)' }}>
                  Chapter ID: {chapterId}
                </p>
              </div>
            ))}
          </>
        )}
      </main>
    </div>
  );
};

export default VersePage;
