/**
 * ScrollUnfurl - Homepage hero animation
 * Refactored to "Celestial Reveal" - ethereal fade in
 */

import React, { useEffect, useRef, useState } from 'react';
import '../styles/scroll-unfurl.css';

const ScrollUnfurl = ({ children, className = '' }) => {
  const scrollRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger animation on mount with slight delay
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div
      ref={scrollRef}
      className={`celestial-reveal-wrapper ${isVisible ? 'visible' : ''} ${className}`}
    >
      {children}
    </div>
  );
};

export default ScrollUnfurl;
