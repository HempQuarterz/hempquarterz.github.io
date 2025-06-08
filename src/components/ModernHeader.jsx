import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme } from '../themeSlice';

const ModernHeader = ({ title = "ForYah Bible" }) => {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const handleThemeToggle = () => {
    dispatch(toggleTheme());
    // Update data-theme attribute for CSS
    document.documentElement.setAttribute('data-theme', theme === 'light' ? 'dark' : 'light');
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
              
              <div className="theme-toggle" onClick={handleThemeToggle}>
                <div className="theme-toggle-slider">
                  {theme === 'light' ? '☀️' : '🌙'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <nav className="bottom-nav">
        <div className="bottom-nav-content">
          <a 
            href="/" 
            className={`nav-item ${isHome ? 'active' : ''}`}
          >
            <span style={{ fontSize: '1.25rem' }}>📖</span>
            <span style={{ fontSize: '0.75rem' }}>Home</span>
          </a>
          <div className="nav-item">
            <span style={{ fontSize: '1.25rem' }}>🔍</span>
            <span style={{ fontSize: '0.75rem' }}>Search</span>
          </div>
          <div className="nav-item">
            <span style={{ fontSize: '1.25rem' }}>⭐</span>
            <span style={{ fontSize: '0.75rem' }}>Saved</span>
          </div>
          <div className="nav-item">
            <span style={{ fontSize: '1.25rem' }}>⚙️</span>
            <span style={{ fontSize: '0.75rem' }}>Settings</span>
          </div>
        </div>
      </nav>
    </>
  );
};

export default ModernHeader;