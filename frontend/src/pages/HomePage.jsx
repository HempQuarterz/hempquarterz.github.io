import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/modern.css';
import ModernHeader from '../components/ModernHeader';
import ScrollUnfurl from '../components/ScrollUnfurl';

const HomePage = () => {
  return (
    <div className="fade-in">
      <ModernHeader title="All4Yah" />

      <main className="container" style={{ paddingTop: '2rem', maxWidth: '900px', margin: '0 auto' }}>
        {/* Hero Section - Scroll Unfurling Animation */}
        <ScrollUnfurl>
          <div className="card" style={{
            marginBottom: '2.5rem',
            background: 'linear-gradient(135deg, #2E7D32 0%, #1B5E20 100%)',
            color: 'white',
            padding: '3rem 2rem',
            textAlign: 'center',
            border: '3px solid #D4AF37',
            boxShadow: '0 8px 24px rgba(212, 175, 55, 0.3)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✦</div>
            <h1 style={{
              fontSize: '2.5rem',
              marginBottom: '1rem',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
            }}>
              All4Yah Manuscript Viewer
            </h1>
            <p style={{
              fontSize: '1.25rem',
              lineHeight: '1.8',
              marginBottom: '0.5rem',
              opacity: 0.95
            }}>
              Read the Scriptures in their original languages with <strong style={{ color: '#D4AF37' }}>divine name restoration</strong>
            </p>
            <p style={{
              fontSize: '1rem',
              opacity: 0.9,
              fontStyle: 'italic'
            }}>
              "This is my name forever, the name you shall call me from generation to generation." - Exodus 3:15
            </p>
          </div>
        </ScrollUnfurl>

        {/* Main CTA Button */}
        <Link
          to="/manuscripts"
          className="card"
          style={{
            marginBottom: '3rem',
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
          <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem' }}>
            Start Reading →
          </h2>
          <p style={{ fontSize: '1rem', opacity: 0.9 }}>
            Explore manuscripts in Hebrew, Greek, Aramaic, Latin & English
          </p>
        </Link>

        {/* Feature Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '1.5rem',
          marginBottom: '3rem'
        }}>
          {/* Feature 1: Manuscripts */}
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📜</div>
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
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>✨</div>
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
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📚</div>
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
