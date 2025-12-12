/**
 * CrossReferencePanel Component
 * Displays cross-references in a collapsible sidebar panel
 * Part of Phase 1: Tier 1 implementation
 */

import React, { useState, useEffect } from 'react';
import {
  getCrossReferences,
  getCrossReferenceCount,
  formatCrossReference,
  getCategoryDisplayName,
  getCategoryColor
} from '../api/crossReferences';
import Loading from './Loading';

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
    <div style={{
      background: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      overflow: 'hidden',
      marginTop: '1rem'
    }}>
      {/* Header */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        style={{
          padding: '1rem',
          background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
          color: '#fff',
          cursor: 'pointer',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          userSelect: 'none'
        }}
      >
        <div>
          <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
            Cross-References
          </h3>
          <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>
            {loading ? 'Loading...' : `${references.length} related passages`}
          </p>
        </div>
        <span style={{ fontSize: '1.5rem' }}>{isOpen ? '▼' : '▶'}</span>
      </div>

      {/* Content */}
      {isOpen && (
        <div style={{ padding: '1rem' }}>
          {loading && (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
              <Loading type="cross-references" />
            </div>
          )}

          {error && (
            <div style={{
              padding: '1rem',
              background: '#ffebee',
              border: '1px solid #ef5350',
              borderRadius: '4px',
              color: '#c62828'
            }}>
              <strong>Error:</strong> {error}
            </div>
          )}

          {!loading && !error && references.length === 0 && (
            <p style={{ textAlign: 'center', color: '#666', padding: '1rem' }}>
              No cross-references available for this verse.
            </p>
          )}

          {!loading && !error && references.length > 0 && (
            <>
              {/* View Toggle */}
              <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginBottom: '1rem'
              }}>
                <button
                  onClick={() => setGroupByCategory(!groupByCategory)}
                  style={{
                    padding: '0.5rem 1rem',
                    fontSize: '0.85rem',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    background: '#fff',
                    cursor: 'pointer',
                    color: '#666'
                  }}
                >
                  {groupByCategory ? 'Show All' : 'Group by Type'}
                </button>
              </div>

              {/* References List */}
              {Object.entries(groupedReferences).map(([category, refs]) => (
                <div key={category} style={{ marginBottom: '1rem' }}>
                  {groupByCategory && category !== 'all' && (
                    <h4 style={{
                      fontSize: '0.9rem',
                      color: getCategoryColor(category),
                      margin: '0 0 0.5rem 0',
                      fontWeight: '600'
                    }}>
                      {getCategoryDisplayName(category)} ({refs.length})
                    </h4>
                  )}

                  <div style={{
                    display: 'grid',
                    gap: '0.5rem'
                  }}>
                    {refs.map((ref, index) => (
                      <div
                        key={index}
                        onClick={() => handleReferenceClick(ref)}
                        style={{
                          padding: '0.75rem',
                          border: `1px solid ${getCategoryColor(ref.link_type || 'other')}40`,
                          borderLeft: `4px solid ${getCategoryColor(ref.link_type || 'other')}`,
                          borderRadius: '4px',
                          cursor: 'pointer',
                          background: '#fafafa',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = '#f0f0f0';
                          e.currentTarget.style.transform = 'translateX(4px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = '#fafafa';
                          e.currentTarget.style.transform = 'translateX(0)';
                        }}
                      >
                        <div style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}>
                          <span style={{
                            fontWeight: '600',
                            color: '#2E7D32',
                            fontSize: '0.95rem'
                          }}>
                            {formatCrossReference(ref)}
                          </span>
                          {!groupByCategory && ref.link_type && (
                            <span style={{
                              fontSize: '0.75rem',
                              padding: '0.25rem 0.5rem',
                              borderRadius: '12px',
                              background: `${getCategoryColor(ref.link_type)}20`,
                              color: getCategoryColor(ref.link_type),
                              fontWeight: '500'
                            }}>
                              {getCategoryDisplayName(ref.link_type)}
                            </span>
                          )}
                        </div>
                      </div>
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
