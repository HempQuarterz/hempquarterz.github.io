/**
 * ScriptureReader - Flowing Prose Bible Reader (Option A)
 *
 * Renders chapter text as continuous flowing paragraphs with
 * superscript verse numbers, like a printed Bible. Designed for
 * immersive reading with optimal typography.
 */

import React, { useMemo } from 'react';
import DOMPurify from 'dompurify';
import '../styles/scripture-reader.css';

const sanitize = (html) => DOMPurify.sanitize(html, {
  ALLOWED_TAGS: ['span', 'em', 'strong', 'mark', 'sup'],
  ALLOWED_ATTR: ['class', 'title']
});

const ScriptureReader = ({
  manuscripts,
  activeManuscript,
  onManuscriptChange,
  showRestored,
  highlightRestoredNames,
  bookName,
  chapter,
}) => {
  // Find the currently selected manuscript data
  const currentMs = manuscripts.find(ms => ms.manuscript === activeManuscript) || manuscripts[0];

  // Helper to detect WEB book title verses
  const isBookTitleVerse = (text, verseNum) => {
    if (!text || verseNum !== 1) return false;
    if (bookName) {
      const escaped = bookName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const nameOnly = new RegExp(`^${escaped}\\.?\\s*$`, 'i');
      if (nameOnly.test(text.trim())) return true;
    }
    const titlePatterns = [
      /letter to/i, /letter from/i, /good news according/i,
      /^the acts of/i, /^the revelation of/i, /commonly called/i,
      /^the book of/i, /^the first book of/i, /^the second book of/i,
      /^the song of/i, /^the proverbs/i, /^the prophecy of/i,
    ];
    if (text.length < 120 && text.endsWith('.')) {
      if (titlePatterns.some(p => p.test(text))) return true;
    }
    return false;
  };

  // Build flowing prose HTML from verse array
  const proseHtml = useMemo(() => {
    if (!currentMs?.verses) return '';

    const filtered = currentMs.verses.filter(v => !isBookTitleVerse(v.text, v.verse));
    const verseOffset = filtered.length < currentMs.verses.length ? 1 : 0;

    return filtered.map(v => {
      const num = v.verse - verseOffset;
      let text = v.text || '';

      // Apply divine name restoration
      if (showRestored && v.restorations?.length > 0) {
        text = highlightRestoredNames(text, v.restorations, currentMs.manuscript);
      }

      // Superscript verse number + text (inline, flowing)
      return `<sup class="verse-sup">${num}</sup>${sanitize(text)}`;
    }).join(' ');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentMs, showRestored]);

  // Determine language class for proper font/direction
  const langClass = useMemo(() => {
    if (!currentMs) return 'reader-english';
    const lang = currentMs.lang;
    if (lang === 'hebrew' || lang === 'aramaic') return 'reader-hebrew';
    if (lang === 'greek') return 'reader-greek';
    if (lang === 'geez') return 'reader-geez';
    if (lang === 'latin') return 'reader-latin';
    return 'reader-english';
  }, [currentMs]);

  if (!currentMs) return null;

  return (
    <div className="scripture-reader">
      {/* Manuscript selector pills */}
      <div className="reader-manuscripts">
        {manuscripts.map(ms => (
          <button
            key={ms.manuscript}
            className={`reader-ms-pill ${ms.manuscript === activeManuscript ? 'active' : ''}`}
            onClick={() => onManuscriptChange(ms.manuscript)}
            aria-label={`Read ${ms.name}`}
            aria-pressed={ms.manuscript === activeManuscript}
          >
            <span className="reader-ms-code">{ms.manuscript}</span>
            <span className="reader-ms-lang">
              {ms.lang === 'hebrew' ? 'Hebrew' : ms.lang === 'greek' ? 'Greek' : ms.lang === 'aramaic' ? 'Aramaic' : ms.lang === 'latin' ? 'Latin' : ms.lang === 'geez' ? "Ge'ez" : 'English'}
            </span>
          </button>
        ))}
      </div>

      {/* Manuscript attribution */}
      <div className="reader-attribution">
        {currentMs.name}
      </div>

      {/* Flowing prose text */}
      <article
        className={`reader-prose ${langClass}`}
        dangerouslySetInnerHTML={{ __html: proseHtml }}
        aria-label={`${bookName} chapter ${chapter} from ${currentMs.name}`}
      />
    </div>
  );
};

export default ScriptureReader;
