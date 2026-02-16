/**
 * DockPanel - Slide-out panel from the CovenantDock
 * Adapts to mobile (slides up) and desktop (slides right)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useReducedMotion } from '../../hooks/useReducedMotion';

// Animation variants for panel content
export const panelContentVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.15
    }
  }
};

export const panelItemVariants = {
  hidden: { opacity: 0, x: -10, scale: 0.95 },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 150, damping: 15 }
  }
};

const DockPanel = ({ title, onClose, children, isMobile = false }) => {
  const prefersReducedMotion = useReducedMotion();

  // Animation variants based on device and motion preference
  const panelVariants = prefersReducedMotion ? {
    initial: { opacity: 1 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  } : {
    initial: isMobile
      ? { y: '100%', opacity: 0 }
      : { x: -30, opacity: 0, scale: 0.98 },
    animate: isMobile
      ? { y: 0, opacity: 1 }
      : { x: 0, opacity: 1, scale: 1 },
    exit: isMobile
      ? { y: '100%', opacity: 0 }
      : { x: -30, opacity: 0, scale: 0.98 }
  };

  return (
    <motion.div
      initial={panelVariants.initial}
      animate={panelVariants.animate}
      exit={panelVariants.exit}
      transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 350, damping: 30 }}
      className={`dock-panel ${isMobile ? 'mobile' : 'desktop'}`}
    >
      {/* Panel Header */}
      <motion.div
        initial={prefersReducedMotion ? {} : { opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.3 }}
        className="dock-panel-header"
      >
        <h2 className="dock-panel-title">
          {/* Animated decorative dot */}
          <span className="dock-panel-dot">
            <span className="dock-panel-dot-ping" />
            <span className="dock-panel-dot-core" />
          </span>
          {title}
        </h2>
        <motion.button
          onClick={onClose}
          whileHover={prefersReducedMotion ? {} : { scale: 1.1, rotate: 90 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
          className="dock-panel-close"
          aria-label="Close panel"
        >
          <X size={20} />
        </motion.button>
      </motion.div>

      {/* Panel Content */}
      <motion.div
        variants={prefersReducedMotion ? {} : panelContentVariants}
        initial="hidden"
        animate="visible"
        className="dock-panel-content"
      >
        {children}
      </motion.div>
    </motion.div>
  );
};

export default DockPanel;
