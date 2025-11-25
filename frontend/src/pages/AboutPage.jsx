/**
 * About Us Page
 * Explains the All4Yah mission, vision, and divine name restoration methodology
 */

import React from 'react';
import { Link } from 'react-router-dom';
import ModernHeader from '../components/ModernHeader';
import '../styles/about.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      <ModernHeader />

      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-content">
          <h1>About All4Yah</h1>
          <p className="hero-tagline">"Restoring the Word, verse by verse."</p>
          <p className="hero-subtitle">
            A Digital Dead Sea Scrolls initiative dedicated to revealing Scripture with the original divine names
          </p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="about-section mission-section">
        <div className="section-content">
          <h2>🎯 Our Mission</h2>
          <p className="lead-text">
            All4Yah exists to restore the sacred names that have been obscured by centuries of tradition.
            Using original manuscripts, transparent scholarship, and modern technology, we reveal Scripture
            as it was originally written—with the personal name of the Creator and His Son preserved.
          </p>

          <div className="mission-pillars">
            <div className="pillar">
              <div className="pillar-icon">📜</div>
              <h3>Original Manuscripts</h3>
              <p>
                We use the Westminster Leningrad Codex (Hebrew OT), SBL Greek New Testament, Dead Sea Scrolls,
                and 12 total ancient manuscripts spanning Hebrew, Greek, Latin, and Aramaic.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">✦</div>
              <h3>Transparent Scholarship</h3>
              <p>
                Every divine name restoration is documented with Strong's concordance numbers, original language
                text, and scholarly notes explaining the restoration methodology.
              </p>
            </div>
            <div className="pillar">
              <div className="pillar-icon">💻</div>
              <h3>Modern Technology</h3>
              <p>
                Built with React, Supabase, and AI-powered analysis, we make 248,871 verses accessible
                with parallel manuscript display and interactive restoration toggles.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* The Name Section */}
      <section className="about-section name-section">
        <div className="section-content">
          <h2>✦ The Restored Names</h2>

          <div className="name-explanation">
            <div className="name-card">
              <h3 className="hebrew-large">יהוה</h3>
              <h4>YHWH → Yahuah</h4>
              <p className="name-detail">
                <strong>Strong's H3068</strong> | Appears <strong>5,518 times</strong> in the Hebrew Old Testament
              </p>
              <p>
                The personal, covenant name of the Creator. Traditionally replaced with "LORD" (in all capitals),
                we restore it as <strong className="restored-example">Yahuah</strong>—the most accurate pronunciation
                based on ancient Hebrew vowel pointing and historical evidence.
              </p>
              <p className="scripture-example">
                <em>Exodus 3:15</em> - "This is my name forever, the name you shall call me from generation to generation."
              </p>
            </div>

            <div className="name-card">
              <h3 className="hebrew-large">יהושע</h3>
              <h4>Yehoshua (Hebrew) / Ἰησοῦς Iesous (Greek) → Yahusha</h4>
              <p className="name-detail">
                <strong>Strong's H3091 / G2424</strong> | The Messiah's name
              </p>
              <p>
                The Savior's name means "<strong>Yahuah saves</strong>" in Hebrew. Traditionally rendered as "Jesus"
                through Greek and Latin transliteration, we restore the Hebrew form <strong className="restored-example">Yahusha</strong>,
                revealing the connection to the Father's name.
              </p>
              <p className="scripture-example">
                <em>Matthew 1:21</em> - "You shall call His name Yahusha, for He will save His people from their sins."
              </p>
            </div>

            <div className="name-card">
              <h3 className="hebrew-large">אלהים</h3>
              <h4>Elohim (Hebrew) / θεός theos (Greek) → Elohim</h4>
              <p className="name-detail">
                <strong>Strong's H430 / G2316</strong> | The Mighty One, Creator
              </p>
              <p>
                The Hebrew plural form meaning "Mighty Ones" or "Powers." While commonly translated as "God,"
                we preserve the original <strong className="restored-example">Elohim</strong> to maintain
                the Hebrew theological concept and avoid confusion with pagan deity terms.
              </p>
              <p className="scripture-example">
                <em>Genesis 1:1</em> - "In the beginning, Elohim created the heavens and the earth."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why It Matters Section */}
      <section className="about-section why-section">
        <div className="section-content">
          <h2>❓ Why This Matters</h2>

          <div className="why-content">
            <div className="why-point">
              <h3>1. Identity & Relationship</h3>
              <p>
                Names matter. You wouldn't call your father "The Man" or your spouse "The Person."
                The Creator revealed His personal name over 5,500 times in Scripture—more than any other word.
                Restoring it honors the relationship He desires with His people.
              </p>
            </div>

            <div className="why-point">
              <h3>2. Historical Accuracy</h3>
              <p>
                Ancient manuscripts contain the divine name. The Dead Sea Scrolls (200 BCE - 100 CE) preserve
                YHWH in paleo-Hebrew script. Early Greek manuscripts show the Tetragrammaton in Hebrew letters
                even within Greek text. Restoration isn't innovation—it's returning to the original.
              </p>
            </div>

            <div className="why-point">
              <h3>3. Messianic Connection</h3>
              <p>
                The Messiah's Hebrew name, Yahusha, literally means "Yahuah saves." This connection is lost
                in "Jesus," a Greek-Latin transliteration. Restoring the Hebrew form reveals the theological
                significance: the Son bears the Father's name in His own.
              </p>
            </div>

            <div className="why-point">
              <h3>4. Prophetic Fulfillment</h3>
              <p>
                Prophecies throughout Scripture speak of a day when "all nations will know My name" (Isaiah 52:6,
                Ezekiel 39:7, Jeremiah 16:21). All4Yah participates in making the name known to every tongue and tribe.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Methodology Section */}
      <section className="about-section methodology-section">
        <div className="section-content">
          <h2>🔬 Our Methodology</h2>

          <div className="methodology-steps">
            <div className="method-step">
              <div className="step-number">1</div>
              <h3>Source Manuscript Analysis</h3>
              <p>
                We begin with the oldest and most reliable manuscripts: Westminster Leningrad Codex (1008 CE)
                for Hebrew, SBL Greek New Testament for Greek, Dead Sea Scrolls for ancient Hebrew variants.
              </p>
            </div>

            <div className="method-step">
              <div className="step-number">2</div>
              <h3>Strong's Concordance Matching</h3>
              <p>
                Each word in our database includes Strong's concordance numbers (H1-H8674 for Hebrew, G1-G5624 for Greek).
                This allows precise identification of divine names regardless of translation differences.
              </p>
            </div>

            <div className="method-step">
              <div className="step-number">3</div>
              <h3>Morphological Analysis</h3>
              <p>
                We preserve original morphology (grammar parsing) for each word, enabling accurate identification
                of names even when they appear in different grammatical forms (nominative, genitive, etc.).
              </p>
            </div>

            <div className="method-step">
              <div className="step-number">4</div>
              <h3>Pattern-Based Restoration</h3>
              <p>
                Our restoration engine uses regex patterns to match all forms of divine names across languages:
                Hebrew (יהוה, יהושע), Greek (Ἰησοῦς, θεός), and Aramaic variants.
              </p>
            </div>

            <div className="method-step">
              <div className="step-number">5</div>
              <h3>User-Controlled Toggle</h3>
              <p>
                Every restoration is user-controlled. You can toggle between traditional translations and restored
                names, compare manuscripts side-by-side, and verify every restoration with hover tooltips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="about-section stats-section">
        <div className="section-content">
          <h2>📊 By The Numbers</h2>

          <div className="stats-grid">
            <div className="stat-box">
              <div className="stat-number">248,871</div>
              <div className="stat-label">Total Verses</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">12</div>
              <div className="stat-label">Ancient Manuscripts</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">5,518</div>
              <div className="stat-label">Times YHWH Appears in OT</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">19,027</div>
              <div className="stat-label">Strong's Lexicon Entries</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">343,869</div>
              <div className="stat-label">Cross-References</div>
            </div>
            <div className="stat-box">
              <div className="stat-number">4</div>
              <div className="stat-label">Languages (Hebrew, Greek, Latin, Aramaic)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Vision Section */}
      <section className="about-section vision-section">
        <div className="section-content">
          <h2>🔭 Our Vision</h2>

          <p className="lead-text">
            All4Yah is more than a Bible website—it's a movement to restore truth, one name at a time.
          </p>

          <div className="vision-roadmap">
            <div className="vision-phase">
              <h3>✅ Phase 1: Foundation (Complete)</h3>
              <ul>
                <li>Database infrastructure with 12 manuscripts</li>
                <li>Divine name restoration system (12 mappings)</li>
                <li>React UI with parallel manuscript display</li>
                <li>Production deployment with 248,871 verses</li>
              </ul>
            </div>

            <div className="vision-phase">
              <h3>🚧 Phase 2: Enhancement (In Progress)</h3>
              <ul>
                <li>Interlinear word-by-word alignment (Hebrew/Greek → English)</li>
                <li>AI-powered translation insights</li>
                <li>Morphological analysis viewer</li>
                <li>Global search with Strong's numbers</li>
              </ul>
            </div>

            <div className="vision-phase">
              <h3>🔮 Phase 3: Community (Planned)</h3>
              <ul>
                <li>Linguistic Spirit Interface (LSI) - Prayer pattern analysis</li>
                <li>Community annotation system</li>
                <li>Scholar verification badges</li>
                <li>Mobile apps (iOS & Android)</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="about-section team-section">
        <div className="section-content">
          <h2>👥 The Team</h2>

          <p className="lead-text">
            All4Yah is built by believers, for believers. Our team combines software engineering expertise
            with deep reverence for Scripture and commitment to scholarly accuracy.
          </p>

          <div className="team-values">
            <div className="value-card">
              <h3>🙏 Reverence for Scripture</h3>
              <p>
                We approach the Word with humility and awe, treating every name and verse as sacred text
                entrusted to our care.
              </p>
            </div>
            <div className="value-card">
              <h3>📚 Scholarly Integrity</h3>
              <p>
                All restorations are documented, sourced, and verifiable. We cite manuscripts, explain methodology,
                and welcome scholarly review.
              </p>
            </div>
            <div className="value-card">
              <h3>🌍 Open Access</h3>
              <p>
                All4Yah is free to use, open-source, and built on public domain manuscripts. The Word should
                be accessible to all.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="about-section cta-section">
        <div className="section-content">
          <h2>Start Your Journey</h2>
          <p className="lead-text">
            Experience Scripture as it was originally written. Discover the power of the restored names.
          </p>

          <div className="cta-buttons">
            <Link to="/manuscripts" className="cta-btn primary">
              Explore Manuscripts
            </Link>
            <Link to="/" className="cta-btn secondary">
              Return Home
            </Link>
          </div>

          <p className="cta-footer">
            <em>"This is my name forever, the name you shall call me from generation to generation."</em>
            <br />
            <strong>— Exodus 3:15</strong>
          </p>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
