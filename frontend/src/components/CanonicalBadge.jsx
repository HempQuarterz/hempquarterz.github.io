/**
 * CanonicalBadge Component
 * Displays a color-coded badge indicating the canonical tier of a Bible book
 *
 * Tier 1 (Canonical): Blue 📘 - Protestant 66-book canon
 * Tier 2 (Deuterocanonical): Green 📗 - Catholic/Orthodox additional books
 * Tier 3 (Apocrypha): Yellow 📙 - Historical witness texts
 * Tier 4 (Ethiopian Heritage): Orange 📕 - Ethiopian Orthodox unique texts
 */

import React from 'react';
import '../styles/canonical-badge.css';

const TIER_CONFIG = {
  1: {
    label: 'Canonical',
    emoji: '📘',
    description: 'Protestant 66-book canon',
    className: 'tier-1'
  },
  2: {
    label: 'Deuterocanonical',
    emoji: '📗',
    description: 'Catholic/Orthodox canon',
    className: 'tier-2'
  },
  3: {
    label: 'Apocrypha',
    emoji: '📙',
    description: 'Historical witness',
    className: 'tier-3'
  },
  4: {
    label: 'Ethiopian Heritage',
    emoji: '📕',
    description: 'Ethiopian Orthodox',
    className: 'tier-4'
  }
};

const CanonicalBadge = ({
  tier,
  showEmoji = true,
  showLabel = true,
  showTooltip = true,
  compact = false
}) => {
  if (!tier || !TIER_CONFIG[tier]) {
    return null;
  }

  const config = TIER_CONFIG[tier];
  const badgeClass = `canonical-badge ${config.className} ${compact ? 'compact' : ''}`;

  return (
    <span
      className={badgeClass}
      title={showTooltip ? `Tier ${tier}: ${config.description}` : ''}
      aria-label={`Canonical Tier ${tier}: ${config.label}`}
    >
      {showEmoji && <span className="badge-emoji">{config.emoji}</span>}
      {showLabel && (
        <span className="badge-label">
          {compact ? `T${tier}` : config.label}
        </span>
      )}
    </span>
  );
};

export default CanonicalBadge;
