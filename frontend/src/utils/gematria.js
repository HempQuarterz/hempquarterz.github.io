/**
 * Gematria Utility Module
 * Provides Hebrew and Greek gematria calculations
 *
 * FAITH ALIGNMENT: This module provides linguistic pattern observation only.
 * All calculations are study aids, not sources of revelation or prophecy.
 * "AI may measure patterns, but only Yah can interpret meaning."
 */

/**
 * Strip Hebrew diacritics (niqqud and cantillation marks)
 * Preserves base letters for calculation while maintaining RTL display
 */
const stripHebrewDiacritics = (str) => {
  return str.normalize('NFC').replace(
    /[\u0591-\u05BD\u05BF\u05C1\u05C2\u05C4\u05C5\u05C7]/g,
    ''
  );
};

/**
 * Strip Greek diacritics (accents, breathing marks)
 */
const stripGreekDiacritics = (str) => {
  return str.normalize('NFD').replace(
    /[\u0300-\u036F]/g,
    ''
  ).normalize('NFC');
};

/**
 * Final form to normal form mapping (Hebrew)
 * Used for standard value calculation
 */
const finalToNormal = {
  'ך': 'כ', // Kaf sofit → Kaf
  'ם': 'מ', // Mem sofit → Mem
  'ן': 'נ', // Nun sofit → Nun
  'ף': 'פ', // Pe sofit → Pe
  'ץ': 'צ'  // Tzadi sofit → Tzadi
};

/**
 * Normal form to final form mapping (Hebrew)
 * Reserved for future use in text normalization
 */
// eslint-disable-next-line no-unused-vars
const normalToFinal = {
  'כ': 'ך',
  'מ': 'ם',
  'נ': 'ן',
  'פ': 'ף',
  'צ': 'ץ'
};

/**
 * Hebrew letter values (Standard/Mispar Hechrechi system)
 * Aleph = 1 through Tav = 400
 */
const hebrewValueStandard = {
  'א': 1,   // Aleph
  'ב': 2,   // Bet
  'ג': 3,   // Gimel
  'ד': 4,   // Dalet
  'ה': 5,   // He
  'ו': 6,   // Vav
  'ז': 7,   // Zayin
  'ח': 8,   // Het
  'ט': 9,   // Tet
  'י': 10,  // Yod
  'כ': 20,  // Kaf
  'ל': 30,  // Lamed
  'מ': 40,  // Mem
  'נ': 50,  // Nun
  'ס': 60,  // Samekh
  'ע': 70,  // Ayin
  'פ': 80,  // Pe
  'צ': 90,  // Tzadi
  'ק': 100, // Qof
  'ר': 200, // Resh
  'ש': 300, // Shin
  'ת': 400  // Tav
};

/**
 * Hebrew final letter values (Gadol system)
 * Final forms have extended values
 */
const hebrewValueFinal = {
  'ך': 500, // Kaf sofit
  'ם': 600, // Mem sofit
  'ן': 700, // Nun sofit
  'ף': 800, // Pe sofit
  'ץ': 900  // Tzadi sofit
};

/**
 * Greek letter values (Isopsephy system)
 * Alpha = 1 through Omega = 800
 */
const greekValueStandard = {
  'Α': 1, 'α': 1,     // Alpha
  'Β': 2, 'β': 2,     // Beta
  'Γ': 3, 'γ': 3,     // Gamma
  'Δ': 4, 'δ': 4,     // Delta
  'Ε': 5, 'ε': 5,     // Epsilon
  'Ϝ': 6, 'ϝ': 6,     // Digamma (archaic)
  'Ζ': 7, 'ζ': 7,     // Zeta
  'Η': 8, 'η': 8,     // Eta
  'Θ': 9, 'θ': 9,     // Theta
  'Ι': 10, 'ι': 10,   // Iota
  'Κ': 20, 'κ': 20,   // Kappa
  'Λ': 30, 'λ': 30,   // Lambda
  'Μ': 40, 'μ': 40,   // Mu
  'Ν': 50, 'ν': 50,   // Nu
  'Ξ': 60, 'ξ': 60,   // Xi
  'Ο': 70, 'ο': 70,   // Omicron
  'Π': 80, 'π': 80,   // Pi
  'Ϙ': 90, 'ϙ': 90,   // Koppa (archaic)
  'Ρ': 100, 'ρ': 100, // Rho
  'Σ': 200, 'σ': 200, 'ς': 200, // Sigma
  'Τ': 300, 'τ': 300, // Tau
  'Υ': 400, 'υ': 400, // Upsilon
  'Φ': 500, 'φ': 500, // Phi
  'Χ': 600, 'χ': 600, // Chi
  'Ψ': 700, 'ψ': 700, // Psi
  'Ω': 800, 'ω': 800  // Omega
};

/**
 * Katan (reduced) value calculation
 * Reduces any number to 1-9 range
 * @param {number} n - Input number
 * @returns {number} Reduced value (1-9)
 */
const calculateKatan = (n) => {
  return ((n - 1) % 9) + 1;
};

/**
 * Normalize Hebrew text for calculation
 * Strips diacritics and punctuation, keeps only Hebrew letters
 * @param {string} input - Raw Hebrew text
 * @returns {string} Normalized text
 */
export const normalizeHebrew = (input) => {
  let str = stripHebrewDiacritics(input);
  // Keep only Hebrew letters (U+0590 to U+05FF range)
  str = str.replace(/[^\u0590-\u05FF]/g, '');
  return str;
};

/**
 * Normalize Greek text for calculation
 * Strips diacritics, keeps only Greek letters
 * @param {string} input - Raw Greek text
 * @returns {string} Normalized text
 */
export const normalizeGreek = (input) => {
  let str = stripGreekDiacritics(input);
  // Keep only Greek letters (U+0370 to U+03FF range)
  str = str.replace(/[^\u0370-\u03FF]/g, '');
  return str;
};

/**
 * Calculate Hebrew gematria value
 * @param {string} input - Hebrew text
 * @param {string} system - 'standard', 'katan', or 'gadol'
 * @returns {number} Calculated gematria value
 */
export const calculateHebrewGematria = (input, system = 'standard') => {
  const normalized = normalizeHebrew(input);
  let sum = 0;

  for (const char of normalized) {
    // For Gadol system, use final letter values when present
    if (system === 'gadol' && hebrewValueFinal[char] != null) {
      sum += hebrewValueFinal[char];
      continue;
    }

    // Get standard value (convert final forms to normal first)
    const normalChar = finalToNormal[char] || char;
    const value = hebrewValueStandard[normalChar] || 0;
    sum += value;
  }

  // For Katan system, reduce the sum
  return system === 'katan' ? calculateKatan(sum) : sum;
};

/**
 * Calculate Greek isopsephy value
 * @param {string} input - Greek text
 * @param {string} system - 'standard' or 'katan'
 * @returns {number} Calculated isopsephy value
 */
export const calculateGreekGematria = (input, system = 'standard') => {
  const normalized = normalizeGreek(input);
  let sum = 0;

  for (const char of normalized) {
    const value = greekValueStandard[char] || 0;
    sum += value;
  }

  return system === 'katan' ? calculateKatan(sum) : sum;
};

/**
 * Calculate gematria for any language
 * Auto-detects language and applies appropriate system
 * @param {string} input - Text to calculate
 * @param {string} lang - Language: 'hebrew', 'greek', or 'auto'
 * @param {string} system - Calculation system: 'standard', 'katan', 'gadol'
 * @returns {Object} Result with value and metadata
 */
export const calculateGematria = (input, lang = 'auto', system = 'standard') => {
  if (!input || input.trim().length === 0) {
    return {
      value: 0,
      language: null,
      system,
      normalized: '',
      original: input
    };
  }

  // Auto-detect language if needed
  let detectedLang = lang;
  if (lang === 'auto') {
    // Check for Hebrew characters (U+0590-U+05FF)
    if (/[\u0590-\u05FF]/.test(input)) {
      detectedLang = 'hebrew';
    }
    // Check for Greek characters (U+0370-U+03FF)
    else if (/[\u0370-\u03FF]/.test(input)) {
      detectedLang = 'greek';
    }
    else {
      // Default to Hebrew if ambiguous
      detectedLang = 'hebrew';
    }
  }

  let value, normalized;

  if (detectedLang === 'hebrew') {
    normalized = normalizeHebrew(input);
    value = calculateHebrewGematria(input, system);
  } else if (detectedLang === 'greek') {
    normalized = normalizeGreek(input);
    value = calculateGreekGematria(input, system);
  } else {
    return {
      value: 0,
      language: null,
      system,
      normalized: '',
      original: input,
      error: 'Unsupported language'
    };
  }

  return {
    value,
    language: detectedLang,
    system,
    normalized,
    original: input
  };
};

/**
 * Get letter-by-letter breakdown of gematria calculation
 * Useful for educational display
 * @param {string} input - Text to analyze
 * @param {string} lang - Language: 'hebrew' or 'greek'
 * @param {string} system - Calculation system
 * @returns {Array} Array of {char, value, name} objects
 */
export const getGematriaBreakdown = (input, lang = 'hebrew', system = 'standard') => {
  const breakdown = [];
  const normalized = lang === 'hebrew' ? normalizeHebrew(input) : normalizeGreek(input);

  for (const char of normalized) {
    let value = 0;
    let name = char;

    if (lang === 'hebrew') {
      if (system === 'gadol' && hebrewValueFinal[char] != null) {
        value = hebrewValueFinal[char];
        name = `${char} (sofit)`;
      } else {
        const normalChar = finalToNormal[char] || char;
        value = hebrewValueStandard[normalChar] || 0;
      }
    } else if (lang === 'greek') {
      value = greekValueStandard[char] || 0;
    }

    if (system === 'katan' && value > 0) {
      value = calculateKatan(value);
    }

    breakdown.push({
      char,
      value,
      name
    });
  }

  return breakdown;
};

/**
 * System names and descriptions
 */
export const GEMATRIA_SYSTEMS = {
  standard: {
    name: 'Standard (Mispar Hechrechi)',
    description: 'Traditional gematria with Aleph=1 through Tav=400',
    hebrew: true,
    greek: true
  },
  katan: {
    name: 'Katan (Reduced)',
    description: 'Values reduced to 1-9 range',
    hebrew: true,
    greek: true
  },
  gadol: {
    name: 'Gadol (Final Letters)',
    description: 'Final letters use extended values (500-900)',
    hebrew: true,
    greek: false
  }
};

/**
 * Notable gematria values from Scripture
 * These are linguistically observed patterns, not mystical claims
 */
export const NOTABLE_VALUES = {
  1: { name: 'Echad', meaning: 'One, Unity', hebrew: 'אחד', reference: 'Deuteronomy 6:4' },
  3: { name: 'Gimel', meaning: 'Third letter, Camel', hebrew: 'ג' },
  7: { name: 'Sheva', meaning: 'Seven, Completion', hebrew: 'שבע', reference: 'Genesis 2:2' },
  8: { name: 'Shmoneh', meaning: 'Eight, New Beginning', hebrew: 'שמנה' },
  10: { name: 'Yod', meaning: 'Hand, Tenth letter', hebrew: 'י' },
  12: { name: 'Tribes', meaning: 'Twelve Tribes of Israel', reference: 'Genesis 49' },
  13: { name: 'Echad', meaning: 'One (numerical)', hebrew: 'אחד' },
  18: { name: 'Chai', meaning: 'Life, Living', hebrew: 'חי', reference: 'Leviticus 18:5' },
  26: { name: 'YHWH', meaning: 'The Name (יהוה)', hebrew: 'יהוה', reference: 'Exodus 3:14' },
  40: { name: 'Arbaim', meaning: 'Testing, Trial', hebrew: 'ארבעים', reference: 'Exodus 24:18' },
  50: { name: 'Jubilee', meaning: 'Pentecost, Release', reference: 'Leviticus 25:10' },
  70: { name: 'Nations', meaning: 'Seventy Nations', reference: 'Genesis 10' },
  120: { name: 'Moses', meaning: 'Full life span', reference: 'Deuteronomy 34:7' },
  153: { name: 'Fish', meaning: 'Miraculous catch', reference: 'John 21:11' },
  666: { name: 'Number of Man', meaning: 'Imperfection', reference: 'Revelation 13:18' },
  777: { name: 'Completion', meaning: 'Divine perfection' },
  888: { name: 'Jesus (Greek)', meaning: 'Ἰησοῦς in isopsephy', reference: 'Matthew 1:21' }
};

const gematriaUtils = {
  calculateGematria,
  calculateHebrewGematria,
  calculateGreekGematria,
  getGematriaBreakdown,
  normalizeHebrew,
  normalizeGreek,
  GEMATRIA_SYSTEMS,
  NOTABLE_VALUES
};

export default gematriaUtils;
