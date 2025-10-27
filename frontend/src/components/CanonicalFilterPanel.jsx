/**
 * CanonicalFilterPanel Component
 * Provides checkboxes to filter Bible books by canonical tier
 *
 * Allows users to show/hide books based on:
 * - Tier 1: Canonical (Protestant 66 books)
 * - Tier 2: Deuterocanonical (Catholic/Orthodox additional books)
 * - Tier 3: Apocrypha (Historical witness texts)
 * - Tier 4: Ethiopian Heritage (Ethiopian Orthodox texts)
 */

import React from 'react';
import CanonicalBadge from './CanonicalBadge';
import '../styles/canonical-filter.css';

const TIER_OPTIONS = [
  {
    tier: 1,
    label: 'Canonical',
    description: '66 Protestant canon books (Genesis-Revelation)',
    defaultChecked: true
  },
  {
    tier: 2,
    label: 'Deuterocanonical',
    description: '21 Catholic/Orthodox books (Tobit, Wisdom, Maccabees, etc.)',
    defaultChecked: true
  },
  {
    tier: 3,
    label: 'Apocrypha',
    description: '2 historical witness texts (Gospel of Thomas, Gospel of Mary)',
    defaultChecked: false
  },
  {
    tier: 4,
    label: 'Ethiopian Heritage',
    description: '1 Ethiopian Orthodox text (Kebra Nagast)',
    defaultChecked: false
  }
];

const CanonicalFilterPanel = ({
  selectedTiers = [1, 2],
  onTiersChange,
  showCounts = true,
  tierCounts = { 1: 66, 2: 21, 3: 2, 4: 1 },
  compact = false
}) => {
  const handleTierToggle = (tier) => {
    const newTiers = selectedTiers.includes(tier)
      ? selectedTiers.filter(t => t !== tier)
      : [...selectedTiers, tier].sort();

    onTiersChange(newTiers);
  };

  const handleSelectAll = () => {
    onTiersChange([1, 2, 3, 4]);
  };

  const handleSelectNone = () => {
    onTiersChange([]);
  };

  const handleCanonicalOnly = () => {
    onTiersChange([1]);
  };

  const handleCanonicalPlus = () => {
    onTiersChange([1, 2]);
  };

  return (
    <div className={`canonical-filter-panel ${compact ? 'compact' : ''}`}>
      <div className="filter-header">
        <h3 className="filter-title">
          <span className="title-icon">📚</span>
          Canonical Tiers
        </h3>
        <div className="filter-presets">
          <button
            className="preset-btn"
            onClick={handleCanonicalOnly}
            title="Protestant canon only (66 books)"
          >
            Protestant
          </button>
          <button
            className="preset-btn"
            onClick={handleCanonicalPlus}
            title="Protestant + Deuterocanonical (87 books)"
          >
            Catholic
          </button>
          <button
            className="preset-btn"
            onClick={handleSelectAll}
            title="All tiers"
          >
            All
          </button>
          <button
            className="preset-btn"
            onClick={handleSelectNone}
            title="Clear all"
          >
            None
          </button>
        </div>
      </div>

      <div className="filter-options">
        {TIER_OPTIONS.map(({ tier, label, description }) => {
          const isChecked = selectedTiers.includes(tier);
          const count = tierCounts[tier] || 0;

          return (
            <label
              key={tier}
              className={`filter-option ${isChecked ? 'checked' : ''}`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => handleTierToggle(tier)}
                aria-label={`Filter ${label} books`}
              />
              <div className="option-content">
                <div className="option-header">
                  <CanonicalBadge
                    tier={tier}
                    showEmoji={true}
                    showLabel={!compact}
                    showTooltip={false}
                    compact={compact}
                  />
                  {showCounts && (
                    <span className="book-count">
                      {count} {count === 1 ? 'book' : 'books'}
                    </span>
                  )}
                </div>
                {!compact && (
                  <p className="option-description">{description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>

      {selectedTiers.length === 0 && (
        <div className="filter-warning">
          ⚠️ No tiers selected. Please select at least one tier to view books.
        </div>
      )}

      {!compact && (
        <div className="filter-info">
          <p className="info-text">
            <strong>Showing:</strong>{' '}
            {selectedTiers.length === 0
              ? 'No books'
              : selectedTiers.length === 4
              ? 'All books'
              : `${selectedTiers.map(t => TIER_OPTIONS.find(o => o.tier === t)?.label).join(', ')}`}
          </p>
          <p className="info-text">
            <strong>Total:</strong>{' '}
            {selectedTiers.reduce((sum, tier) => sum + (tierCounts[tier] || 0), 0)} books
          </p>
        </div>
      )}
    </div>
  );
};

export default CanonicalFilterPanel;
