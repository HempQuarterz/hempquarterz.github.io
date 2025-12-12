import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import PropTypes from 'prop-types';

const ModernHeader = ({ title = "All4Yah" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Initialize theme from localStorage or default
    const storedTheme = localStorage.getItem('theme') || 'light';
    setTheme(storedTheme);
    document.documentElement.setAttribute('data-theme', storedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1rem 2rem',
        background: '#0E233B', /* Brand Rule: Midnight Background Always */
        color: '#F9E4A4', /* Brand Rule: Radiant Gold Text */
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        borderBottom: '1px solid #609CB4' /* Data Light Blue Accent */
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '1rem', textDecoration: 'none' }}>
            <img
              src="/logo-brand.svg"
              alt="All4Yah Logo"
              style={{ height: '50px', width: 'auto' }}
            />
            <h1 style={{
              fontSize: '1.8rem',
              fontWeight: '700',
              margin: 0,
              fontFamily: "'Cinzel', serif", /* Brand Rule: Cinzel Heading */
              color: '#F9E4A4',
              letterSpacing: '0.05em'
            }}>
              {title}
            </h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="desktop-nav" style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <Link to="/" className="nav-link" style={{ color: '#FBF5DB', fontFamily: "'Inter', sans-serif" }}>Home</Link>
          <Link to="/manuscripts" className="nav-link" style={{ color: '#FBF5DB', fontFamily: "'Inter', sans-serif" }}>Manuscripts</Link>
          <Link to="/lsi" className="nav-link" style={{ color: '#FBF5DB', fontFamily: "'Inter', sans-serif" }}>Spirit AI</Link>
          <Link to="/about" className="nav-link" style={{ color: '#FBF5DB', fontFamily: "'Inter', sans-serif" }}>About</Link>

          <button
            onClick={toggleTheme}
            style={{
              background: 'transparent',
              border: '1px solid #609CB4',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#F9E4A4'
            }}
            title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <img
              src={theme === 'light' ? "/icons/icon-sun.svg" : "/icons/icon-moon.svg"}
              alt="Toggle Theme"
              style={{ width: '20px', height: '20px' }}
            />
          </button>
        </nav>
      </header>

      {/* Mobile Bottom Navigation - Kept for mobile users but updated with brand colors */}
      <style>{`
        @media (min-width: 768px) {
          .bottom-nav { display: none; }
          .desktop-nav { display: flex; }
        }
        @media (max-width: 767px) {
          .bottom-nav { 
            display: flex; 
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #0E233B;
            border-top: 1px solid #D4AF37;
            padding: 0.5rem;
            justify-content: space-around;
            z-index: 1000;
          }
          .desktop-nav { display: none; }
          .nav-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            text-decoration: none;
            color: #FBF5DB;
            font-size: 0.75rem;
          }
           .nav-item.active {
            color: #F9E4A4;
            font-weight: bold;
           }
        }
      `}</style>

      <nav className="bottom-nav">
        <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
          <img src="/icons/icon-manuscript.svg" alt="Home" width="24" height="24" />
          <span>Home</span>
        </Link>
        <Link to="/manuscripts" className={`nav-item ${location.pathname.startsWith('/manuscript') ? 'active' : ''}`}>
          <img src="/icons/icon-scroll.svg" alt="Bible" width="24" height="24" />
          <span>Bible</span>
        </Link>
        <Link to="/about" className={`nav-item ${location.pathname === '/about' ? 'active' : ''}`}>
          <img src="/icons/icon-info.svg" alt="About" width="24" height="24" />
          <span>About</span>
        </Link>
        <Link to="/lsi" className={`nav-item ${location.pathname.startsWith('/lsi') ? 'active' : ''}`}>
          <img src="/icons/icon-dove.svg" alt="Spirit" width="24" height="24" />
          <span>Spirit</span>
        </Link>
        <button onClick={toggleTheme} className="nav-item" style={{ background: 'none', border: 'none', padding: 0 }}>
          <img src={theme === 'light' ? "/icons/icon-sun.svg" : "/icons/icon-moon.svg"} alt="Theme" width="24" height="24" />
          <span>Theme</span>
        </button>
      </nav>
    </>
  );
};

ModernHeader.propTypes = {
  title: PropTypes.string
};

export default ModernHeader;