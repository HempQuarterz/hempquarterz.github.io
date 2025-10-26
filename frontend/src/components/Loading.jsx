import React from 'react';

const Loading = ({ type = 'default' }) => {
  if (type === 'skeleton') {
    return (
      <div className="container">
        <div className="skeleton skeleton-title"></div>
        <div className="grid grid-cols-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="card">
              <div className="skeleton skeleton-text"></div>
              <div className="skeleton skeleton-text" style={{ width: '80%' }}></div>
              <div className="skeleton skeleton-text" style={{ width: '60%' }}></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (type === 'verse') {
    return (
      <div className="verse-card">
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text"></div>
        <div className="skeleton skeleton-text" style={{ width: '70%' }}></div>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '200px',
      width: '100%'
    }}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--text-secondary)' }}>Loading...</p>
      </div>
    </div>
  );
};

export default Loading;