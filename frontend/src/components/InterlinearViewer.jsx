/**
 * InterlinearViewer Component
 * Displays word-by-word interlinear alignment between manuscripts
 *
 * Shows source language (Hebrew/Greek) above target language (English)
 * with visual connections and hover tooltips showing linguistic details
 */

import React, { useState, useEffect } from 'react';
import { getWordAlignments } from '../api/alignments';
import Loading from './Loading';
import '../styles/interlinear.css';

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

      <div className="interlinear-content">
        {alignments.map((align, index) => (
          <div
            key={index}
            className={`word-pair ${align.alignment_type} ${
              hoveredWord === index ? 'hovered' : ''
            }`}
            onMouseEnter={() => setHoveredWord(index)}
            onMouseLeave={() => setHoveredWord(null)}
          >
            {/* Source word (Hebrew/Greek) */}
            <div className="source-word">
              <div className="word-text">{align.source_word}</div>
              {align.source_strongs && (
                <div className="strongs-number">{align.source_strongs}</div>
              )}
              {align.source_morphology?.morph && (
                <div className="morphology">{align.source_morphology.morph}</div>
              )}
            </div>

            {/* Connection indicator */}
            <div className="alignment-connector">
              {align.alignment_type === 'null-alignment' ? (
                <span className="null-marker">∅</span>
              ) : (
                <span className="arrow">↓</span>
              )}
            </div>

            {/* Target word (English) */}
            <div className="target-word">
              <div className="word-text">
                {align.target_word === '[NULL]' ? (
                  <span className="null-target">[untranslated]</span>
                ) : (
                  align.target_word
                )}
              </div>
              {align.target_word_position !== null && (
                <div className="word-position">pos: {align.target_word_position}</div>
              )}
            </div>

            {/* Hover tooltip with detailed info */}
            {hoveredWord === index && (
              <div className="word-tooltip">
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
              </div>
            )}
          </div>
        ))}
      </div>

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
