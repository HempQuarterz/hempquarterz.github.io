import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/about-page.css';

const AboutPage = () => {
  return (
    <div className="about-page fade-in">
      <main className="about-container">

        {/* Intro */}
        <div className="about-intro">
          <h1 className="about-title">Restoring the Word</h1>
          <p className="about-tagline">"Verse by verse, name by name."</p>
        </div>

        {/* Mission Section */}
        <div className="about-card">
          <h2 className="about-section-title">Our Mission</h2>
          <p className="about-paragraph">
            All4Yah exists to restore the sacred names that have been obscured by centuries of tradition.
            Using original manuscripts, transparent scholarship, and modern technology, we reveal Scripture
            as it was originally written—with the personal name of the Creator and His Son preserved.
          </p>

          <div className="about-grid about-grid--3col">
            <div>
              <h3 className="about-heading">Original Manuscripts</h3>
              <p className="about-paragraph about-paragraph--sm">
                We use the Westminster Leningrad Codex (Hebrew OT), SBL Greek New Testament, Dead Sea Scrolls,
                and 12 total ancient manuscripts spanning Hebrew, Greek, Latin, and Aramaic.
              </p>
            </div>
            <div>
              <h3 className="about-heading">Transparent Scholarship</h3>
              <p className="about-paragraph about-paragraph--sm">
                Every divine name restoration is documented with Strong's concordance numbers, original language
                text, and scholarly notes explaining the restoration methodology.
              </p>
            </div>
            <div>
              <h3 className="about-heading">Modern Technology</h3>
              <p className="about-paragraph about-paragraph--sm">
                Built with React, Supabase, and AI-powered analysis, we make 248,871 verses accessible
                with parallel manuscript display and interactive restoration toggles.
              </p>
            </div>
          </div>
        </div>

        {/* The Name Section */}
        <div className="about-card">
          <h2 className="about-section-title">The Restored Names</h2>
          <div className="about-grid about-grid--3col">

            {/* Yahuah */}
            <div className="about-name-card">
              <h3 className="about-name-hebrew">יהוה</h3>
              <h4 className="about-name-mapping">YHWH → Yahuah</h4>
              <p className="about-name-meta">
                <strong>Strong's H3068</strong> | 5,518 occurrences
              </p>
              <p className="about-paragraph">
                The personal, covenant name of the Creator. Restored from "LORD" to <strong>Yahuah</strong> based on ancient Hebrew vowel pointing.
              </p>
            </div>

            {/* Yahusha */}
            <div className="about-name-card">
              <h3 className="about-name-hebrew">יהושע</h3>
              <h4 className="about-name-mapping">Yehoshua → Yahusha</h4>
              <p className="about-name-meta">
                <strong>Strong's H3091</strong> | The Messiah's Name
              </p>
              <p className="about-paragraph">
                Means "Yahuah saves". Restored from the Greek "Jesus" to the original Hebrew <strong>Yahusha</strong>, connecting the Son to the Father.
              </p>
            </div>

            {/* Elohim */}
            <div className="about-name-card">
              <h3 className="about-name-hebrew">אלהים</h3>
              <h4 className="about-name-mapping">Elohim → Elohim</h4>
              <p className="about-name-meta">
                <strong>Strong's H430</strong> | The Mighty One
              </p>
              <p className="about-paragraph">
                Preserved as <strong>Elohim</strong> (Mighty Ones) to maintain the Hebrew theological concept distinct from the generic "God".
              </p>
            </div>

          </div>
        </div>

        {/* Why It Matters */}
        <div className="about-card">
          <h2 className="about-section-title">Why This Matters</h2>
          <div className="about-grid about-grid--3col">
            <div>
              <h3 className="about-heading">Identity &amp; Relationship</h3>
              <p className="about-paragraph">
                Names matter. The Creator revealed His name 5,500+ times. Calling Him by name honors the relationship He desires with His people, moving beyond generic titles like "The Lord".
              </p>
            </div>
            <div>
              <h3 className="about-heading">Historical Accuracy</h3>
              <p className="about-paragraph">
                The Dead Sea Scrolls and early manuscripts confirm the presence of the Divine Name. Restoring it isn't innovation—it's a return to the original text before tradition obscured it.
              </p>
            </div>
            <div>
              <h3 className="about-heading">Prophetic Fulfillment</h3>
              <p className="about-paragraph">
                Scripture prophesies that "all nations will know My name" (Isaiah 52:6). This project is a tool to help fulfill that promise in the digital age.
              </p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="about-cta">
          <Link to="/manuscripts" className="about-cta-button">
            Explore the Manuscripts
          </Link>
        </div>

      </main>
    </div>
  );
};

export default AboutPage;
