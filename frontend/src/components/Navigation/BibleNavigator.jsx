/**
 * BibleNavigator - Full-Screen Miller Column Scripture Navigator
 * Inspired by macOS Finder columns for intuitive Book → Chapter → Verse navigation
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Hash, FileText, X } from 'lucide-react';
import { BIBLE_BOOKS } from '../../utils/bibleStructure';
import NavigationColumn from './NavigationColumn';

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
    // Common verse counts for popular chapters (can be expanded)
    const verseCounts = {
      'PSA-119': 176,
      'PSA-117': 2,
      'GEN-1': 31,
      'JHN-3': 36,
    };
    const key = `${book?.id}-${chapter}`;
    return verseCounts[key] || 30; // Default to 30 verses
  };

  const verses = activeChapter
    ? Array.from({ length: getVerseCount(activeBook, activeChapter) }, (_, i) => i + 1)
    : [];

  // Mobile Tab Button
  const MobileTab = ({ type, label, icon: Icon, active }) => (
    <button
      onClick={() => setMobileView(type)}
      className={`
        flex-1 flex flex-col items-center justify-center py-3 transition-colors relative
        ${active ? 'text-brand-gold' : 'text-slate-500 hover:text-slate-300'}
      `}
    >
      <Icon size={18} className="mb-1" />
      <span className="text-[10px] uppercase font-bold tracking-wider">{label}</span>
      {active && (
        <motion.span
          layoutId="mobileTabIndicator"
          className="absolute bottom-0 left-0 w-full h-0.5 bg-brand-gold shadow-[0_0_10px_rgba(212,175,55,0.8)]"
        />
      )}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="bible-navigator-overlay fixed inset-0 z-[100] overflow-hidden font-sans">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 bg-royal-950/85 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Main Navigator Container */}
          <motion.div
            initial={{ y: '-100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="
              bible-navigator-container
              absolute w-full h-full
              md:h-[600px] md:top-20 md:left-1/2 md:-translate-x-1/2 md:w-[1000px] md:rounded-2xl
              bg-royal-900 border border-brand-gold/20 shadow-2xl overflow-hidden flex flex-col
            "
          >
            {/* Header */}
            <div className="nav-header h-16 border-b border-slate-700/50 flex items-center justify-between px-6 bg-gradient-to-r from-royal-900 via-royal-800 to-royal-900">
              <div className="flex flex-col">
                <span className="font-cinzel font-bold text-lg text-brand-gold tracking-wider">
                  Scripture Navigator
                </span>
                <span className="text-xs text-slate-500">
                  {activeBook?.name || 'Select Book'}
                  {activeChapter ? ` • Chapter ${activeChapter}` : ''}
                </span>
              </div>

              <button
                onClick={onClose}
                className="p-2 rounded-full hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"
                aria-label="Close navigator"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex border-b border-slate-700/50 bg-royal-800/30">
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
            <div className="flex-1 flex overflow-hidden relative bg-gradient-to-b from-royal-900 to-royal-950">
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
            <div className="hidden md:flex h-10 bg-royal-950/50 border-t border-slate-800 items-center justify-between px-6">
              <p className="text-[10px] text-slate-500 font-mono uppercase tracking-widest">
                {activeBook ? activeBook.name : 'Select a Book'}
                <span className="mx-2 text-slate-700">/</span>
                {activeChapter ? `Chapter ${activeChapter}` : '—'}
                <span className="mx-2 text-slate-700">/</span>
                Select Verse
              </p>
              <div className="flex gap-2">
                <div className={`w-2 h-2 rounded-full ${activeBook ? 'bg-brand-gold' : 'bg-slate-700'}`} />
                <div className={`w-2 h-2 rounded-full ${activeChapter ? 'bg-brand-gold' : 'bg-slate-700'}`} />
                <div className="w-2 h-2 rounded-full bg-slate-700" />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default BibleNavigator;
