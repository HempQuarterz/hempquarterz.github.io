import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/site-footer.css';

const SiteFooter = () => {
  return (
    <footer className="site-footer" aria-label="Site footer">
      <div className="footer-inner">
        <div className="footer-section footer-mission">
          <p className="footer-tagline">Restoring the Word, verse by verse.</p>
          <p className="footer-mission-text">
            Verse-by-verse restoration of divine names using original manuscripts —
            transparent scholarship, original-language sources.
          </p>
        </div>

        <nav className="footer-section footer-nav" aria-label="Footer navigation">
          <h3>Explore</h3>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/manuscripts">Scripture</Link></li>
            <li><Link to="/about">About</Link></li>
            <li>
              <a href="https://github.com/HempQuarterz/hempquarterz.github.io" target="_blank" rel="noopener noreferrer">
                GitHub
              </a>
            </li>
          </ul>
        </nav>

        <div className="footer-section footer-licenses">
          <h3>Manuscript Sources</h3>
          <ul>
            <li>Westminster Leningrad Codex — public domain</li>
            <li>SBL Greek New Testament — CC BY 4.0</li>
            <li>World English Bible — public domain</li>
            <li>Septuagint, Vulgate, Codex Sinaiticus, Dead Sea Scrolls</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <p>© {new Date().getFullYear()} All4Yah Project · Open scholarship</p>
      </div>
    </footer>
  );
};

export default SiteFooter;
