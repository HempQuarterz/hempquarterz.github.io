// components/Layout.jsx - Modern layout wrapper
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../themeSlice';

const Layout = ({ children }) => {
  const theme = useSelector((state) => state.theme);
  const dispatch = useDispatch();
  const location = useLocation();

  const handleThemeChange = () => {
    dispatch(toggleTheme());
  };

  // Parse breadcrumb from location
  const getBreadcrumbs = () => {
    const paths = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', path: '/' }];
    
    // Add breadcrumbs based on route
    if (paths.includes('book')) {
      breadcrumbs.push({ name: 'Books', path: '/book' });
    }
    if (paths.includes('chapter')) {
      const bookName = decodeURIComponent(paths[paths.indexOf('chapter') + 3] || '');
      breadcrumbs.push({ name: 'Books', path: '/book' });
      if (bookName) breadcrumbs.push({ name: bookName, path: '#' });
    }
    
    return breadcrumbs;
  };

  return (
    <div className="app-layout" data-theme={theme}>
      <header className="modern-header">
        <div className="header-container">
          <Link to="/" className="logo-section">
            <div className="logo">HQ</div>
            <h1 className="app-title">HimQuarterz Bible</h1>
          </Link>
          
          <div className="header-actions">
            <Link to="/search" className="btn btn-secondary">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="m21 21-4.35-4.35"/>
              </svg>
              Search
            </Link>
            
            <button onClick={handleThemeChange} className="btn theme-toggle" aria-label="Toggle theme">
              {theme === 'light' ? (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="5"/>
                  <line x1="12" y1="1" x2="12" y2="3"/>
                  <line x1="12" y1="21" x2="12" y2="23"/>
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                  <line x1="1" y1="12" x2="3" y2="12"/>
                  <line x1="21" y1="12" x2="23" y2="12"/>
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
                </svg>
              ) : (
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </header>
      
      {location.pathname !== '/' && (
        <nav className="nav-breadcrumb">
          <div className="breadcrumb">
            {getBreadcrumbs().map((crumb, index) => (
              <React.Fragment key={index}>
                {index > 0 && <span>›</span>}
                {crumb.path === '#' ? (
                  <span>{crumb.name}</span>
                ) : (
                  <Link to={crumb.path}>{crumb.name}</Link>
                )}
              </React.Fragment>
            ))}
          </div>
        </nav>
      )}
      
      <main className="main-content fade-in">
        {children}
      </main>
    </div>
  );
};

export default Layout;