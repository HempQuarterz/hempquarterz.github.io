/**
 * ScrollUnfurl - Homepage hero animation
 * Ancient scroll unfurling to reveal content
 */

import React, { useEffect, useRef, useState } from 'react';
import '../styles/scroll-unfurl.css';

const ScrollUnfurl = ({ children, className = '' }) => {
  const scrollRef = useRef(null);
  const [isUnfurled, setIsUnfurled] = useState(false);

  useEffect(() => {
    // Trigger unfurl animation on mount
    const timer = setTimeout(() => {
      setIsUnfurled(true);
    }, 300); // Small delay for dramatic effect

    return () => clearTimeout(timer);
  }, []);

  // Intersection Observer for scroll-triggered unfurling
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isUnfurled) {
            setIsUnfurled(true);
          }
        });
      },
      {
        threshold: 0.2, // Trigger when 20% visible
      }
    );

    if (scrollRef.current) {
      observer.observe(scrollRef.current);
    }

    return () => {
      if (scrollRef.current) {
        observer.unobserve(scrollRef.current);
      }
    };
  }, [isUnfurled]);

  return (
    <div
      ref={scrollRef}
      className={`scroll-unfurl ${isUnfurled ? 'unfurled' : ''} ${className}`}
    >
      {/* Top scroll rod */}
      <div className="scroll-rod scroll-rod-top" aria-hidden="true">
        <div className="rod-cap rod-cap-left"></div>
        <div className="rod-shaft"></div>
        <div className="rod-cap rod-cap-right"></div>
      </div>

      {/* Parchment content */}
      <div className="scroll-parchment">
        <div className="parchment-edge parchment-edge-top" aria-hidden="true"></div>
        <div className="scroll-content">{children}</div>
        <div className="parchment-edge parchment-edge-bottom" aria-hidden="true"></div>
      </div>

      {/* Bottom scroll rod */}
      <div className="scroll-rod scroll-rod-bottom" aria-hidden="true">
        <div className="rod-cap rod-cap-left"></div>
        <div className="rod-shaft"></div>
        <div className="rod-cap rod-cap-right"></div>
      </div>
    </div>
  );
};

export default ScrollUnfurl;
