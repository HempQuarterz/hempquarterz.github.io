/**
 * ManuscriptSkeleton Component
 * Loading skeleton for manuscript viewer
 * Provides visual feedback while data is loading
 */

import React from 'react';
import '../styles/skeleton.css';

const ManuscriptSkeleton = () => {
  return (
    <div className="manuscript-viewer">
      {/* Header Skeleton */}
      <div className="manuscript-header">
        <div className="skeleton skeleton-title"></div>
        <div className="skeleton skeleton-subtitle"></div>
      </div>

      {/* View Mode Toggle Skeleton */}
      <div className="view-mode-toggle" style={{ textAlign: 'center', marginBottom: '1rem' }}>
        <div className="skeleton skeleton-button" style={{ display: 'inline-block', marginRight: '0.5rem' }}></div>
        <div className="skeleton skeleton-button" style={{ display: 'inline-block' }}></div>
      </div>

      {/* Restoration Toggle Skeleton */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <div className="skeleton skeleton-button" style={{ display: 'inline-block' }}></div>
      </div>

      {/* Manuscript Selector Pills Skeleton */}
      <div className="manuscript-selector" style={{ marginBottom: '2rem' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton skeleton-pill"></div>
        ))}
      </div>

      {/* Manuscript Card Skeleton */}
      <div className="manuscript-card-skeleton">
        <div className="skeleton skeleton-card-header"></div>
        <div className="skeleton skeleton-text-line"></div>
        <div className="skeleton skeleton-text-line"></div>
        <div className="skeleton skeleton-text-line" style={{ width: '80%' }}></div>
      </div>

      {/* Carousel Indicators Skeleton */}
      <div className="carousel-indicators" style={{ marginTop: '1.5rem' }}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="skeleton skeleton-dot"></div>
        ))}
      </div>
    </div>
  );
};

export default ManuscriptSkeleton;
