import React from 'react';
import { Link } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';
import parchmentTexture from '../assets/textures/parchment.png';

const AboutPage = () => {
  // Shared styles for consistency
  const cardStyle = {
    marginBottom: '2.5rem',
    backgroundImage: `url(${parchmentTexture})`,
    backgroundSize: 'cover',
    backgroundBlendMode: 'multiply',
    backgroundColor: 'var(--brand-parchment)',
    color: 'var(--ink-dark)',
    padding: '2.5rem',
    border: '1px solid var(--brand-gold)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
    borderRadius: '12px'
  };

  const sectionTitleStyle = {
    fontFamily: "'Cinzel', serif",
    fontSize: '2rem',
    color: 'var(--brand-midnight)',
    marginBottom: '1.5rem',
    borderBottom: '2px solid var(--brand-gold)',
    paddingBottom: '0.5rem',
    display: 'inline-block'
  };

  const headingStyle = {
    fontFamily: "'Cinzel', serif",
    color: 'var(--brand-midnight)',
    marginBottom: '0.75rem'
  };

  const paragraphStyle = {
    fontFamily: "'Inter', sans-serif",
    lineHeight: '1.7',
    color: 'var(--ink-dark)',
    marginBottom: '1rem',
    fontSize: '1.05rem'
  };

  return (
    <div className="about-page fade-in">
      <ModernHeader title="About All4Yah" />

      <main className="container" style={{ paddingTop: '2rem', maxWidth: '900px', margin: '0 auto', color: 'var(--ink-dark)' }}>

        {/* Intro */}
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: '3.5rem',
            color: 'var(--brand-gold)',
            textShadow: '0 2px 4px rgba(0,0,0,0.5)',
            marginBottom: '0.5rem'
          }}>
            Restoring the Word
          </h1>
          <p style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: '1.25rem',
            color: 'var(--brand-parchment)',
            fontStyle: 'italic',
            opacity: 0.9
          }}>
            "Verse by verse, name by name."
          </p>
        </div>

        {/* Mission Section */}
        <div className="card" style={cardStyle}>
          <h2 style={sectionTitleStyle}>🎯 Our Mission</h2>
          <p style={paragraphStyle}>
            All4Yah exists to restore the sacred names that have been obscured by centuries of tradition.
            Using original manuscripts, transparent scholarship, and modern technology, we reveal Scripture
            as it was originally written—with the personal name of the Creator and His Son preserved.
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '2rem', marginTop: '2rem' }}>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📜</div>
              <h3 style={headingStyle}>Original Manuscripts</h3>
              <p style={{ ...paragraphStyle, fontSize: '0.95rem' }}>
                We use the Westminster Leningrad Codex (Hebrew OT), SBL Greek New Testament, Dead Sea Scrolls,
                and 12 total ancient manuscripts spanning Hebrew, Greek, Latin, and Aramaic.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>✦</div>
              <h3 style={headingStyle}>Transparent Scholarship</h3>
              <p style={{ ...paragraphStyle, fontSize: '0.95rem' }}>
                Every divine name restoration is documented with Strong's concordance numbers, original language
                text, and scholarly notes explaining the restoration methodology.
              </p>
            </div>
            <div>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>💻</div>
              <h3 style={headingStyle}>Modern Technology</h3>
              <p style={{ ...paragraphStyle, fontSize: '0.95rem' }}>
                Built with React, Supabase, and AI-powered analysis, we make 248,871 verses accessible
                with parallel manuscript display and interactive restoration toggles.
              </p>
            </div>
          </div>
        </div>

        {/* The Name Section */}
        <div className="card" style={cardStyle}>
          <h2 style={sectionTitleStyle}>✦ The Restored Names</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem', marginTop: '1rem' }}>

            {/* Yahuah */}
            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(139,69,19,0.1)' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'var(--brand-midnight)', marginBottom: '0.25rem' }}>יהוה</h3>
              <h4 style={{ ...headingStyle, fontSize: '1.25rem', borderBottom: '1px solid var(--brand-teal)', display: 'inline-block', paddingBottom: '2px' }}>YHWH → Yahuah</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-medium)', marginBottom: '0.75rem' }}>
                <strong>Strong's H3068</strong> | 5,518 occurrences
              </p>
              <p style={paragraphStyle}>
                The personal, covenant name of the Creator. Restored from "LORD" to <strong>Yahuah</strong> based on ancient Hebrew vowel pointing.
              </p>
            </div>

            {/* Yahusha */}
            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(139,69,19,0.1)' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'var(--brand-midnight)', marginBottom: '0.25rem' }}>יהושע</h3>
              <h4 style={{ ...headingStyle, fontSize: '1.25rem', borderBottom: '1px solid var(--brand-teal)', display: 'inline-block', paddingBottom: '2px' }}>Yehoshua → Yahusha</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-medium)', marginBottom: '0.75rem' }}>
                <strong>Strong's H3091</strong> | The Messiah's Name
              </p>
              <p style={paragraphStyle}>
                Means "Yahuah saves". Restored from the Greek "Jesus" to the original Hebrew <strong>Yahusha</strong>, connecting the Son to the Father.
              </p>
            </div>

            {/* Elohim */}
            <div style={{ background: 'rgba(255,255,255,0.4)', padding: '1.5rem', borderRadius: '8px', border: '1px solid rgba(139,69,19,0.1)' }}>
              <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '2.5rem', color: 'var(--brand-midnight)', marginBottom: '0.25rem' }}>אלהים</h3>
              <h4 style={{ ...headingStyle, fontSize: '1.25rem', borderBottom: '1px solid var(--brand-teal)', display: 'inline-block', paddingBottom: '2px' }}>Elohim → Elohim</h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--ink-medium)', marginBottom: '0.75rem' }}>
                <strong>Strong's H430</strong> | The Mighty One
              </p>
              <p style={paragraphStyle}>
                Preserved as <strong>Elohim</strong> (Mighty Ones) to maintain the Hebrew theological concept distinct from the generic "God".
              </p>
            </div>

          </div>
        </div>

        {/* Why It Matters */}
        <div className="card" style={cardStyle}>
          <h2 style={sectionTitleStyle}>❓ Why This Matters</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
            <div>
              <h3 style={headingStyle}>Identity & Relationship</h3>
              <p style={paragraphStyle}>
                Names matter. The Creator revealed His name 5,500+ times. Calling Him by name honors the relationship He desires with His people, moving beyond generic titles like "The Lord".
              </p>
            </div>
            <div>
              <h3 style={headingStyle}>Historical Accuracy</h3>
              <p style={paragraphStyle}>
                The Dead Sea Scrolls and early manuscripts confirm the presence of the Divine Name. Restoring it isn't innovation—it's a return to the original text before tradition obscured it.
              </p>
            </div>
            <div>
              <h3 style={headingStyle}>Prophetic Fulfillment</h3>
              <p style={paragraphStyle}>
                Scripture prophesies that "all nations will know My name" (Isaiah 52:6). This project is a tool to help fulfill that promise in the digital age.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <Link
            to="/manuscripts"
            className="btn"
            style={{
              display: 'inline-block',
              background: 'var(--brand-gold)',
              color: 'var(--brand-midnight)',
              padding: '1rem 3rem',
              borderRadius: '50px',
              textDecoration: 'none',
              fontWeight: '700',
              fontFamily: "'Cinzel', serif",
              fontSize: '1.2rem',
              transition: 'all 0.3s ease',
              border: '1px solid var(--brand-midnight)',
              boxShadow: '0 0 20px rgba(249, 228, 164, 0.4)'
            }}
          >
            Explore the Manuscripts
          </Link>
        </div>

      </main>
    </div>
  );
};

export default AboutPage;
