/**
 * ManuscriptsPage - Demo/Test Page for Manuscript Viewer
 * Showcases the All4Yah manuscript viewing capabilities
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ManuscriptViewer from '../components/ManuscriptViewer';
import ModernHeader from '../components/ModernHeader';
import BookSelector from '../components/BookSelector';
import ChapterSelector from '../components/ChapterSelector';
import VerseSelector from '../components/VerseSelector';
import '../styles/manuscripts.css';

const ManuscriptsPage = () => {
  const { book, chapter, verse } = useParams();

  // Default to Genesis 1:1 if no params provided
  const [selectedVerse, setSelectedVerse] = useState({
    book: book || 'GEN',
    chapter: chapter ? parseInt(chapter) : 1,
    verse: verse ? parseInt(verse) : 1
  });

  // Navigation handlers
  const handleBookSelect = (bookCode) => {
    setSelectedVerse({
      book: bookCode,
      chapter: 1,
      verse: 1
    });
  };

  const handleChapterSelect = (chapterNum) => {
    setSelectedVerse({
      ...selectedVerse,
      chapter: chapterNum,
      verse: 1
    });
  };

  const handleVerseSelect = (verseNum) => {
    setSelectedVerse({
      ...selectedVerse,
      verse: verseNum
    });
  };

  return (
    <div className="fade-in">
      <ModernHeader
        title="All4Yah Manuscripts"
        subtitle="Original Hebrew, Greek & English with Divine Name Restoration"
      />

      <main className="container" style={{ paddingTop: '2rem', maxWidth: '1600px' }}>
        {/* Navigation Section */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1fr 1fr',
          gap: '1.5rem',
          marginBottom: '2rem'
        }}>
          {/* Book Selector */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <BookSelector
              selectedBook={selectedVerse.book}
              onBookSelect={handleBookSelect}
              selectedTiers={[1, 2]}
            />
          </div>

          {/* Chapter Selector */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <ChapterSelector
              book={selectedVerse.book}
              selectedChapter={selectedVerse.chapter}
              onChapterSelect={handleChapterSelect}
            />
          </div>

          {/* Verse Selector */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <VerseSelector
              book={selectedVerse.book}
              chapter={selectedVerse.chapter}
              selectedVerse={selectedVerse.verse}
              onVerseSelect={handleVerseSelect}
            />
          </div>
        </div>

        {/* Manuscript Viewer */}
        <ManuscriptViewer
          book={selectedVerse.book}
          chapter={selectedVerse.chapter}
          verse={selectedVerse.verse}
        />

        {/* Information Section */}
        <div style={{
          marginTop: '3rem',
          padding: '2rem',
          background: '#f9f9f9',
          borderRadius: '8px',
          borderLeft: '4px solid #D4AF37'
        }}>
          <h2 style={{
            color: '#2E7D32',
            marginBottom: '1rem',
            fontFamily: 'Libre Baskerville, serif'
          }}>
            About the All4Yah Project
          </h2>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', marginBottom: '1rem' }}>
            The <strong>All4Yah Project</strong> is a "Digital Dead Sea Scrolls" initiative dedicated to
            restoring the Word verse by verse using original manuscripts, transparent scholarship,
            and modern technology.
          </p>
          <p style={{ fontSize: '1.05rem', lineHeight: '1.8', color: '#333', marginBottom: '1rem' }}>
            We use the <strong>Westminster Leningrad Codex</strong> (Hebrew OT),
            the <strong>SBL Greek New Testament</strong> (Greek NT), and
            the <strong>World English Bible</strong> (English) to provide parallel manuscript views
            with divine name restoration.
          </p>

          <h3 style={{
            color: '#2E7D32',
            marginTop: '1.5rem',
            marginBottom: '0.75rem',
            fontSize: '1.2rem'
          }}>
            Divine Name Restorations:
          </h3>
          <ul style={{
            fontSize: '1rem',
            lineHeight: '1.8',
            color: '#333',
            listStyle: 'none',
            paddingLeft: 0
          }}>
            <li>✦ <strong>יהוה</strong> (H3068) → <strong className="restored-name">Yahuah</strong> - The personal name of the Creator (5,518× in OT)</li>
            <li>✦ <strong>יהושע</strong> (H3091) / <strong>Ἰησοῦς</strong> (G2424) → <strong className="restored-name">Yahusha</strong> - "Yahuah saves"</li>
            <li>✦ <strong>אלהים</strong> (H430) / <strong>θεός</strong> (G2316) → <strong className="restored-name">Elohim</strong> - Mighty One, Creator</li>
          </ul>

          <p style={{
            marginTop: '1.5rem',
            fontSize: '0.95rem',
            color: '#666',
            fontStyle: 'italic'
          }}>
            <strong>Mission:</strong> "This is my name forever, the name you shall call me from
            generation to generation." - Exodus 3:15
          </p>
        </div>
      </main>
    </div>
  );
};

export default ManuscriptsPage;
