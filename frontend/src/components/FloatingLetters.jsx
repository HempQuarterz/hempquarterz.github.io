/**
 * FloatingLetters - Animated Hebrew/Greek letters background
 * Creates atmosphere of ancient wisdom, scholarship, and sacred text
 */

import React, { useEffect, useState } from 'react';
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

  // Adjust count based on density
  const letterCount = density === 'low' ? 20 : density === 'high' ? 50 : count;

  useEffect(() => {
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
          }}
        >
          {item.letter}
        </div>
      ))}
    </div>
  );
};

export default FloatingLetters;
