import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/modern.css';
import ModernHeader from '../components/ModernHeader';
import ScrollUnfurl from '../components/ScrollUnfurl';
import ManuscriptIcon from '../components/icons/ManuscriptIcon';
import parchmentTexture from '../assets/textures/parchment.png';

const HomePage = () => {
  return (
    <div className="fade-in">
      <ModernHeader title="All4Yah" />

      <main className="container" style={{ paddingTop: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Hero Section - Scroll Unfurling Animation */}
        <ScrollUnfurl>
          <div className="card" style={{
            marginBottom: '2.5rem',
            backgroundImage: `url(${parchmentTexture})`,
            backgroundSize: 'cover',
            backgroundBlendMode: 'multiply',
            backgroundColor: 'var(--brand-parchment)',
            color: 'var(--ink-dark)',
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '3px solid var(--brand-gold)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'center' }}>
              <img
                src="/logo-brand.svg"
                alt="All4Yah Brand Logo"
                style={{
                  height: '140px',
                  width: 'auto',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))'
                }}
              />
            </div>
            <h1 style={{
              fontSize: '3rem',
              marginBottom: '1rem',
              fontWeight: '700',
              color: 'var(--ink-dark)',
              fontFamily: "'Cinzel', serif", /* Brand Rule */
              letterSpacing: '0.02em',
              textShadow: 'none'
            }}>
              All4Yah
            </h1>
            <p style={{
              fontSize: '1.5rem',
              fontStyle: 'italic',
              marginBottom: '1.5rem',
              color: 'var(--gold-accent)',
              filter: 'brightness(0.9)',
              fontWeight: '600'
            }}>
              "Restoring the Word, verse by verse."
            </p>
            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.8',
              marginBottom: '1.5rem',
              color: 'var(--ink-medium)'
            }}>
              Experience Scripture with the original divine names restored: <strong style={{ color: 'var(--wood-dark)' }}>יהוה→Yahuah</strong>, <strong style={{ color: 'var(--wood-dark)' }}>יהושע→Yahusha</strong>, <strong style={{ color: 'var(--wood-dark)' }}>אלהים→Elohim</strong>
            </p>
            <div style={{
              background: 'rgba(139, 69, 19, 0.05)',
              borderRadius: '8px',
              padding: '1rem 1.5rem',
              marginBottom: '1.5rem',
              display: 'inline-block',
              border: '1px solid rgba(139, 69, 19, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                gap: '2rem',
                alignItems: 'center',
                justifyContent: 'center',
                flexWrap: 'wrap',
                fontSize: '0.95rem',
                color: 'var(--ink-medium)'
              }}>
                <span><strong>248,871</strong> verses</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span><strong>12</strong> manuscripts</span>
                <span style={{ opacity: 0.5 }}>•</span>
                <span><strong>4</strong> languages</span>
              </div>
            </div>
            <p style={{
              fontSize: '1rem',
              color: 'var(--ink-light)',
              fontStyle: 'italic',
              marginBottom: '1.5rem'
            }}>
              "This is my name forever, the name you shall call me from generation to generation." - Exodus 3:15
            </p>
            <Link
              to="/about"
              className="btn"
              style={{
                display: 'inline-block',
                background: '#D4AF37',
                color: '#3E2723',
                padding: '0.875rem 2rem',
                borderRadius: '50px',
                textDecoration: 'none',
                fontWeight: '700',
                fontSize: '1.1rem',
                transition: 'all 0.3s ease',
                border: '1px solid rgba(62, 39, 35, 0.2)',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 6px 20px rgba(212, 175, 55, 0.4)';
                e.currentTarget.style.background = '#f0c040';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
                e.currentTarget.style.background = '#D4AF37';
              }}
            >
              Learn About Our Mission →
            </Link>
          </div>
        </ScrollUnfurl>

        {/* Main Navigation - Two Column Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Manuscripts CTA */}
          <Link
            to="/manuscripts"
            className="card"
            style={{
              background: 'linear-gradient(135deg, #1976D2 0%, #0D47A1 100%)',
              color: 'white',
              textDecoration: 'none',
              display: 'block',
              padding: '2rem',
              textAlign: 'center',
              border: '2px solid rgba(255,255,255,0.3)',
              boxShadow: '0 4px 16px rgba(25, 118, 210, 0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(25, 118, 210, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(25, 118, 210, 0.4)';
            }}
          >
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📜</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Manuscript Viewer
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>
              Read Hebrew, Greek, Aramaic, Latin & English scriptures
            </p>
          </Link>

          {/* LSI CTA - NEW */}
          <Link
            to="/lsi"
            className="card"
            style={{
              background: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
              color: 'white',
              textDecoration: 'none',
              display: 'block',
              padding: '2rem',
              textAlign: 'center',
              border: '2px solid rgba(156, 39, 176, 0.5)',
              boxShadow: '0 4px 16px rgba(106, 27, 154, 0.4)',
              transition: 'all 0.3s ease',
              cursor: 'pointer',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 24px rgba(106, 27, 154, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 16px rgba(106, 27, 154, 0.4)';
            }}
          >
            <div style={{
              position: 'absolute',
              top: '10px',
              right: '10px',
              background: 'rgba(255,215,0,0.9)',
              color: '#4A148C',
              padding: '0.25rem 0.6rem',
              borderRadius: '12px',
              fontSize: '0.7rem',
              fontWeight: 'bold',
              letterSpacing: '0.5px'
            }}>
              NEW
            </div>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🕊️</div>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
              Spirit Interface (LSI)
            </h2>
            <p style={{ fontSize: '1rem', opacity: 0.9 }}>
              AI-powered prayer analysis & spiritual reflection
            </p>
          </Link>
        </div>

        {/* LSI Feature Highlight - NEW */}
        <div className="card" style={{
          marginBottom: '2.5rem',
          border: '2px solid rgba(106, 27, 154, 0.3)',
          padding: '2rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem' }}>🕊️</div>
            <div>
              <h2 style={{ fontSize: '1.75rem', marginBottom: '0.25rem', color: 'var(--brand-midnight)' }}>
                Introducing: Linguistic Spirit Interface (LSI)
              </h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--text-secondary)', margin: 0 }}>
                Where Ancient Prayer Meets Modern AI
              </p>
            </div>
            <div style={{
              background: '#FFD700',
              color: '#4A148C',
              padding: '0.4rem 0.8rem',
              borderRadius: '16px',
              fontSize: '0.75rem',
              fontWeight: 'bold',
              marginLeft: 'auto'
            }}>
              PHASE 3
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1.5rem',
            marginBottom: '1.5rem'
          }}>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#6A1B9A' }}>
                🎙️ Audio Capture
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Record Spirit-led prayer sessions with professional-grade audio processing
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#6A1B9A' }}>
                🌊 Waveform Visualization
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                See your prayer flow as celestial art with frequency analysis
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#6A1B9A' }}>
                📖 Biblical Analysis
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                AI-powered pattern matching with Hebrew & Greek Scripture roots
              </p>
            </div>
            <div>
              <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', color: '#6A1B9A' }}>
                📝 Spiritual Journal
              </h4>
              <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)' }}>
                Document your spiritual journey with prayer session insights
              </p>
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ fontSize: '0.85rem', lineHeight: '1.6', color: 'var(--text-secondary)', margin: 0 }}>
              <strong style={{ color: '#F57C00' }}>⚠️ Faith Alignment:</strong> LSI provides interpretive analysis for personal spiritual reflection only.
              AI-generated insights are not prophetic revelation or authoritative spiritual guidance.
            </p>
          </div>

          <Link
            to="/lsi"
            className="btn"
            style={{
              display: 'inline-block',
              background: 'linear-gradient(135deg, #6A1B9A 0%, #4A148C 100%)',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              border: '2px solid rgba(106, 27, 154, 0.5)'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(106, 27, 154, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            Explore LSI Features →
          </Link>
        </div>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Feature 1: Manuscripts */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <ManuscriptIcon name="scroll" size={48} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
              Original Manuscripts
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '0.9rem',
              lineHeight: '1.8',
              color: 'var(--text-secondary)'
            }}>
              <li>• Westminster Leningrad Codex (Hebrew OT)</li>
              <li>• SBL Greek New Testament</li>
              <li>• Septuagint (LXX)</li>
              <li>• Vulgate (Latin)</li>
              <li>• Targum Onkelos (Aramaic)</li>
              <li>• World English Bible (English)</li>
            </ul>
          </div>

          {/* Feature 2: Divine Names */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <ManuscriptIcon name="divine" size={48} color="#D4AF37" className="active" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
              Divine Name Restoration
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '0.9rem',
              lineHeight: '1.8',
              color: 'var(--text-secondary)'
            }}>
              <li><strong style={{ color: '#2E7D32' }}>יהוה</strong> (H3068) → <strong>Yahuah</strong></li>
              <li><strong style={{ color: '#2E7D32' }}>יהושע / Ἰησοῦς</strong> → <strong>Yahusha</strong></li>
              <li><strong style={{ color: '#2E7D32' }}>אלהים / θεός</strong> → <strong>Elohim</strong></li>
              <li style={{ marginTop: '0.5rem', fontStyle: 'italic', opacity: 0.8 }}>
                Toggle between original and restored names
              </li>
            </ul>
          </div>

          {/* Feature 3: Coverage */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <ManuscriptIcon name="books" size={48} color="var(--primary)" />
            </div>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.75rem', color: 'var(--primary)' }}>
              Complete Coverage
            </h3>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              fontSize: '0.9rem',
              lineHeight: '1.8',
              color: 'var(--text-secondary)'
            }}>
              <li>• 66 Canonical Books (Protestant)</li>
              <li>• 18 Deuterocanonical Books</li>
              <li>• Parallel manuscript view</li>
              <li>• Side-by-side comparison</li>
              <li>• Hebrew RTL support</li>
              <li>• Greek polytonic rendering</li>
            </ul>
          </div>
        </div>

        {/* About Section */}
        <div className="card" style={{
          padding: '2rem',
          background: 'var(--bg-secondary)',
          borderLeft: '4px solid var(--primary)'
        }}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: 'var(--primary)' }}>
            About All4Yah
          </h2>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.8',
            marginBottom: '1rem',
            color: 'var(--text-secondary)'
          }}>
            The <strong>All4Yah Project</strong> is a "Digital Dead Sea Scrolls" initiative dedicated to
            restoring the Word verse by verse using original manuscripts, transparent scholarship,
            and modern technology.
          </p>
          <p style={{
            fontSize: '1rem',
            lineHeight: '1.8',
            marginBottom: '1rem',
            color: 'var(--text-secondary)'
          }}>
            We provide access to multiple ancient manuscripts in their original languages, allowing
            readers to compare texts and discover the divine names as they appeared in the original
            Hebrew and Greek Scriptures.
          </p>
          <p style={{
            fontSize: '1.1rem',
            fontWeight: 'bold',
            color: 'var(--primary)',
            marginTop: '1.5rem'
          }}>
            "Restoring truth, one name at a time."
          </p>
        </div>

        {/* Bottom CTA */}
        <div style={{ textAlign: 'center', marginTop: '3rem', marginBottom: '3rem' }}>
          <Link
            to="/manuscripts"
            className="btn btn-primary"
            style={{
              fontSize: '1.25rem',
              padding: '1rem 2.5rem',
              textDecoration: 'none',
              display: 'inline-block',
              background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
              border: '2px solid #D4AF37',
              boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 16px rgba(212, 175, 55, 0.4)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(212, 175, 55, 0.3)';
            }}
          >
            Begin Your Journey →
          </Link>
        </div>
      </main>
    </div>
  );
};

export default HomePage;
