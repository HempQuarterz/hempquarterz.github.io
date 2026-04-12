/**
 * CovenantDock - Unified floating navigation dock
 *
 * Provides global navigation with 4 items:
 * Home, Scripture (/manuscripts), Spirit AI, About
 *
 * Layout:
 * - Desktop: Left vertical dock with labels
 * - Mobile: Bottom horizontal dock
 */

import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion } from 'framer-motion';
import { Home, BookOpen, Mic, Info } from 'lucide-react';

import DockItem from './DockItem';
import { useReducedMotion } from '../../hooks/useReducedMotion';

import '../../styles/covenant-dock.css';

// Context for manuscript state
export const ManuscriptDockContext = createContext(null);

export const useManuscriptDock = () => useContext(ManuscriptDockContext);

const CovenantDock = () => {
  const [isMobile, setIsMobile] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // Responsive check
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Dock animation variants
  const dockVariants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 }
  } : {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 }
  };

  return (
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
        icon={BookOpen}
        label="Scripture"
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
  );
};

export default CovenantDock;
