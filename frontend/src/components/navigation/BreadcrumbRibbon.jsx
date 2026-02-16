/**
 * BreadcrumbRibbon - Minimal contextual header
 *
 * Replaces the full ModernHeader with a slim breadcrumb trail
 * Shows: Logo | Home > Page > Context | Theme Toggle
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useBreadcrumbs } from './hooks/useBreadcrumbs';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import '../../styles/breadcrumb-ribbon.css';

const BreadcrumbRibbon = () => {
  const [theme, setTheme] = useState('light');
  const breadcrumbs = useBreadcrumbs();
  const prefersReducedMotion = useReducedMotion();

  // Initialize theme from localStorage
  useEffect(() => {
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
    <header className="breadcrumb-ribbon">
      {/* Logo */}
      <Link to="/" className="ribbon-logo">
        <img
          src="/logo-brand.svg"
          alt="All4Yah"
          className="ribbon-logo-img"
        />
      </Link>

      {/* Breadcrumb Trail */}
      <nav className="breadcrumb-trail" aria-label="Breadcrumb">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <span className="breadcrumb-separator" aria-hidden="true">›</span>
            )}
            {index === breadcrumbs.length - 1 ? (
              // Current page (not a link)
              <span className="breadcrumb-current" aria-current="page">
                {crumb.label}
              </span>
            ) : (
              <Link to={crumb.path} className="breadcrumb-link">
                {crumb.label}
              </Link>
            )}
          </React.Fragment>
        ))}
      </nav>

      {/* Theme Toggle */}
      <motion.button
        onClick={toggleTheme}
        whileHover={prefersReducedMotion ? {} : { scale: 1.1 }}
        whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
        className="ribbon-theme-toggle"
        aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      >
        {theme === 'light' ? (
          <Sun size={18} strokeWidth={1.5} />
        ) : (
          <Moon size={18} strokeWidth={1.5} />
        )}
      </motion.button>
    </header>
  );
};

export default BreadcrumbRibbon;
