/**
 * TimelineViewer Component - Tier 7
 * Chronological visualization of biblical events and cross-references
 * Displays verses in temporal/narrative order with visual timeline
 */

import React, { useState, useEffect } from 'react';
import { getCrossReferences } from '../api/crossReferences';
import { getVerse } from '../api/verses';
import '../styles/timeline.css';

const TimelineViewer = ({ book, chapter, verse, onNavigate }) => {
  const [timelineEvents, setTimelineEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);

  /**
   * Load timeline events based on cross-references
   */
  useEffect(() => {
    async function loadTimeline() {
      if (!book || !chapter || !verse) return;

      try {
        setLoading(true);
        setError(null);

        // Get cross-references for current verse
        const refs = await getCrossReferences(book, chapter, verse);

        // Build timeline events from cross-references
        const events = await buildTimelineEvents(book, chapter, verse, refs);

        setTimelineEvents(events);
        setCurrentEvent(events.find(e => e.isCurrent));
        setLoading(false);
      } catch (err) {
        console.error('Failed to load timeline:', err);
        setError(err.message || 'Failed to load timeline');
        setLoading(false);
      }
    }

    loadTimeline();
  }, [book, chapter, verse]);

  /**
   * Build chronological timeline events from verse and its references
   */
  async function buildTimelineEvents(currentBook, currentChapter, currentVerse, references) {
    // Limit cross-refs to 8 for performance, then load current verse + all
    // refs concurrently. Previously this was sequential — Promise.all means
    // 9 fetches happen in one network round-trip rather than 9 in series.
    const refsToLoad = references.slice(0, 8);
    const [currentResult, ...refResults] = await Promise.all([
      getVerse('WEB', currentBook, currentChapter, currentVerse).catch((err) => {
        console.error('Failed to load current verse:', err);
        return null;
      }),
      ...refsToLoad.map((ref) =>
        getVerse('WEB', ref.target_book, ref.target_chapter, ref.target_verse).catch((err) => {
          console.error(`Failed to load reference ${ref.target_book}:`, err);
          return null;
        })
      ),
    ]);

    const events = [];

    if (currentResult) {
      events.push({
        id: `${currentBook}_${currentChapter}_${currentVerse}`,
        book: currentBook,
        chapter: currentChapter,
        verse: currentVerse,
        text: currentResult.text,
        timestamp: getVerseTimestamp(currentBook, currentChapter, currentVerse),
        isCurrent: true,
        type: 'current',
        era: getEra(currentBook),
      });
    }

    refsToLoad.forEach((ref, idx) => {
      const refVerseData = refResults[idx];
      if (!refVerseData) return;
      events.push({
        id: `${ref.target_book}_${ref.target_chapter}_${ref.target_verse}`,
        book: ref.target_book,
        chapter: ref.target_chapter,
        verse: ref.target_verse,
        text: refVerseData.text,
        timestamp: getVerseTimestamp(ref.target_book, ref.target_chapter, ref.target_verse),
        isCurrent: false,
        type: ref.link_type || 'related',
        era: getEra(ref.target_book),
        relationDescription: ref.description || `Related to ${currentBook} ${currentChapter}:${currentVerse}`,
      });
    });

    // Sort by chronological order (based on biblical book order)
    return events.sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Get chronological timestamp for a verse (based on biblical book order)
   * This is a simplified approximation for visualization
   */
  function getVerseTimestamp(book, chapter, verse) {
    const bookOrder = {
      // Old Testament (approx. BC dates)
      'GEN': 1000, 'EXO': 2000, 'LEV': 2100, 'NUM': 2200, 'DEU': 2300,
      'JOS': 2400, 'JDG': 2500, 'RUT': 2600, '1SA': 2700, '2SA': 2800,
      '1KI': 2900, '2KI': 3000, '1CH': 3100, '2CH': 3200, 'EZR': 3300,
      'NEH': 3400, 'EST': 3500, 'JOB': 3600, 'PSA': 3700, 'PRO': 3800,
      'ECC': 3900, 'SNG': 4000, 'ISA': 4100, 'JER': 4200, 'LAM': 4300,
      'EZK': 4400, 'DAN': 4500, 'HOS': 4600, 'JOL': 4700, 'AMO': 4800,
      'OBA': 4900, 'JON': 5000, 'MIC': 5100, 'NAM': 5200, 'HAB': 5300,
      'ZEP': 5400, 'HAG': 5500, 'ZEC': 5600, 'MAL': 5700,

      // New Testament (approx. AD dates)
      'MAT': 6000, 'MRK': 6100, 'LUK': 6200, 'JHN': 6300, 'ACT': 6400,
      'ROM': 6500, '1CO': 6600, '2CO': 6700, 'GAL': 6800, 'EPH': 6900,
      'PHP': 7000, 'COL': 7100, '1TH': 7200, '2TH': 7300, '1TI': 7400,
      '2TI': 7500, 'TIT': 7600, 'PHM': 7700, 'HEB': 7800, 'JAS': 7900,
      '1PE': 8000, '2PE': 8100, '1JN': 8200, '2JN': 8300, '3JN': 8400,
      'JUD': 8500, 'REV': 8600,

      // Deuterocanonical
      'TOB': 3550, 'JDT': 3560, 'WIS': 3570, 'SIR': 3580, 'BAR': 4250,
      '1MA': 5800, '2MA': 5810, '3MA': 5820, '4MA': 5830,
      '1ES': 3350, '2ES': 3360, 'MAN': 3380, 'PS2': 3710,
      'LJE': 4210, 'S3Y': 4510, 'SUS': 4520, 'BEL': 4530, 'ESG': 3510,

      // Ethiopian Canon / Pseudepigrapha
      'ENO': 500,   // 1 Enoch - antediluvian setting
      'JUB': 900,   // Jubilees - retelling Genesis-Exodus
      'ASI': 4150,  // Ascension of Isaiah - prophetic era
      '1MQ': 5850,  // Meqabyan 1 - post-Maccabean
      '2MQ': 5860,  // Meqabyan 2
      '3MQ': 5870,  // Meqabyan 3
      'KNG': 2950,  // Kebra Nagast - Solomon era setting
      'TGO': 6350,  // Gospel of Thomas
      'GMA': 6360,  // Gospel of Mary
      'MEQ': 5855,  // Meqabyan (if using original code)
    };

    const baseTimestamp = bookOrder[book] || 5000;
    return baseTimestamp + (chapter * 10) + (verse * 0.1);
  }

  /**
   * Get biblical era for a book
   */
  function getEra(book) {
    // Old Testament books
    const pentateuch = ['GEN', 'EXO', 'LEV', 'NUM', 'DEU'];
    const history = ['JOS', 'JDG', 'RUT', '1SA', '2SA', '1KI', '2KI', '1CH', '2CH', 'EZR', 'NEH', 'EST'];
    const wisdom = ['JOB', 'PSA', 'PRO', 'ECC', 'SNG'];
    const prophets = ['ISA', 'JER', 'LAM', 'EZK', 'DAN', 'HOS', 'JOL', 'AMO', 'OBA', 'JON', 'MIC', 'NAM', 'HAB', 'ZEP', 'HAG', 'ZEC', 'MAL'];

    // New Testament books
    const gospels = ['MAT', 'MRK', 'LUK', 'JHN'];
    const acts = ['ACT'];
    const epistles = ['ROM', '1CO', '2CO', 'GAL', 'EPH', 'PHP', 'COL', '1TH', '2TH', '1TI', '2TI', 'TIT', 'PHM', 'HEB', 'JAS', '1PE', '2PE', '1JN', '2JN', '3JN', 'JUD'];
    const revelation = ['REV'];

    const deuterocanon = ['TOB', 'JDT', 'WIS', 'SIR', 'BAR', '1MA', '2MA', '3MA', '4MA', '1ES', '2ES', 'MAN', 'PS2', 'LJE', 'S3Y', 'SUS', 'BEL', 'ESG'];
    const ethiopian = ['ENO', 'JUB', 'ASI', '1MQ', '2MQ', '3MQ', 'MEQ', 'KNG', 'TGO', 'GMA'];

    if (pentateuch.includes(book)) return 'pentateuch';
    if (history.includes(book)) return 'history';
    if (wisdom.includes(book)) return 'wisdom';
    if (prophets.includes(book)) return 'prophets';
    if (gospels.includes(book)) return 'gospels';
    if (acts.includes(book)) return 'acts';
    if (epistles.includes(book)) return 'epistles';
    if (revelation.includes(book)) return 'revelation';
    if (deuterocanon.includes(book)) return 'deuterocanon';
    if (ethiopian.includes(book)) return 'ethiopian';
    return 'other';
  }

  /**
   * Get era display name
   */
  function getEraDisplayName(era) {
    const eraNames = {
      pentateuch: 'Torah/Pentateuch',
      history: 'Historical Books',
      wisdom: 'Wisdom Literature',
      prophets: 'Prophetic Books',
      gospels: 'Gospels',
      acts: 'Early Church',
      epistles: 'Epistles',
      revelation: 'Apocalyptic',
      deuterocanon: 'Deuterocanonical',
      ethiopian: 'Ethiopian Canon',
      other: 'Other',
    };
    return eraNames[era] || era;
  }

  /**
   * Get era color
   */
  function getEraColor(era) {
    const eraColors = {
      pentateuch: '#8B4513',  // Brown - Foundation
      history: '#4682B4',     // Steel Blue - Historical narrative
      wisdom: '#DAA520',      // Goldenrod - Wisdom
      prophets: '#9370DB',    // Purple - Prophetic
      gospels: '#DC143C',     // Crimson - Gospel message
      acts: '#FF8C00',        // Dark Orange - Church birth
      epistles: '#2E8B57',    // Sea Green - Teaching
      revelation: '#8B0000',  // Dark Red - Apocalyptic
      deuterocanon: '#FF6347', // Tomato - Deuterocanonical
      ethiopian: '#D4AF37',   // Gold - Ethiopian Canon
      other: '#696969',       // Dim Gray
    };
    return eraColors[era] || '#696969';
  }

  /**
   * Handle event click
   */
  const handleEventClick = (event) => {
    if (!event.isCurrent && onNavigate) {
      onNavigate({
        book: event.book,
        chapter: event.chapter,
        verse: event.verse,
      });
    }
  };

  /**
   * Truncate text for display
   */
  const truncateText = (text, maxLength = 100) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  if (loading) {
    return (
      <div className="timeline-container">
        <div className="timeline-loading">
          Loading chronological timeline...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="timeline-container">
        <div className="timeline-error">
          <strong>Error:</strong> {error}
        </div>
      </div>
    );
  }

  if (timelineEvents.length === 0) {
    return (
      <div className="timeline-container">
        <div className="timeline-empty">
          No timeline events available for {book} {chapter}:{verse}
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-container">
      {/* Header */}
      <div className="timeline-header">
        <h3>Chronological Timeline View</h3>
        <p>
          {timelineEvents.length} events spanning biblical history
          {currentEvent && ` • Viewing: ${currentEvent.book} ${currentEvent.chapter}:${currentEvent.verse}`}
        </p>
      </div>

      {/* Timeline Visualization */}
      <div className="timeline-content">
        <div className="timeline-line"></div>

        {timelineEvents.map((event, index) => (
          <div
            key={event.id}
            className={`timeline-event ${event.isCurrent ? 'current-event' : ''} ${event.era}`}
            onClick={() => handleEventClick(event)}
            style={{
              '--event-color': getEraColor(event.era),
            }}
          >
            {/* Event Marker */}
            <div className="event-marker" style={{ background: getEraColor(event.era) }}>
              {event.isCurrent && <span className="current-marker">📍</span>}
            </div>

            {/* Event Card */}
            <div className="event-card">
              <div className="event-header">
                <div className="event-reference">
                  <strong>{event.book} {event.chapter}:{event.verse}</strong>
                </div>
                <div className="event-era-badge" style={{ background: getEraColor(event.era) }}>
                  {getEraDisplayName(event.era)}
                </div>
              </div>

              <div className="event-text">
                {truncateText(event.text, 120)}
              </div>

              {event.relationDescription && (
                <div className="event-relation">
                  {event.relationDescription}
                </div>
              )}

              {event.isCurrent && (
                <div className="current-badge">Current Verse</div>
              )}

              {!event.isCurrent && (
                <div className="click-hint">Click to navigate →</div>
              )}
            </div>

            {/* Connection Line */}
            {index < timelineEvents.length - 1 && (
              <div className="event-connector"></div>
            )}
          </div>
        ))}
      </div>

      {/* Era Legend */}
      <div className="timeline-legend">
        <h4>Biblical Eras</h4>
        <div className="legend-items">
          {['pentateuch', 'history', 'wisdom', 'prophets', 'gospels', 'acts', 'epistles', 'revelation', 'deuterocanon', 'ethiopian'].map(era => (
            <div key={era} className="legend-item">
              <div className="legend-color" style={{ background: getEraColor(era) }}></div>
              <span>{getEraDisplayName(era)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Info Footer */}
      <div className="timeline-footer">
        <p>
          <strong>How it works:</strong> This timeline arranges verses and their cross-references
          in biblical chronological order, showing how events and themes unfold throughout Scripture.
          Events are color-coded by biblical era for easy visual navigation.
        </p>
      </div>
    </div>
  );
};

export default TimelineViewer;
