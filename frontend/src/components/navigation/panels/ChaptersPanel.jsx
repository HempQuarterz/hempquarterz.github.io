/**
 * ChaptersPanel - Chapter selection grid for the CovenantDock
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import DockPanel, { panelItemVariants } from '../DockPanel';
import { getBookChapters } from '../../../api/verses';
import { useReducedMotion } from '../../../hooks/useReducedMotion';

const ChaptersPanel = ({
  onClose,
  isMobile,
  currentBook,
  currentChapter,
  onChapterSelect
}) => {
  const [chapters, setChapters] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();
  const isOnManuscripts = location.pathname.startsWith('/manuscripts');

  useEffect(() => {
    if (currentBook) {
      setLoading(true);
      getBookChapters(currentBook)
        .then(setChapters)
        .catch(() => {
          // Fallback to 50 chapters if API fails
          setChapters(Array.from({ length: 50 }, (_, i) => i + 1));
        })
        .finally(() => setLoading(false));
    }
  }, [currentBook]);

  const handleChapterClick = (chapter) => {
    if (isOnManuscripts && onChapterSelect) {
      onChapterSelect(chapter);
    } else {
      navigate(`/manuscripts?book=${currentBook || 'GEN'}&chapter=${chapter}&verse=1`);
    }
    if (isMobile) onClose();
  };

  const bookName = currentBook || 'Genesis';

  return (
    <DockPanel
      title={`${bookName} Chapters`}
      onClose={onClose}
      isMobile={isMobile}
    >
      {loading ? (
        <div className="panel-loading">Loading chapters...</div>
      ) : (
        <div className="chapters-grid">
          {chapters.map(ch => (
            <motion.button
              key={ch}
              variants={prefersReducedMotion ? {} : panelItemVariants}
              onClick={() => handleChapterClick(ch)}
              whileHover={prefersReducedMotion ? {} : { scale: 1.1, y: -2 }}
              whileTap={prefersReducedMotion ? {} : { scale: 0.9 }}
              className={`chapter-btn ${parseInt(currentChapter) === ch ? 'active' : ''}`}
            >
              {ch}
            </motion.button>
          ))}
        </div>
      )}
    </DockPanel>
  );
};

export default ChaptersPanel;
