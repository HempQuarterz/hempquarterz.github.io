/**
 * GematriaChip Component
 * Displays gematria value on hover for Hebrew/Greek words
 *
 * FAITH ALIGNMENT: This component shows linguistic patterns only.
 * Values are study aids, not sources of revelation or divination.
 */

import React, { useState, useEffect } from 'react';
import { calculateGematria, GEMATRIA_SYSTEMS } from '../utils/gematria';
import '../styles/gematria.css';

const GematriaChip = ({
  token,
  language = 'auto',
  system = 'standard',
  showBreakdown = false,
  disabled = false
}) => {
  const [gematriaData, setGematriaData] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState('top');

  useEffect(() => {
    if (disabled || !token) return;

    // Calculate gematria value
    const result = calculateGematria(token, language, system);
    setGematriaData(result);
  }, [token, language, system, disabled]);

  const handleMouseEnter = (e) => {
    if (disabled) return;
    setIsHovered(true);

    // Determine tooltip position based on element position
    const rect = e.currentTarget.getBoundingClientRect();
    const spaceAbove = rect.top;
    const spaceBelow = window.innerHeight - rect.bottom;

    setTooltipPosition(spaceAbove > spaceBelow ? 'top' : 'bottom');
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  if (disabled || !gematriaData || gematriaData.value === 0) {
    // Render plain text without gematria functionality
    return <span dir={language === 'hebrew' ? 'rtl' : 'ltr'}>{token}</span>;
  }

  const systemInfo = GEMATRIA_SYSTEMS[system];

  return (
    <span
      className="gematria-chip-wrapper"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      dir={gematriaData.language === 'hebrew' ? 'rtl' : 'ltr'}
    >
      <span className="gematria-chip-text">
        {token}
      </span>

      {isHovered && (
        <span
          className={`gematria-tooltip gematria-tooltip-${tooltipPosition}`}
          role="tooltip"
        >
          <div className="gematria-tooltip-header">
            <span className="gematria-value">{gematriaData.value}</span>
            <span className="gematria-system">
              {systemInfo?.name || system}
            </span>
          </div>

          {gematriaData.normalized !== token && (
            <div className="gematria-normalized">
              Normalized: {gematriaData.normalized}
            </div>
          )}

          <div className="gematria-language">
            {gematriaData.language === 'hebrew' ? '🔯 Hebrew' : '✝ Greek'}
          </div>

          {showBreakdown && (
            <div className="gematria-breakdown-hint">
              Click for detailed breakdown
            </div>
          )}
        </span>
      )}
    </span>
  );
};

export default GematriaChip;
