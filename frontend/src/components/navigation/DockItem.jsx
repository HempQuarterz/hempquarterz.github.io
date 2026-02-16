/**
 * DockItem - Individual button in the CovenantDock
 * Features magnetic hover effect, tooltips, and active state indication
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import MagneticButton from '../ui/MagneticButton';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const DockItem = ({
  icon: Icon,
  label,
  to,           // Route path (for navigation items)
  onClick,      // Click handler (for action items like panels)
  isActive,     // Manually control active state
  disabled = false,
  isMobile = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  // Determine if this is the active route
  const isActiveRoute = to ? location.pathname === to ||
    (to !== '/' && location.pathname.startsWith(to)) : false;
  const showActive = isActive !== undefined ? isActive : isActiveRoute;

  const handleClick = () => {
    if (disabled) return;
    if (onClick) {
      onClick();
    } else if (to) {
      navigate(to);
    }
  };

  return (
    <div
      className="dock-item-wrapper"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Tooltip (Desktop) */}
      <AnimatePresence>
        {isHovered && !isMobile && (
          <motion.div
            initial={prefersReducedMotion ? { opacity: 1 } : { opacity: 0, x: 10, scale: 0.95 }}
            animate={{ opacity: 1, x: 18, scale: 1 }}
            exit={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, x: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="dock-tooltip"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Magnetic Button Wrapper */}
      <MagneticButton
        onClick={handleClick}
        strength={prefersReducedMotion ? 0 : 0.4}
        className={`dock-item ${showActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
      >
        {/* Active Indicator Background */}
        {showActive && (
          <motion.div
            layoutId="activeDockIndicator"
            className="dock-item-active-bg"
            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300, damping: 30 }}
          />
        )}

        {/* Icon */}
        <div className={`dock-item-icon ${showActive ? 'active' : ''}`}>
          <Icon size={22} strokeWidth={1.5} />
        </div>

        {/* Mobile Label (shown below icon) */}
        {isMobile && (
          <span className="dock-item-label">{label}</span>
        )}
      </MagneticButton>
    </div>
  );
};

export default DockItem;
