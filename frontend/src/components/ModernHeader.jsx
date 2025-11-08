import React, { useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, selectTheme } from '../themeSlice';
import PropTypes from 'prop-types';

const ModernHeader = ({ title = "ForYah Bible" }) => {
  const theme = useSelector(selectTheme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle theme side effects (localStorage + DOM)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme', theme);
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
  };

  const isHome = location.pathname === '/';

  return (
    <>
      <header className="modern-header">
        <div className="container">
          <div className="header-content">
            <div className="logo-section">
              <div 
                className="logo" 
                onClick={() => navigate('/')}
                style={{ cursor: 'pointer' }}
              >
                F
              </div>
              <h1 style={{ fontSize: '1.5rem', margin: 0 }}>{title}</h1>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              {!isHome && (
                <button
                  className="btn btn-secondary btn-icon"
                  onClick={() => navigate(-1)}
                  aria-label="Go back"
                >
                  ←
                </button>
              )}

              <button
                className="theme-toggle"
                onClick={handleThemeToggle}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                <div className="theme-toggle-slider">
                  {theme === 'light' ? '☀️' : '🌙'}
                </div>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav" aria-label="Primary navigation">
        <div className="bottom-nav-content">
          <Link
            to="/"
            className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
            aria-label="Go to home page"
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">📖</span>
            <span style={{ fontSize: '0.75rem' }}>Home</span>
          </Link>
          <Link
            to="/manuscripts"
            className={`nav-item ${location.pathname.startsWith('/manuscript') ? 'active' : ''}`}
            aria-label="View manuscripts"
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">📜</span>
            <span style={{ fontSize: '0.75rem' }}>Bible</span>
          </Link>
          <Link
            to="/lsi"
            className={`nav-item ${location.pathname.startsWith('/lsi') ? 'active' : ''}`}
            aria-label="Linguistic Spirit Interface"
            style={{ position: 'relative' }}
          >
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">🕊️</span>
            <span style={{ fontSize: '0.75rem' }}>LSI</span>
            <span style={{
              position: 'absolute',
              top: '4px',
              right: '8px',
              background: '#FFD700',
              color: '#4A148C',
              fontSize: '0.5rem',
              padding: '1px 4px',
              borderRadius: '6px',
              fontWeight: 'bold'
            }}>NEW</span>
          </Link>
          <button className="nav-item" aria-label="Open settings" disabled>
            <span style={{ fontSize: '1.25rem' }} aria-hidden="true">⚙️</span>
            <span style={{ fontSize: '0.75rem' }}>Settings</span>
          </button>
        </div>
      </nav>
    </>
  );
};

ModernHeader.propTypes = {
  title: PropTypes.string
};

export default ModernHeader;