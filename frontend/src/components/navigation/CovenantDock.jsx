/**
 * CovenantDock - Unified floating navigation dock
 *
 * Provides global navigation (Home, Navigate, Manuscripts, Spirit AI, About)
 * plus context-aware items for specific pages (Library, Chapters, Settings on manuscripts)
 *
 * Layout:
 * - Desktop: Left vertical dock (macOS style)
 * - Mobile: Bottom horizontal dock (iOS tab bar style)
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Home, Navigation, BookOpen, Mic, Info,
  Library, FileText, Settings
} from 'lucide-react';

import DockItem from './DockItem';
import LibraryPanel from './panels/LibraryPanel';
import ChaptersPanel from './panels/ChaptersPanel';
import SettingsPanel from './panels/SettingsPanel';
import { BibleNavigator } from '../Navigation';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import '../../styles/covenant-dock.css';

// Context for manuscript state (used by dock panels)
export const ManuscriptDockContext = createContext(null);

export const useManuscriptDock = () => useContext(ManuscriptDockContext);

const CovenantDock = ({
  // Manuscript-specific props (passed from ManuscriptsPage or stored in context)
  currentBook,
  currentChapter,
  currentVerse,
  onBookChange,
  onChapterChange,
  showRestored,
  toggleRestoration,
  viewMode,
  setViewMode
}) => {
  const [activePanel, setActivePanel] = useState(null);
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const location = useLocation();
  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Check if on manuscripts page (for context items) - currently unused but may be needed for conditional logic
  // const isManuscriptsPage = location.pathname.startsWith('/manuscripts') ||
  //   location.pathname.startsWith('/manuscript');

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Close panel when route changes
  useEffect(() => {
    setActivePanel(null);
  }, [location.pathname]);

  const togglePanel = (panel) => {
    setActivePanel(prev => prev === panel ? null : panel);
  };

  const closePanel = () => setActivePanel(null);

  const openNavigator = () => {
    setIsNavigatorOpen(true);
    setActivePanel(null);
  };

  // Handle navigator selection
  const handleNavigatorSelect = (selection) => {
    if (selection.book) {
      const params = new URLSearchParams();
      params.set('book', selection.book);
      params.set('chapter', selection.chapter || 1);
      params.set('verse', selection.verse || 1);
      navigate(`/manuscripts?${params.toString()}`);
    }
  };

  // Dock animation variants
  const dockVariants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  };

  return (
    <>
      {/* The Covenant Dock */}
      <motion.nav
        initial={dockVariants.initial}
        animate={dockVariants.animate}
        transition={prefersReducedMotion ? {} : { duration: 0.6, ease: "easeOut" }}
        className={`covenant-dock ${isMobile ? 'mobile' : 'desktop'}`}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo (Desktop only) */}
        {!isMobile && (
          <div className="dock-logo">
            <img
              src="/logo-living.jpg"
              alt="All4Yah"
              className="dock-logo-img"
            />
          </div>
        )}

        {/* === GLOBAL ITEMS === */}
        <DockItem
          icon={Home}
          label="Home"
          to="/"
          isMobile={isMobile}
        />

        <DockItem
          icon={Navigation}
          label="Navigate"
          onClick={openNavigator}
          isActive={isNavigatorOpen}
          isMobile={isMobile}
        />

        <DockItem
          icon={BookOpen}
          label="Manuscripts"
          to="/manuscripts"
          isMobile={isMobile}
        />

        <DockItem
          icon={Mic}
          label="Spirit AI"
          to="/lsi"
          isMobile={isMobile}
        />

        {!isMobile && (
          <DockItem
            icon={Info}
            label="About"
            to="/about"
            isMobile={isMobile}
          />
        )}

        {/* === CONTEXT ITEMS (always visible, work from anywhere) === */}
        <div className={`dock-divider ${isMobile ? 'horizontal' : 'vertical'}`} />

        <DockItem
          icon={Library}
          label="Library"
          onClick={() => togglePanel('library')}
          isActive={activePanel === 'library'}
          isMobile={isMobile}
        />

        <DockItem
          icon={FileText}
          label="Chapters"
          onClick={() => togglePanel('chapters')}
          isActive={activePanel === 'chapters'}
          isMobile={isMobile}
        />

        {!isMobile && (
          <DockItem
            icon={Settings}
            label="Settings"
            onClick={() => togglePanel('settings')}
            isActive={activePanel === 'settings'}
            isMobile={isMobile}
          />
        )}
      </motion.nav>

      {/* === PANELS === */}
      <AnimatePresence>
        {activePanel === 'library' && (
          <LibraryPanel
            key="library"
            onClose={closePanel}
            isMobile={isMobile}
            currentBook={currentBook}
            onBookSelect={onBookChange}
          />
        )}

        {activePanel === 'chapters' && (
          <ChaptersPanel
            key="chapters"
            onClose={closePanel}
            isMobile={isMobile}
            currentBook={currentBook}
            currentChapter={currentChapter}
            onChapterSelect={onChapterChange}
          />
        )}

        {activePanel === 'settings' && (
          <SettingsPanel
            key="settings"
            onClose={closePanel}
            isMobile={isMobile}
            showRestored={showRestored}
            toggleRestoration={toggleRestoration}
            viewMode={viewMode}
            setViewMode={setViewMode}
          />
        )}
      </AnimatePresence>

      {/* Panel Backdrop */}
      <AnimatePresence>
        {activePanel && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closePanel}
            className="dock-backdrop"
          />
        )}
      </AnimatePresence>

      {/* Bible Navigator Modal */}
      <BibleNavigator
        isOpen={isNavigatorOpen}
        onClose={() => setIsNavigatorOpen(false)}
        currentSelection={{
          book: currentBook,
          chapter: currentChapter,
          verse: currentVerse
        }}
        onSelectionChange={handleNavigatorSelect}
      />
    </>
  );
};

export default CovenantDock;
