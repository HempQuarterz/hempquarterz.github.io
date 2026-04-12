/**
 * StudyReader - Interleaved Manuscript Study View (Option C)
 *
 * Shows verse-by-verse with original language in an inset card
 * and English translation flowing below. Continuous vertical scroll
 * for deep manuscript comparison and study.
 */

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import '../styles/scripture-reader.css';

const sanitize = (html) => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['span', 'em', 'strong', 'mark', 'sup'],
  ALLOWED_ATTR: ['class', 'title']
});

const StudyReader = ({
  manuscripts,
  showRestored,
  highlightRestoredNames,
  bookName,
  chapter,
}) => {
  // Find English (WEB) and primary original language manuscript
  const englishMs = manuscripts.find(ms => ms.manuscript === 'WEB');
  const originalMs = manuscripts.find(ms =>
    ms.lang === 'hebrew' || ms.lang === 'greek' || ms.lang === 'aramaic' || ms.lang === 'geez'
  );

  // Helper to detect WEB book title verses
  const isBookTitleVerse = (text, verseNum) => {
    if (!text || verseNum !== 1) return false;
    if (bookName) {
      const escaped = bookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (new RegExp(`^${escaped}\\.?\\s*$`, 'i').test(text.trim())) return true;
    }
    const titlePatterns = [
      /letter to/i, /letter from/i, /good news according/i,
      /^the acts of/i, /^the revelation of/i, /commonly called/i,
      /^the book of/i, /^the song of/i, /^the proverbs/i,
    ];
    if (text.length < 120 && text.endsWith('.')) {
      if (titlePatterns.some(p => p.test(text))) return true;
    }
    return false;
  };

  // Build verse pairs: original + english
  const versePairs = useMemo(() => {
    const english = englishMs?.verses || [];
    const original = originalMs?.verses || [];

    // Use English as the base, match original by verse number
    const origMap = new Map(original.map(v => [v.verse, v]));

    return english
      .filter(v => !isBookTitleVerse(v.text, v.verse))
      .map(engVerse => ({
        num: engVerse.verse,
        english: engVerse,
        original: origMap.get(engVerse.verse) || null,
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [englishMs, originalMs]);

  // Get language class for original manuscript
  const origLangClass = useMemo(() => {
    if (!originalMs) return '';
    if (originalMs.lang === 'hebrew' || originalMs.lang === 'aramaic') return 'reader-hebrew';
    if (originalMs.lang === 'greek') return 'reader-greek';
    if (originalMs.lang === 'geez') return 'reader-geez';
    return '';
  }, [originalMs]);

  const applyRestoration = (text, restorations, msCode) => {
    if (!showRestored || !restorations?.length) return sanitize(text);
    return sanitize(highlightRestoredNames(text, restorations, msCode));
  };

  if (!englishMs) return null;

  return (
    <div className="scripture-reader study-reader">
      {/* Header */}
      <div className="study-header">
        <span className="study-header-label">Study View</span>
        {originalMs && (
          <span className="study-header-sources">
            {originalMs.name} + {englishMs.name}
          </span>
        )}
      </div>

      {/* Verse-by-verse interleaved display */}
      <div className="study-verses">
        {versePairs.map(({ num, english, original }) => (
          <div key={num} className="study-verse-block">
            {/* Original language inset */}
            {original && (
              <div className={`study-original ${origLangClass}`}>
                <span className="study-original-label">{originalMs.manuscript}</span>
                <span
                  dangerouslySetInnerHTML={{
                    __html: applyRestoration(original.text, original.restorations, originalMs.manuscript)
                  }}
                />
              </div>
            )}

            {/* English flowing text */}
            <p className="study-english">
              <sup className="verse-sup">{num}</sup>
              <span
                dangerouslySetInnerHTML={{
                  __html: applyRestoration(english.text, english.restorations, 'WEB')
                }}
              />
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StudyReader;
