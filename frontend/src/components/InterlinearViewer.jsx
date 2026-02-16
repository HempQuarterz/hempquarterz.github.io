/**
 * InterlinearViewer Component
 * Displays word-by-word interlinear alignment between manuscripts
 *
 * Shows source language (Hebrew/Greek) above target language (English)
 * with visual connections and hover tooltips showing linguistic details
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getWordAlignments } from '../api/alignments';
import Loading from './Loading';
import '../styles/interlinear.css';

// Animation variants for staggered word pair entrance
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

const wordPairVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 100, damping: 12 }
  }
};

// Animated SVG connector component
const AnimatedConnector = ({ type, index }) => {
  if (type === 'null-alignment') {
    return (
      <motion.span
        className="null-marker"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: index * 0.05 + 0.3, type: "spring", stiffness: 200 }}
      >
        ∅
      </motion.span>
    );
  }

  return (
    <motion.svg
      width="20"
      height="30"
      viewBox="0 0 20 30"
      className="connector-svg"
    >
      <motion.line
        x1="10"
        y1="0"
        x2="10"
        y2="22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.4, delay: index * 0.08 + 0.2 }}
      />
      <motion.path
        d="M5 22 L10 28 L15 22"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
        initial={{ pathLength: 0, opacity: 0 }}
        animate={{ pathLength: 1, opacity: 1 }}
        transition={{ duration: 0.2, delay: index * 0.08 + 0.5 }}
      />
    </motion.svg>
  );
};

const InterlinearViewer = ({
  sourceManuscript = 'WLC',
  targetManuscript = 'WEB',
  book,
  chapter,
  verse
}) => {
  const [alignments, setAlignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hoveredWord, setHoveredWord] = useState(null);

  useEffect(() => {
    async function loadAlignments() {
      try {
        setLoading(true);
        setError(null);

        const data = await getWordAlignments(
          sourceManuscript,
          targetManuscript,
          book,
          chapter,
          verse
        );

        if (data.length === 0) {
          setError('No word alignment data available for this verse');
        }

        setAlignments(data);
      } catch (err) {
        console.error('Error loading alignments:', err);
        setError('Failed to load interlinear data');
      } finally {
        setLoading(false);
      }
    }

    if (book && chapter && verse) {
      loadAlignments();
    }
  }, [sourceManuscript, targetManuscript, book, chapter, verse]);

  if (loading) return <Loading message="Loading interlinear view..." />;
  if (error) return <div className="interlinear-error">{error}</div>;
  if (alignments.length === 0) return null;

  return (
    <div className="interlinear-viewer">
      <div className="interlinear-header">
        <h3>Interlinear View</h3>
        <div className="interlinear-legend">
          <span className="legend-item">
            <span className="legend-color one-to-one"></span> One-to-One
          </span>
          <span className="legend-item">
            <span className="legend-color one-to-many"></span> One-to-Many
          </span>
          <span className="legend-item">
            <span className="legend-color null-alignment"></span> No Translation
          </span>
        </div>
      </div>

      <motion.div
        className="interlinear-content"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {alignments.map((align, index) => (
          <motion.div
            key={index}
            variants={wordPairVariants}
            className={`word-pair ${align.alignment_type} ${
              hoveredWord === index ? 'hovered' : ''
            }`}
            onMouseEnter={() => setHoveredWord(index)}
            onMouseLeave={() => setHoveredWord(null)}
            whileHover={{ scale: 1.05, y: -2 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            {/* Source word (Hebrew/Greek) */}
            <div className="source-word">
              <motion.div
                className="word-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.08 }}
              >
                {align.source_word}
              </motion.div>
              {align.source_strongs && (
                <div className="strongs-number">{align.source_strongs}</div>
              )}
              {align.source_morphology?.morph && (
                <div className="morphology">{align.source_morphology.morph}</div>
              )}
            </div>

            {/* Animated Connection indicator */}
            <div className="alignment-connector">
              <AnimatedConnector type={align.alignment_type} index={index} />
            </div>

            {/* Target word (English) */}
            <div className="target-word">
              <motion.div
                className="word-text"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.08 + 0.4 }}
              >
                {align.target_word === '[NULL]' ? (
                  <span className="null-target">[untranslated]</span>
                ) : (
                  align.target_word
                )}
              </motion.div>
              {align.target_word_position !== null && (
                <div className="word-position">pos: {align.target_word_position}</div>
              )}
            </div>

            {/* Hover tooltip with detailed info */}
            {hoveredWord === index && (
              <motion.div
                className="word-tooltip"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                transition={{ duration: 0.2 }}
              >
                <div className="tooltip-row">
                  <strong>Source:</strong> {align.source_word}
                </div>
                {align.source_lemma && (
                  <div className="tooltip-row">
                    <strong>Lemma:</strong> {align.source_lemma}
                  </div>
                )}
                {align.source_strongs && (
                  <div className="tooltip-row">
                    <strong>Strong's:</strong> {align.source_strongs}
                  </div>
                )}
                {align.source_morphology?.gloss && (
                  <div className="tooltip-row">
                    <strong>Gloss:</strong> {align.source_morphology.gloss}
                  </div>
                )}
                <div className="tooltip-row">
                  <strong>Type:</strong> {align.alignment_type}
                </div>
                <div className="tooltip-row">
                  <strong>Confidence:</strong> {(parseFloat(align.alignment_confidence) * 100).toFixed(0)}%
                </div>
                {align.notes && (
                  <div className="tooltip-notes">{align.notes.split('\\n')[0]}</div>
                )}
              </motion.div>
            )}
          </motion.div>
        ))}
      </motion.div>

      <div className="interlinear-footer">
        <span className="manuscript-labels">
          {sourceManuscript} → {targetManuscript}
        </span>
        <span className="alignment-count">
          {alignments.length} word{alignments.length !== 1 ? 's' : ''} aligned
        </span>
      </div>
    </div>
  );
};

export default InterlinearViewer;
