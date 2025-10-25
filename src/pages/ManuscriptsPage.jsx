/**
 * ManuscriptsPage - Demo/Test Page for Manuscript Viewer
 * Showcases the All4Yah manuscript viewing capabilities
 */

import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import ManuscriptViewer from '../components/ManuscriptViewer';
import ModernHeader from '../components/ModernHeader';
import '../styles/manuscripts.css';

const ManuscriptsPage = () => {
  const { book, chapter, verse } = useParams();

  // Default to Genesis 1:1 if no params provided
  const [selectedVerse, setSelectedVerse] = useState({
    book: book || 'GEN',
    chapter: chapter ? parseInt(chapter) : 1,
    verse: verse ? parseInt(verse) : 1
  });

  // Sample verses for quick testing
  const sampleVerses = [
    { book: 'GEN', chapter: 1, verse: 1, label: 'Genesis 1:1 - In the beginning' },
    { book: 'GEN', chapter: 2, verse: 4, label: 'Genesis 2:4 - First YHWH occurrence' },
    { book: 'PSA', chapter: 23, verse: 1, label: 'Psalm 23:1 - The LORD is my shepherd' },
    { book: 'ISA', chapter: 53, verse: 5, label: 'Isaiah 53:5 - Pierced for our transgressions' },
    { book: 'MAT', chapter: 1, verse: 1, label: 'Matthew 1:1 - Genealogy of Jesus' },
    { book: 'MAT', chapter: 1, verse: 21, label: 'Matthew 1:21 - You shall call his name' },
    { book: 'JHN', chapter: 1, verse: 1, label: 'John 1:1 - In the beginning was the Word' },
    { book: 'JHN', chapter: 3, verse: 16, label: 'John 3:16 - For God so loved the world' },
  ];

  const handleVerseSelect = (sample) => {
    setSelectedVerse({
      book: sample.book,
      chapter: sample.chapter,
      verse: sample.verse
    });
  };

  return (
    <div className="fade-in">
      <ModernHeader
        title="All4Yah Manuscripts"
        subtitle="Original Hebrew, Greek & English with Divine Name Restoration"
      />

      <main className="container" style={{ paddingTop: '2rem', maxWidth: '1600px' }}>
        {/* Quick Verse Selector */}
        <div style={{
          background: '#f5f5f5',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '2rem',
          border: '2px solid #2E7D32'
        }}>
          <h3 style={{
            marginBottom: '1rem',
            color: '#2E7D32',
            fontFamily: 'Libre Baskerville, serif'
          }}>
            Sample Verses
          </h3>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '0.75rem'
          }}>
            {sampleVerses.map((sample, index) => (
              <button
                key={index}
                onClick={() => handleVerseSelect(sample)}
                style={{
                  padding: '0.75rem 1rem',
                  background: selectedVerse.book === sample.book &&
                             selectedVerse.chapter === sample.chapter &&
                             selectedVerse.verse === sample.verse
                    ? '#2E7D32'
                    : 'white',
                  color: selectedVerse.book === sample.book &&
                        selectedVerse.chapter === sample.chapter &&
                        selectedVerse.verse === sample.verse
                    ? 'white'
                    : '#333',
                  border: '1px solid #2E7D32',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  textAlign: 'left',
                  transition: 'all 0.3s ease',
                  fontFamily: 'Roboto, sans-serif'
                }}
                onMouseEnter={(e) => {
                  if (!(selectedVerse.book === sample.book &&
                       selectedVerse.chapter === sample.chapter &&
                       selectedVerse.verse === sample.verse)) {
                    e.target.style.background = '#E8F5E9';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!(selectedVerse.book === sample.book &&
                       selectedVerse.chapter === sample.chapter &&
                       selectedVerse.verse === sample.verse)) {
                    e.target.style.background = 'white';
                  }
                }}
              >
                <strong>{sample.book} {sample.chapter}:{sample.verse}</strong>
                <br />
                <span style={{ fontSize: '0.85rem', opacity: 0.9 }}>
                  {sample.label}
                </span>
              </button>
            ))}
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
