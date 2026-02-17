/**
 * CrossReferencePanel Component
 * Displays cross-references in a collapsible sidebar panel
 * Part of Phase 1: Tier 1 implementation
 */

import React, { useState, useEffect } from 'react';
import {
  getCrossReferences,
  formatCrossReference,
  getCategoryDisplayName,
  getCategoryColor
} from '../api/crossReferences';
import Loading from './Loading';
import '../styles/cross-reference.css';

const CrossReferencePanel = ({ book, chapter, verse, onReferenceClick }) => {
  const [references, setReferences] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const [groupByCategory, setGroupByCategory] = useState(false);

  useEffect(() => {
    async function loadCrossReferences() {
      if (!book || !chapter || !verse) return;

      try {
        setLoading(true);
        setError(null);

        const refs = await getCrossReferences(book, chapter, verse);
        setReferences(refs);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load cross-references:', err);
        setError(err.message || 'Failed to load cross-references');
        setLoading(false);
      }
    }

    loadCrossReferences();
  }, [book, chapter, verse]);

  const handleReferenceClick = (ref) => {
    if (onReferenceClick) {
      onReferenceClick({
        book: ref.target_book,
        chapter: ref.target_chapter,
        verse: ref.target_verse
      });
    }
  };

  // Group references by category if enabled
  const groupedReferences = groupByCategory
    ? references.reduce((acc, ref) => {
        const category = ref.link_type || 'other';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(ref);
        return acc;
      }, {})
    : { all: references };

  if (!book || !chapter || !verse) {
    return null;
  }

  return (
    <div className="cross-ref-panel">
      {/* Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls="cross-ref-content"
        className="cross-ref-header"
      >
        <div>
          <h3 className="cross-ref-title">
            Cross-References
          </h3>
          <p className="cross-ref-subtitle">
            {loading ? 'Loading...' : `${references.length} related passages`}
          </p>
        </div>
        <span className="cross-ref-toggle" aria-hidden="true">{isOpen ? '\u25BC' : '\u25B6'}</span>
      </button>

      {/* Content */}
      {isOpen && (
        <div id="cross-ref-content" className="cross-ref-body">
          {loading && (
            <div className="cross-ref-loading">
              <Loading type="cross-references" />
            </div>
          )}

          {error && (
            <div className="cross-ref-error" role="alert">
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && references.length === 0 && (
            <p className="cross-ref-empty">
              No cross-references available for this verse.
            </p>
          )}

          {!loading && !error && references.length > 0 && (
            <>
              {/* View Toggle */}
              <div className="cross-ref-toggle-row">
                <button
                  onClick={() => setGroupByCategory(!groupByCategory)}
                  className="cross-ref-group-btn"
                  aria-pressed={groupByCategory}
                >
                  {groupByCategory ? 'Show All' : 'Group by Type'}
                </button>
              </div>

              {/* References List */}
              {Object.entries(groupedReferences).map(([category, refs]) => (
                <div key={category} className="cross-ref-category">
                  {groupByCategory && category !== 'all' && (
                    <h4
                      className="cross-ref-category-title"
                      style={{ color: getCategoryColor(category) }}
                    >
                      {getCategoryDisplayName(category)} ({refs.length})
                    </h4>
                  )}

                  <div className="cross-ref-list">
                    {refs.map((ref, index) => (
                      <button
                        key={index}
                        onClick={() => handleReferenceClick(ref)}
                        className="cross-ref-card"
                        style={{
                          borderLeftColor: getCategoryColor(ref.link_type || 'other'),
                          borderColor: `${getCategoryColor(ref.link_type || 'other')}40`
                        }}
                        aria-label={`Navigate to ${formatCrossReference(ref)}`}
                      >
                        <div className="cross-ref-card-inner">
                          <span className="cross-ref-reference">
                            {formatCrossReference(ref)}
                          </span>
                          {!groupByCategory && ref.link_type && (
                            <span
                              className="cross-ref-badge"
                              style={{
                                background: `${getCategoryColor(ref.link_type)}20`,
                                color: getCategoryColor(ref.link_type)
                              }}
                            >
                              {getCategoryDisplayName(ref.link_type)}
                            </span>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default CrossReferencePanel;
