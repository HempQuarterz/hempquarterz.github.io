/**
 * InkRipple - Interactive ink ripple effect on click/tap
 * Creates spreading ink stain effect like quill on parchment
 */

import React, { useState, useCallback } from 'react';
import '../styles/ink-ripple.css';

const InkRipple = () => {
  const [ripples, setRipples] = useState([]);

  const createRipple = useCallback((event) => {
    // Get click/tap position
    const x = event.clientX;
    const y = event.clientY;

    // Create unique ripple ID
    const rippleId = Date.now() + Math.random();

    // Add new ripple
    const newRipple = {
      id: rippleId,
      x,
      y,
    };

    setRipples((prev) => [...prev, newRipple]);

    // Remove ripple after animation completes (800ms)
    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== rippleId));
    }, 800);
  }, []);

  // Attach global click listener
  React.useEffect(() => {
    // Only create ripples on parchment background clicks
    const handleClick = (e) => {
      // Don't create ripples on interactive elements
      const isInteractive =
        e.target.tagName === 'BUTTON' ||
        e.target.tagName === 'A' ||
        e.target.tagName === 'INPUT' ||
        e.target.closest('button') ||
        e.target.closest('a') ||
        e.target.closest('input') ||
        e.target.closest('select') ||
        e.target.closest('textarea');

      if (!isInteractive) {
        createRipple(e);
      }
    };

    document.addEventListener('click', handleClick);

    return () => {
      document.removeEventListener('click', handleClick);
    };
  }, [createRipple]);

  return (
    <div className="ink-ripple-container" aria-hidden="true">
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="ink-ripple"
          style={{
            left: ripple.x,
            top: ripple.y,
          }}
        />
      ))}
    </div>
  );
};

export default InkRipple;
