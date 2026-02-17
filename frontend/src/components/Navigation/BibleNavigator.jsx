/**
 * BibleNavigator - Full-Screen Miller Column Scripture Navigator
 * Inspired by macOS Finder columns for intuitive Book > Chapter > Verse navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Hash, FileText, X } from 'lucide-react';
import { BIBLE_BOOKS } from '../../utils/bibleStructure';
import NavigationColumn from './NavigationColumn';
import '../../styles/bible-navigator.css';

// Navigation column types for mobile tabs
const NAV_COLUMNS = {
  BOOKS: 'BOOKS',
  CHAPTERS: 'CHAPTERS',
  VERSES: 'VERSES'
};

const BibleNavigator = ({
  currentSelection,
  onSelectionChange,
  isOpen,
  onClose
}) => {
  // Local state for navigation drill-down
  const [activeBook, setActiveBook] = useState(null);
  const [activeChapter, setActiveChapter] = useState(null);
  const [mobileView, setMobileView] = useState(NAV_COLUMNS.BOOKS);

  // Sync with current selection when opening
  useEffect(() => {
    if (isOpen && currentSelection) {
      const foundBook = BIBLE_BOOKS.find(
        b => b.id === currentSelection.book || b.name === currentSelection.book
      );
      setActiveBook(foundBook || null);
      setActiveChapter(currentSelection.chapter || null);
    }
  }, [isOpen, currentSelection]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Selection handlers
  const handleBookSelect = useCallback((book) => {
    setActiveBook(book);
    setActiveChapter(null);
    setMobileView(NAV_COLUMNS.CHAPTERS);
  }, []);

  const handleChapterSelect = useCallback((chapter) => {
    setActiveChapter(chapter);
    setMobileView(NAV_COLUMNS.VERSES);
  }, []);

  const handleVerseSelect = useCallback((verse) => {
    if (activeBook && activeChapter) {
      onSelectionChange({
        book: activeBook.id,
        chapter: activeChapter,
        verse: verse
      });
      onClose();
    }
  }, [activeBook, activeChapter, onSelectionChange, onClose]);

  // Generate chapter and verse arrays
  const chapters = activeBook
    ? Array.from({ length: activeBook.chapters }, (_, i) => i + 1)
    : [];

  // Default verse count - could be enhanced with actual verse counts
  const getVerseCount = (book, chapter) => {
    const verseCounts = {
      'PSA-119': 176,
      'PSA-117': 2,
      'GEN-1': 31,
      'JHN-3': 36,
    };
    const key = `${book?.id}-${chapter}`;
    return verseCounts[key] || 30;
  };

  const verses = activeChapter
    ? Array.from({ length: getVerseCount(activeBook, activeChapter) }, (_, i) => i + 1)
    : [];

  // Mobile Tab Button
  const MobileTab = ({ type, label, icon: Icon, active }) => (
    <button
      onClick={() => setMobileView(type)}
      className={`nav-mobile-tab ${active ? 'nav-mobile-tab--active' : ''}`}
    >
      <Icon size={18} className="nav-mobile-tab-icon" />
      <span className="nav-mobile-tab-label">{label}</span>
      {active && (
        <motion.span
          layoutId="mobileTabIndicator"
          className="nav-mobile-tab-indicator"
        />
      )}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="bible-navigator-overlay">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="navigator-backdrop"
            onClick={onClose}
          />

          {/* Main Navigator Container */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="bible-navigator-container"
          >
            {/* Header */}
            <div className="nav-header">
              <div className="nav-header-info">
                <span className="nav-header-title">
                  Scripture Navigator
                </span>
                <span className="nav-header-subtitle">
                  {activeBook?.name || 'Select Book'}
                  {activeChapter ? ` \u2022 Chapter ${activeChapter}` : ''}
                </span>
              </div>

              <button
                onClick={onClose}
                className="nav-close-btn"
                aria-label="Close navigator"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="nav-mobile-tabs">
              <MobileTab
                type={NAV_COLUMNS.BOOKS}
                label="Books"
                icon={BookOpen}
                active={mobileView === NAV_COLUMNS.BOOKS}
              />
              <MobileTab
                type={NAV_COLUMNS.CHAPTERS}
                label="Chapters"
                icon={Hash}
                active={mobileView === NAV_COLUMNS.CHAPTERS}
              />
              <MobileTab
                type={NAV_COLUMNS.VERSES}
                label="Verses"
                icon={FileText}
                active={mobileView === NAV_COLUMNS.VERSES}
              />
            </div>

            {/* Content Area - Three Miller Columns */}
            <div className="nav-columns-area">
              <NavigationColumn
                title="Books"
                type="book"
                data={BIBLE_BOOKS}
                isActive={mobileView === NAV_COLUMNS.BOOKS}
                selectedItem={activeBook}
                onSelect={handleBookSelect}
              />

              <NavigationColumn
                title={activeBook ? activeBook.name : 'Chapters'}
                type="chapter"
                data={chapters}
                isActive={mobileView === NAV_COLUMNS.CHAPTERS}
                selectedItem={activeChapter}
                onSelect={handleChapterSelect}
              />

              <NavigationColumn
                title={activeChapter ? `Verse` : 'Verses'}
                type="verse"
                data={verses}
                isActive={mobileView === NAV_COLUMNS.VERSES}
                selectedItem={null}
                onSelect={handleVerseSelect}
              />
            </div>

            {/* Desktop Footer */}
            <div className="nav-footer">
              <p className="nav-footer-path">
                {activeBook ? activeBook.name : 'Select a Book'}
                <span className="nav-footer-separator">/</span>
                {activeChapter ? `Chapter ${activeChapter}` : '\u2014'}
                <span className="nav-footer-separator">/</span>
                Select Verse
              </p>
              <div className="nav-footer-dots">
                <div className={`nav-footer-dot ${activeBook ? 'nav-footer-dot--active' : ''}`} />
                <div className={`nav-footer-dot ${activeChapter ? 'nav-footer-dot--active' : ''}`} />
                <div className="nav-footer-dot" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BibleNavigator;
