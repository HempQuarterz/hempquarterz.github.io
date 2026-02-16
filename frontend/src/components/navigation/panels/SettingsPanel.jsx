/**
 * SettingsPanel - View settings for manuscripts
 * Controls: Divine name restoration, view mode (chapter/verse)
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Eye, Sparkles } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import DockPanel, { panelItemVariants } from '../DockPanel';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const SettingsPanel = ({
  onClose,
  isMobile,
  showRestored,
  toggleRestoration,
  viewMode,
  setViewMode
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isOnManuscripts = location.pathname.startsWith('/manuscripts');

  // If not on manuscripts, show a link to go there
  if (!isOnManuscripts) {
    return (
      <DockPanel title="Settings" onClose={onClose} isMobile={isMobile}>
        <div className="settings-redirect">
          <p className="settings-info">
            View settings are available on the Manuscripts page.
          </p>
          <motion.button
            onClick={() => {
              navigate('/manuscripts');
              onClose();
            }}
            whileHover={prefersReducedMotion ? {} : { scale: 1.02 }}
            whileTap={prefersReducedMotion ? {} : { scale: 0.98 }}
            className="settings-go-btn"
          >
            Go to Manuscripts
          </motion.button>
        </div>
      </DockPanel>
    );
  }

  return (
    <DockPanel title="Settings" onClose={onClose} isMobile={isMobile}>
      <div className="settings-panel-content">
        {/* Divine Name Restoration Toggle */}
        <motion.div
          variants={prefersReducedMotion ? {} : panelItemVariants}
          onClick={toggleRestoration}
          whileHover={prefersReducedMotion ? {} : { scale: 1.01, y: -2 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
          className="settings-toggle-card"
        >
          <div className="toggle-card-left">
            <div className={`toggle-icon ${showRestored ? 'active' : ''}`}>
              <Sparkles size={20} />
            </div>
            <div className="toggle-info">
              <h3 className="toggle-title">Divine Names</h3>
              <p className="toggle-desc">Restore original Hebrew names</p>
            </div>
          </div>
          <motion.div
            className={`toggle-switch ${showRestored ? 'on' : 'off'}`}
            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
          >
            <motion.div
              layout
              className="toggle-knob"
              animate={{ left: showRestored ? '1.5rem' : '0.25rem' }}
              transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 500, damping: 30 }}
            />
          </motion.div>
        </motion.div>

        {/* View Mode Toggle */}
        <motion.div
          variants={prefersReducedMotion ? {} : panelItemVariants}
          onClick={() => setViewMode(viewMode === 'chapter' ? 'verse' : 'chapter')}
          whileHover={prefersReducedMotion ? {} : { scale: 1.01, y: -2 }}
          whileTap={prefersReducedMotion ? {} : { scale: 0.99 }}
          className="settings-toggle-card"
        >
          <div className="toggle-card-left">
            <div className="toggle-icon neutral">
              <Eye size={20} />
            </div>
            <div className="toggle-info">
              <h3 className="toggle-title">Reading Mode</h3>
              <p className="toggle-desc">
                {viewMode === 'chapter' ? 'Continuous Chapter' : 'Verse by Verse'}
              </p>
            </div>
          </div>
          <motion.div
            className="mode-badge"
            key={viewMode}
            initial={prefersReducedMotion ? {} : { opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={prefersReducedMotion ? {} : { type: "spring", stiffness: 300 }}
          >
            {viewMode === 'chapter' ? 'CHAP' : 'VRS'}
          </motion.div>
        </motion.div>
      </div>
    </DockPanel>
  );
};

export default SettingsPanel;
