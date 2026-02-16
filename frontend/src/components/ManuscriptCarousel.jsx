/**
 * ManuscriptCarousel Component
 * Modern carousel display for viewing multiple manuscript translations
 * Features: Touch/swipe support, keyboard navigation, smooth transitions
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, useAnimation } from 'framer-motion';
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
  const [isTransitioning, setIsTransitioning] = useState(false);
  const carouselRef = useRef(null);
  const controls = useAnimation();

  // Calculate slide width for drag constraints
  const getSlideWidth = useCallback(() => {
    if (carouselRef.current) {
      return carouselRef.current.offsetWidth;
    }
    return 0;
  }, []);

  // Helper to clean verse text (strip book titles from verse 1)
  const cleanVerseText = (text, verseNum) => {
    if (!text || verseNum !== 1 || !bookName) return text;

    // Regex to match "BookName." or "BookName 1:1" at start
    // Case insensitive, optional period, optional spaces
    const pattern = new RegExp(`^${bookName}\\.?\\s*(\\d+:\\d+)?\\s*`, 'i');
    return text.replace(pattern, '').trim();
  };

  // Navigate to specific index with animation
  const goToIndex = useCallback((index) => {
    if (index !== activeIndex && !isTransitioning && index >= 0 && index < manuscripts.length) {
      setIsTransitioning(true);
      setActiveIndex(index);
      controls.start({
        x: -index * getSlideWidth(),
        transition: { type: "spring", stiffness: 300, damping: 30 }
      });
      setTimeout(() => setIsTransitioning(false), 400);
    }
  }, [activeIndex, isTransitioning, manuscripts.length, controls, getSlideWidth]);

  // Navigate to next manuscript
  const goToNext = useCallback(() => {
    if (activeIndex < manuscripts.length - 1 && !isTransitioning) {
      goToIndex(activeIndex + 1);
    }
  }, [activeIndex, manuscripts.length, isTransitioning, goToIndex]);

  // Navigate to previous manuscript
  const goToPrevious = useCallback(() => {
    if (activeIndex > 0 && !isTransitioning) {
      goToIndex(activeIndex - 1);
    }
  }, [activeIndex, isTransitioning, goToIndex]);

  // Handle drag end with velocity-based momentum
  const handleDragEnd = (event, info) => {
    const slideWidth = getSlideWidth();
    const velocity = info.velocity.x;
    const offset = info.offset.x;

    // Determine swipe direction based on velocity and offset
    // High velocity = quick swipe, low velocity = drag based on distance
    const swipeThreshold = 100; // velocity threshold
    const dragThreshold = slideWidth * 0.2; // 20% of slide width

    let newIndex = activeIndex;

    if (velocity < -swipeThreshold || (velocity > -swipeThreshold && offset < -dragThreshold)) {
      // Swiped left - go to next
      newIndex = Math.min(activeIndex + 1, manuscripts.length - 1);
    } else if (velocity > swipeThreshold || (velocity < swipeThreshold && offset > dragThreshold)) {
      // Swiped right - go to previous
      newIndex = Math.max(activeIndex - 1, 0);
    }

    // Snap to the target slide with spring animation
    goToIndex(newIndex);
  };

  // Update animation when activeIndex changes
  useEffect(() => {
    controls.start({
      x: -activeIndex * getSlideWidth(),
      transition: { type: "spring", stiffness: 300, damping: 30 }
    });
  }, [activeIndex, controls, getSlideWidth]);

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
      >
        {/* Navigation Arrows */}
        {activeIndex > 0 && (
          <motion.button
            className="carousel-nav carousel-nav-prev"
            onClick={goToPrevious}
            aria-label="Previous manuscript"
            aria-controls="manuscript-carousel-track"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
          </motion.button>
        )}

        {/* Manuscript Card - Draggable with momentum */}
        <div className="carousel-track" id="manuscript-carousel-track">
          <motion.div
            className="manuscript-card carousel-draggable"
            drag="x"
            dragConstraints={{
              left: -(manuscripts.length - 1) * getSlideWidth(),
              right: 0
            }}
            dragElastic={0.1}
            onDragEnd={handleDragEnd}
            animate={controls}
            whileDrag={{ cursor: 'grabbing' }}
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
                      <div className="carousel-restorations">
                        <strong>Restorations:</strong>
                        <ul className="carousel-restorations-list">
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
          </motion.div>
        </div>

        {/* Navigation Arrows */}
        {activeIndex < manuscripts.length - 1 && (
          <motion.button
            className="carousel-nav carousel-nav-next"
            onClick={goToNext}
            aria-label="Next manuscript"
            aria-controls="manuscript-carousel-track"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6"></polyline>
            </svg>
          </motion.button>
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
