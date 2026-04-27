/**
 * CrossReferenceBadge Component
 * Displays an inline badge showing the number of cross-references for a verse
 * Part of Phase 1: Tier 2 implementation
 */

import React, { useState } from 'react';
import { formatCrossReference } from '../api/crossReferences';
import '../styles/cross-reference-badge.css';

const CrossReferenceBadge = ({ count, references, onBadgeClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (count === 0) return null;

  const topReferences = references?.slice(0, 3) || [];

  const handleClick = (e) => {
    e.stopPropagation();
    if (onBadgeClick) {
      onBadgeClick();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick(e);
    }
  };

  return (
    <span
      className="xref-wrapper"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <button
        type="button"
        className="xref-badge"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        aria-label={`${count} cross-references available`}
      >
        {count}
      </button>

      {showTooltip && topReferences.length > 0 && (
        <div className="xref-tooltip" role="tooltip">
          <div className="xref-tooltip-title">
            {count} Cross-Reference{count !== 1 ? 's' : ''}
          </div>
          <div className="xref-tooltip-list">
            {topReferences.map((ref, index) => (
              <div key={index} className="xref-tooltip-item">
                · {formatCrossReference(ref)}
              </div>
            ))}
            {count > 3 && (
              <div className="xref-tooltip-more">+{count - 3} more</div>
            )}
          </div>
          <div className="xref-tooltip-cta">Click to view all →</div>
        </div>
      )}
    </span>
  );
};

export default CrossReferenceBadge;
