/**
 * CrossReferenceBadge Component
 * Displays an inline badge showing the number of cross-references for a verse
 * Part of Phase 1: Tier 2 implementation
 */

import React, { useState } from 'react';
import { formatCrossReference } from '../api/crossReferences';

const CrossReferenceBadge = ({ count, references, onBadgeClick }) => {
  const [showTooltip, setShowTooltip] = useState(false);

  if (count === 0) return null;

  // Get top 3 references for tooltip preview
  const topReferences = references?.slice(0, 3) || [];

  const handleClick = (e) => {
    e.stopPropagation();
    if (onBadgeClick) {
      onBadgeClick();
    }
  };

  return (
    <span
      style={{
        position: 'relative',
        display: 'inline-block',
        marginLeft: '0.25rem'
      }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span
        onClick={handleClick}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '0.7rem',
          fontWeight: '600',
          padding: '0.15rem 0.4rem',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #2E7D32 0%, #388E3C 100%)',
          color: '#fff',
          cursor: 'pointer',
          userSelect: 'none',
          transition: 'all 0.2s ease',
          boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          fontFamily: "'Inter', sans-serif"
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.2)';
        }}
        role="button"
        aria-label={`${count} cross-references available`}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
      >
        🔗{count}
      </span>

      {/* Tooltip */}
      {showTooltip && topReferences.length > 0 && (
        <div
          style={{
            position: 'absolute',
            bottom: '100%',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: '0.5rem',
            padding: '0.75rem',
            background: '#fff',
            border: '1px solid #ddd',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            minWidth: '200px',
            maxWidth: '300px',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {/* Tooltip arrow */}
          <div
            style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              width: 0,
              height: 0,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderTop: '6px solid #fff'
            }}
          />

          <div style={{ fontSize: '0.85rem', color: '#333' }}>
            <div style={{ fontWeight: '600', marginBottom: '0.5rem', color: '#2E7D32' }}>
              {count} Cross-Reference{count !== 1 ? 's' : ''}
            </div>
            <div style={{ fontSize: '0.8rem', color: '#666' }}>
              {topReferences.map((ref, index) => (
                <div key={index} style={{ marginBottom: '0.25rem' }}>
                  • {formatCrossReference(ref)}
                </div>
              ))}
              {count > 3 && (
                <div style={{ marginTop: '0.5rem', fontStyle: 'italic', color: '#888' }}>
                  +{count - 3} more...
                </div>
              )}
            </div>
            <div style={{
              marginTop: '0.5rem',
              paddingTop: '0.5rem',
              borderTop: '1px solid #e0e0e0',
              fontSize: '0.75rem',
              color: '#2E7D32',
              fontWeight: '500'
            }}>
              Click to view all →
            </div>
          </div>
        </div>
      )}
    </span>
  );
};

export default CrossReferenceBadge;
