import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { BibleNavigator } from './Navigation';
import { Menu } from 'lucide-react';
import '../styles/modern-header.css';

const ModernHeader = ({ title = "All4Yah" }) => {
  const navigate = useNavigate();
  const [theme, setTheme] = useState('light');
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [currentSelection, setCurrentSelection] = useState({ book: 'GEN', chapter: 1, verse: 1 });

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

  return (
    <>
      <header className="mh-header">
        <div className="mh-left">
          {/* Hamburger Menu - Navigator Trigger */}
          <button
            onClick={() => setIsNavigatorOpen(true)}
            className="mh-menu-btn"
            aria-label="Open Scripture Navigator"
          >
            <Menu size={28} strokeWidth={2} />
          </button>

          <Link to="/" className="mh-logo-link">
            <img
              src="/logo-brand.svg"
              alt="All4Yah Logo"
              className="mh-logo-img"
            />
            <h1 className="mh-title">{title}</h1>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="mh-desktop-nav">
          <Link to="/" className="mh-nav-link">Home</Link>
          <Link to="/manuscripts" className="mh-nav-link">Manuscripts</Link>
          <Link to="/lsi" className="mh-nav-link">Spirit AI</Link>
          <Link to="/about" className="mh-nav-link">About</Link>

          <button
            onClick={toggleTheme}
            className="mh-theme-toggle"
            aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
          >
            <img
              src={theme === 'light' ? "/icons/icon-sun.svg" : "/icons/icon-moon.svg"}
              alt=""
              className="mh-theme-icon"
            />
          </button>
        </nav>
      </header>

      {/* Navigation Overlay */}
      <BibleNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        currentSelection={currentSelection}
        onSelectionChange={(selection) => {
          setCurrentSelection(selection);
          navigate(`/manuscripts?book=${selection.book}&chapter=${selection.chapter}&verse=${selection.verse}`);
        }}
      />
    </>
  );
};

ModernHeader.propTypes = {
  title: PropTypes.string
};

export default ModernHeader;