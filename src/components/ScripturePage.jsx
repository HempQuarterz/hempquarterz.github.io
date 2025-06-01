// components/ScripturePage.jsx - Modern scripture display with better text structure
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { selectChapterText, fetchChapterText } from '../bibleSlice';

const ScripturePage = () => {
  const chapterText = useSelector(selectChapterText);
  const { bibleId, version, abbr, book, verseId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [fontSize, setFontSize] = useState('medium');
  const [highlightedVerse, setHighlightedVerse] = useState(null);

  useEffect(() => {
    const loadChapter = async () => {
      setLoading(true);
      if (bibleId && verseId) {
        await dispatch(fetchChapterText({ bibleId, chapterId: verseId }));
      }
      setLoading(false);
    };
    
    loadChapter();
  }, [dispatch, bibleId, verseId]);

  // Parse and structure the HTML content
  const parseScriptureContent = (htmlContent) => {
    if (!htmlContent) return null;
    
    // Create a temporary div to parse HTML
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Extract verses with proper structure
    const verses = [];
    const verseElements = tempDiv.querySelectorAll('.v, .verse, [data-verse], span[class*="verse"]');
    
    if (verseElements.length === 0) {
      // Fallback: try to parse as plain text with verse numbers
      const textContent = tempDiv.textContent;
      const verseMatches = textContent.match(/(\d+)\s*([^0-9]+)/g);
      
      if (verseMatches) {
        verseMatches.forEach((match) => {
          const verseMatch = match.match(/^(\d+)\s*(.+)/);
          if (verseMatch) {
            verses.push({
              number: verseMatch[1],
              text: verseMatch[2].trim()
            });
          }
        });
      } else {
        // If no verse numbers found, return as single block
        verses.push({
          number: null,
          text: textContent
        });
      }
    } else {
      // Parse structured verse elements
      verseElements.forEach((element) => {
        const verseNum = element.getAttribute('data-verse') || 
                        element.className.match(/verse-(\d+)/) || 
                        element.textContent.match(/^(\d+)/);
        
        const number = verseNum ? (Array.isArray(verseNum) ? verseNum[1] : verseNum) : null;
        const text = element.textContent.replace(/^\d+\s*/, '').trim();
        
        if (text) {
          verses.push({ number, text });
        }
      });
    }
    
    return verses;
  };

  const getFontSizeClass = () => {
    switch (fontSize) {
      case 'small': return '1rem';
      case 'large': return '1.5rem';
      case 'extra-large': return '1.75rem';
      default: return '1.25rem';
    }
  };

  const handleVerseClick = (verseNumber) => {
    setHighlightedVerse(verseNumber === highlightedVerse ? null : verseNumber);
  };

  const copyVerse = (verse) => {
    const reference = `${book} ${verseId.split('.')[1]}:${verse.number} (${abbr})`;
    const textToCopy = `${verse.text}\n\n- ${reference}`;
    navigator.clipboard.writeText(textToCopy);
    
    // Show toast notification (you'd implement this)
    alert('Verse copied to clipboard!');
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const verses = chapterText && chapterText.content ? parseScriptureContent(chapterText.content) : [];
  const chapterInfo = chapterText || {};

  return (
    <div className="scripture-container">
      {/* Scripture Header */}
      <div className="scripture-header">
        <h2 className="scripture-title">{chapterInfo.reference || `${book} ${verseId}`}</h2>
        <div className="scripture-reference">{abbr} - {version}</div>
        
        {/* Text Controls */}
        <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          <button 
            className="btn btn-secondary"
            onClick={() => setFontSize('small')}
            style={{ opacity: fontSize === 'small' ? 1 : 0.6 }}
          >
            A-
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setFontSize('medium')}
            style={{ opacity: fontSize === 'medium' ? 1 : 0.6 }}
          >
            A
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setFontSize('large')}
            style={{ opacity: fontSize === 'large' ? 1 : 0.6 }}
          >
            A+
          </button>
          <button 
            className="btn btn-secondary"
            onClick={() => setFontSize('extra-large')}
            style={{ opacity: fontSize === 'extra-large' ? 1 : 0.6 }}
          >
            A++
          </button>
        </div>
      </div>

      {/* Scripture Content */}
      <div 
        className="scripture-content" 
        style={{ fontSize: getFontSizeClass() }}
      >
        {verses.length > 0 ? (
          verses.map((verse, index) => (
            <div 
              key={index} 
              className={`verse ${highlightedVerse === verse.number ? 'highlighted' : ''}`}
              onClick={() => verse.number && handleVerseClick(verse.number)}
              style={{
                backgroundColor: highlightedVerse === verse.number ? 'rgba(var(--primary-color), 0.1)' : 'transparent',
                paddingLeft: highlightedVerse === verse.number ? '1rem' : '0'
              }}
            >
              {verse.number && (
                <span className="verse-number">{verse.number}</span>
              )}
              <span className="verse-text">{verse.text}</span>
              
              {highlightedVerse === verse.number && (
                <button
                  className="btn btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    copyVerse(verse);
                  }}
                  style={{ 
                    marginLeft: '1rem', 
                    padding: '0.25rem 0.75rem',
                    fontSize: '0.75rem'
                  }}
                >
                  Copy
                </button>
              )}
            </div>
          ))
        ) : (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
            No content available for this chapter.
          </div>
        )}
      </div>

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
          onClick={() => navigate(-1)}
        >
          ← Previous
        </button>
        
        <button 
          className="btn btn-primary" 
          onClick={() => navigate(`/verse/${version}/${abbr}/${book}/${verseId}`)}
        >
          View All Verses
        </button>
        
        <button 
          className="btn btn-secondary" 
          onClick={() => {
            // Navigate to next chapter logic
            const currentChapter = parseInt(verseId.split('.')[1]);
            const nextChapterId = verseId.replace(/\.\d+$/, `.${currentChapter + 1}`);
            navigate(`/scripture/${bibleId}/${version}/${abbr}/${book}/${nextChapterId}`);
          }}
        >
          Next →
        </button>
      </div>
    </div>
  );
};

export default ScripturePage;