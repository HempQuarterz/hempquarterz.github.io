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

  // Helper to detect if verse 1 text is a WEB book title (not actual verse content)
  const isBookTitleVerse = (text, verseNum) => {
    if (!text || verseNum !== 1) return false;

    // Check if text is just the book name (e.g., "1 Kings.", "Genesis.", "Exodus.")
    if (bookName) {
      const escaped = bookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameOnly = new RegExp(`^${escaped}\\.?\\s*$`, 'i');
      if (nameOnly.test(text.trim())) return true;
    }

    // WEB stores book headings as verse 1 for many books.
    // Title patterns: "Paul's Letter to the Romans.", "The Good News According to Matthew.", etc.
    const titlePatterns = [
      /letter to/i,
      /letter from/i,
      /^\w+['\u2019]s\s+(first|second|third)?\s*letter/i,  // "Peter\u2019s First Letter.", "John\u2019s Second Letter."
      /good news according/i,
      /^the acts of/i,
      /^the revelation of/i,
      /commonly called/i,
      /^the book of/i,
      /^the first book of/i,
      /^the second book of/i,
      /^the song of/i,
      /^the lament/i,
      /^the proverbs/i,
      /^the prophecy of/i,
      /^the book of the prophet/i,
    ];
    // Short text ending with period that matches a known title pattern
    if (text.length < 120 && text.endsWith('.')) {
      if (titlePatterns.some(p => p.test(text))) return true;
      // Also catch if text contains the book name and is short (likely a title)
      if (bookName && text.toLowerCase().includes(bookName.toLowerCase()) && text.split(' ').length < 15) {
        return true;
      }
    }
    return false;
  };

  // Helper to clean verse text (strip book titles from verse 1)
  const cleanVerseText = (text, verseNum) => {
    if (!text || verseNum !== 1 || !bookName) return text;

    // If entire text is a book title, return null to signal filtering
    if (isBookTitleVerse(text, verseNum)) return null;

    // Escape special regex characters in book name
    const escaped = bookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Regex to match "BookName." or "BookName 1:1" at start
    const pattern = new RegExp(`^${escaped}\\.?\\s*(\\d+:\\d+)?\\s*`, 'i');
    const cleaned = text.replace(pattern, '').trim();
    // Never return empty — if stripping would blank the verse, keep original
    return cleaned || text;
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
                    {ms.verses && (() => {
                      const filtered = ms.verses.filter(v => !isBookTitleVerse(v.text, v.verse));
                      const verseOffset = filtered.length < ms.verses.length ? 1 : 0;
                      return filtered.map((verseData, vIndex) => (
                        <div key={vIndex} className="verse-row">
                          <span className="verse-number">{verseData.verse - verseOffset}</span>
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
                      ));
                    })()}
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
                            ? highlightRestoredNames(cleanVerseText(ms.text, ms.verse) || ms.text, ms.restorations, ms.manuscript)
                            : highlightQuotations(cleanVerseText(ms.text, ms.verse) || ms.text, ms.manuscript === 'WEB' ? quotations : [])
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
