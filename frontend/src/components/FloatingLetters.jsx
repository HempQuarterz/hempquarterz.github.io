/**
 * FloatingLetters - Animated Hebrew/Greek letters background
 * Creates atmosphere of ancient wisdom, scholarship, and sacred text
 *
 * Performance optimizations:
 * - Reduced particles on mobile (12 vs 30)
 * - Disabled entirely when prefers-reduced-motion is set
 * - Uses CSS animations instead of JS for better performance
 */

import React, { useEffect, useState, useMemo } from 'react';
import '../styles/floating-letters.css';

// Sacred Hebrew letters (focus on divine name letters and key theological terms)
const HEBREW_LETTERS = [
  'א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ז', 'ח', 'ט', 'י',
  'כ', 'ל', 'מ', 'נ', 'ס', 'ע', 'פ', 'צ', 'ק', 'ר',
  'ש', 'ת',
  // Divine name letters (higher frequency)
  'י', 'ה', 'ו', 'ה', // YHWH
  'א', 'ל', 'ה', 'י', 'מ', // Elohim
];

// Greek letters from key theological terms
const GREEK_LETTERS = [
  'Α', 'Β', 'Γ', 'Δ', 'Ε', 'Ζ', 'Η', 'Θ', 'Ι', 'Κ',
  'Λ', 'Μ', 'Ν', 'Ξ', 'Ο', 'Π', 'Ρ', 'Σ', 'Τ', 'Υ',
  'Φ', 'Χ', 'Ψ', 'Ω',
  'α', 'β', 'γ', 'δ', 'ε', 'ζ', 'η', 'θ', 'ι', 'κ',
  'λ', 'μ', 'ν', 'ξ', 'ο', 'π', 'ρ', 'σ', 'τ', 'υ',
  'φ', 'χ', 'ψ', 'ω',
];

const FloatingLetters = ({
  count = 30,
  hebrewRatio = 0.6, // 60% Hebrew, 40% Greek
  density = 'medium' // 'low' (20), 'medium' (30), 'high' (50)
}) => {
  const [letters, setLetters] = useState([]);
  const [isMobile, setIsMobile] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  // Check for mobile and reduced motion preference
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    const checkReducedMotion = () => {
      setPrefersReducedMotion(
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
      );
    };

    checkMobile();
    checkReducedMotion();

    window.addEventListener('resize', checkMobile);
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', checkReducedMotion);

    return () => {
      window.removeEventListener('resize', checkMobile);
      motionQuery.removeEventListener('change', checkReducedMotion);
    };
  }, []);

  // Adjust count based on density and device
  const letterCount = useMemo(() => {
    // Return 0 if user prefers reduced motion
    if (prefersReducedMotion) return 0;

    // Reduce count on mobile for better performance
    const baseCount = density === 'low' ? 20 : density === 'high' ? 50 : count;
    return isMobile ? Math.min(12, Math.floor(baseCount / 2.5)) : baseCount;
  }, [density, count, isMobile, prefersReducedMotion]);

  useEffect(() => {
    // Skip if no letters needed
    if (letterCount === 0) {
      setLetters([]);
      return;
    }
    // Generate random floating letters
    const generatedLetters = Array.from({ length: letterCount }, (_, index) => {
      const isHebrew = Math.random() < hebrewRatio;
      const letterSet = isHebrew ? HEBREW_LETTERS : GREEK_LETTERS;
      const letter = letterSet[Math.floor(Math.random() * letterSet.length)];

      return {
        id: index,
        letter,
        isHebrew,
        // Random positioning
        left: Math.random() * 100, // 0-100%
        // Random animation properties
        duration: 25 + Math.random() * 30, // 25-55 seconds (very slow)
        delay: Math.random() * 20, // 0-20 second delay
        rotation: Math.random() * 30 - 15, // -15 to +15 degrees
        scale: 0.7 + Math.random() * 0.6, // 0.7-1.3
        // Random opacity range
        opacity: 0.05 + Math.random() * 0.08, // 0.05-0.13
      };
    });

    setLetters(generatedLetters);
  }, [letterCount, hebrewRatio]);

  // Don't render anything if reduced motion is preferred
  if (prefersReducedMotion || letters.length === 0) {
    return null;
  }

  return (
    <div className="floating-letters-container" aria-hidden="true">
      {letters.map((item) => (
        <div
          key={item.id}
          className={`floating-letter ${item.isHebrew ? 'hebrew' : 'greek'}`}
          style={{
            '--left-pos': `${item.left}%`,
            '--duration': `${item.duration}s`,
            '--delay': `${item.delay}s`,
            '--end-rotate': `${item.rotation}deg`,
            '--letter-scale': item.scale,
            '--letter-opacity': item.opacity,
            '--letter-font': item.isHebrew
              ? "'Noto Serif Hebrew', 'SBL Hebrew', serif"
              : "'Noto Serif', 'GFS Didot', serif",
            '--letter-color': item.isHebrew
              ? 'var(--ink-medium)'
              : 'var(--ink-light)',
            willChange: 'transform, opacity', // GPU acceleration hint
          }}
        >
          {item.letter}
        </div>
      ))}
    </div>
  );
};

export default FloatingLetters;
