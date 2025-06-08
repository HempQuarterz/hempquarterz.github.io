import React, { useEffect, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
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
    console.log('VersePage - Bible ID:', bibleId); 
    console.log('VersePage - Abbreviation:', abbreviation);
    console.log('VersePage - Book ID:', bookId);
    console.log('VersePage - Chapter ID:', chapterId); 
    
    if (bibleId && abbreviation && bookId && chapterId) {
        console.log("VersePage - Fetching verses and chapter text...")
        console.log("VersePage - fetchVerses params:", { bibleId, chapterId });
        console.log("VersePage - fetchChapterText params:", { bibleId, bookId, chapterId });
        
        dispatch(fetchVerses({ bibleId, chapterId }));
        dispatch(fetchChapterText({ bibleId, bookId, chapterId }));
      } else {
        console.error("VersePage - Missing required parameters:", { bibleId, abbreviation, bookId, chapterId });
      }
    }, [dispatch, bibleId, bookId, chapterId, abbreviation]);

    // Debug log the Redux state
    useEffect(() => {
      console.log('VersePage - Redux State:', {
        verses,
        chapterText,
        loading,
        error,
        versesLength: verses ? verses.length : 0,
        hasChapterText: !!chapterText
      });
    }, [verses, chapterText, loading, error]);

    const createMarkup = (htmlString) => {
      return { __html: htmlString };
    };

    const formatChapterContent = (content) => {
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
    };

   
  return (
    <div className="fade-in">
      <ModernHeader title={`${bookId} ${chapterId?.replace(bookId + '.', '') || chapterId || ''}`} />
      
      <main className="container" style={{ paddingTop: '2rem' }}>
        {/* Chapter Content */}
        {loading ? (
          <Loading type="verse" />
        ) : error ? (
          <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
            <p style={{ color: 'var(--error)' }}>Error loading content</p>
            <button 
              className="btn btn-primary" 
              style={{ marginTop: '1rem' }}
              onClick={() => {
                dispatch(fetchVerses({ bibleId, chapterId }));
                dispatch(fetchChapterText({ bibleId, bookId, chapterId }));
              }}
            >
              Retry
            </button>
          </div>
        ) : (
          <>
            {/* Chapter Text */}
            {chapterText && chapterText.content && (
              <div className="verse-card" style={{ marginBottom: '2rem' }}>
                <h2 style={{ marginBottom: '1rem', fontSize: '1.5rem' }}>
                  {chapterText.reference || `${bookId} ${chapterId?.replace(bookId + '.', '') || chapterId || ''}`}
                </h2>
                <div 
                  className="verse-content"
                  dangerouslySetInnerHTML={createMarkup(formatChapterContent(chapterText.content))} 
                />
              </div>
            )}

            {/* Verse Navigation */}
            {verses && verses.length > 0 ? (
              <div style={{ marginTop: '3rem' }}>
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
              </div>
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
