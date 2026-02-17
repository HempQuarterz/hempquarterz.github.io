/**
 * CovenantDock - Unified floating navigation dock
 *
 * Provides global navigation with 5 items:
 * Home, Scripture (opens BibleNavigator), Manuscripts, Spirit AI, About
 *
 * Layout:
 * - Desktop: Left vertical dock with labels
 * - Mobile: Bottom horizontal dock
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Home, BookOpen, Mic, Info, BookMarked
} from 'lucide-react';

import DockItem from './DockItem';
import { BibleNavigator } from '../Navigation';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import '../../styles/covenant-dock.css';

// Context for manuscript state
export const ManuscriptDockContext = createContext(null);

export const useManuscriptDock = () => useContext(ManuscriptDockContext);

const CovenantDock = ({
  currentBook,
  currentChapter,
  currentVerse,
}) => {
  const [isNavigatorOpen, setIsNavigatorOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const navigate = useNavigate();
  const prefersReducedMotion = useReducedMotion();

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const openNavigator = () => {
    setIsNavigatorOpen(true);
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
        <DockItem
          icon={Home}
          label="Home"
          to="/"
          isMobile={isMobile}
        />

        <DockItem
          icon={BookMarked}
          label="Scripture"
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

        <DockItem
          icon={Info}
          label="About"
          to="/about"
          isMobile={isMobile}
        />
      </motion.nav>

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
