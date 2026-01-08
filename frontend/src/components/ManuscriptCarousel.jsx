/**
 * ManuscriptCarousel Component
 * Modern carousel display for viewing multiple manuscript translations
 * Features: Touch/swipe support, keyboard navigation, smooth transitions
 */

import React, { useState, useEffect, useRef } from 'react';
import CrossReferenceBadge from './CrossReferenceBadge';
import '../styles/manuscript-carousel.css';

const ManuscriptCarousel = ({
  manuscripts,
  viewMode,
  showRestored,
  crossRefCount,
  crossReferences,
  quotations,
  highlightRestoredNames,
  highlightQuotations,
  getLanguageClass,
  bookName
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);

  // Helper to clean verse text (strip book titles from verse 1)
  const cleanVerseText = (text, verseNum) => {
    if (!text || verseNum !== 1 || !bookName) return text;

    // Regex to match "BookName." or "BookName 1:1" at start
    // Case insensitive, optional period, optional spaces
    const pattern = new RegExp(`^${bookName}\\.?\\s*(\\d+:\\d+)?\\s*`, 'i');
    return text.replace(pattern, '').trim();
  };

  // Minimum swipe distance (in px)
  const minSwipeDistance = 50;

  // Handle touch start
  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  // Handle touch move
  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  // Handle touch end
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && activeIndex < manuscripts.length - 1) {
      goToNext();
    }
    if (isRightSwipe && activeIndex > 0) {
      goToPrevious();
    }
  };

  // Navigate to next manuscript
  const goToNext = () => {
    if (activeIndex < manuscripts.length - 1 && !isTransitioning) {
      setIsTransitioning(true);
      setActiveIndex(activeIndex + 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Navigate to previous manuscript
  const goToPrevious = () => {
    if (activeIndex > 0 && !isTransitioning) {
      setIsTransitioning(true);
      setActiveIndex(activeIndex - 1);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Navigate to specific index
  const goToIndex = (index) => {
    if (index !== activeIndex && !isTransitioning) {
      setIsTransitioning(true);
      setActiveIndex(index);
      setTimeout(() => setIsTransitioning(false), 300);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        goToPrevious();
      } else if (e.key === 'ArrowRight') {
        goToNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIndex]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!manuscripts || manuscripts.length === 0) {
    return null;
  }

  return (
    <div className="manuscript-carousel-container">
      {/* Manuscript Selector Pills */}
      <div className="manuscript-selector">
        {manuscripts.map((ms, index) => (
          <button
            key={index}
            className={`manuscript-pill ${index === activeIndex ? 'active' : ''}`}
            onClick={() => goToIndex(index)}
            aria-label={`View ${ms.name}`}
            aria-pressed={index === activeIndex}
          >
            <span className="pill-code">{ms.manuscript}</span>
            <span className="pill-lang">
              {ms.lang === 'hebrew' ? 'Hebrew' :
                ms.lang === 'greek' ? 'Greek' :
                  ms.lang === 'aramaic' ? 'Aramaic' :
                    ms.lang === 'latin' ? 'Latin' : 'English'}
            </span>
          </button>
        ))}
      </div>

      {/* Carousel Wrapper */}
      <div
        className="manuscript-carousel"
        ref={carouselRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Navigation Arrows */}
        {activeIndex > 0 && (
          <button
            className="carousel-nav carousel-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous manuscript"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </button>
        )}

        {/* Manuscript Card */}
        <div className="carousel-track">
          <div
            className="manuscript-card"
            style={{
              transform: `translateX(-${activeIndex * 100}%)`,
              transition: isTransitioning ? 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)' : 'none'
            }}
          >
            {manuscripts.map((ms, index) => (
              <div
                key={index}
                className="manuscript-slide"
                style={{
                  position: 'absolute',
                  left: `${index * 100}%`,
                  width: '100%'
                }}
              >
                <div className="manuscript-header-carousel">
                  <h3>{ms.name}</h3>
                  <div className="manuscript-meta">
                    {ms.manuscript} • {ms.lang === 'hebrew' ? 'Hebrew' : ms.lang === 'greek' ? 'Greek' : ms.lang === 'aramaic' ? 'Aramaic' : ms.lang === 'latin' ? 'Latin' : 'English'}
                  </div>
                </div>

                {viewMode === 'chapter' ? (
                  /* Chapter View: Display all verses */
                  <div className="chapter-view-content">
                    {ms.verses && ms.verses.map((verseData, vIndex) => (
                      <div key={vIndex} className="verse-row">
                        <span className="verse-number">{verseData.verse}</span>
                        <div
                          className={getLanguageClass(ms.lang)}
                          style={{ flex: 1 }}
                          dangerouslySetInnerHTML={{
                            __html: showRestored && verseData.restorations
                              ? highlightRestoredNames(cleanVerseText(verseData.text, verseData.verse), verseData.restorations, ms.manuscript)
                              : cleanVerseText(verseData.text, verseData.verse)
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  /* Verse View: Display single verse */
                  <>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <div
                        className={getLanguageClass(ms.lang)}
                        style={{ flex: 1 }}
                        dangerouslySetInnerHTML={{
                          __html: showRestored && ms.restorations
                            ? highlightRestoredNames(cleanVerseText(ms.text, 1), ms.restorations, ms.manuscript) // Force verse 1 check for single view context if needed, but 'ms' lacks verse number prop at this level usually, assuming single verse mode implies current verse.
                            : highlightQuotations(cleanVerseText(ms.text, 1), ms.manuscript === 'WEB' ? quotations : [])
                        }}
                      />
                      <CrossReferenceBadge
                        count={crossRefCount}
                        references={crossReferences}
                      />
                    </div>
                    {showRestored && ms.restored && ms.restorations && ms.restorations.length > 0 && (
                      <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#666', borderTop: '1px solid #e0e0e0', paddingTop: '0.75rem' }}>
                        <strong>Restorations:</strong>
                        <ul style={{ marginTop: '0.5rem', paddingLeft: '1.5rem' }}>
                          {ms.restorations.map((r, i) => (
                            <li key={i}>
                              {r.original} → <strong className="restored-name">{r.restored}</strong>
                              {r.strongNumber && ` (${r.strongNumber})`}
                              {r.count && ` - ${r.count}×`}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Arrows */}
        {activeIndex < manuscripts.length - 1 && (
          <button
            className="carousel-nav carousel-nav-next"
            onClick={goToNext}
            aria-label="Next manuscript"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </button>
        )}
      </div>

      {/* Carousel Indicators (Dots) */}
      <div className="carousel-indicators">
        {manuscripts.map((_, index) => (
          <button
            key={index}
            className={`indicator-dot ${index === activeIndex ? 'active' : ''}`}
            onClick={() => goToIndex(index)}
            aria-label={`Go to manuscript ${index + 1}`}
            aria-current={index === activeIndex}
          />
        ))}
      </div>

      {/* Manuscript Counter */}
      <div className="carousel-counter">
        {activeIndex + 1} / {manuscripts.length}
      </div>
    </div>
  );
};

export default ManuscriptCarousel;
