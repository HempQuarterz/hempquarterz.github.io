/**
 * DockItem - Individual button in the CovenantDock
 * Features magnetic hover effect, labels, and active state indication
 */

import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import MagneticButton from '../ui/MagneticButton';
import { useReducedMotion } from '../../hooks/useReducedMotion';

const DockItem = ({
  icon: Icon,
  label,
  to,           // Route path (for navigation items)
  onClick,      // Click handler (for action items)
  isActive,     // Manually control active state
  disabled = false,
  isMobile = false
}) => {
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
    <div className="dock-item-wrapper">
      <MagneticButton
        onClick={handleClick}
        strength={prefersReducedMotion ? 0 : 0.4}
        className={`dock-item ${showActive ? 'active' : ''} ${disabled ? 'disabled' : ''}`}
        aria-label={label}
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
          <Icon size={20} strokeWidth={1.5} />
        </div>

        {/* Label (always visible on both desktop and mobile) */}
        <span className={`dock-item-label ${showActive ? 'active' : ''}`}>{label}</span>
      </MagneticButton>
    </div>
  );
};

export default DockItem;
