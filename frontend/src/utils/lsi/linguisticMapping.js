/**
 * Linguistic Mapping Layer for LSI
 * Maps detected phonemes to Hebrew, Greek, Aramaic, and Ge'ez roots
 *
 * FAITH ALIGNMENT: Educational tool for exploring linguistic connections.
 * Does not claim divine revelation - analysis is comparative linguistics.
 *
 * Architecture:
 * 1. Phoneme Dictionaries (Hebrew, Greek, Aramaic, Ge'ez)
 * 2. Similarity Matching (Levenshtein distance, phonetic algorithms)
 * 3. Strong's Concordance Integration
 * 4. Gematria/Isopsephy Calculations
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.REACT_APP_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.REACT_APP_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Hebrew Phoneme Dictionary
 * Maps Hebrew letters to phonetic sounds
 */
export const HEBREW_PHONEMES = {
  // Consonants
  'א': ['', 'a', 'e', 'i', 'o', 'u'], // Aleph - silent or vowel
  'ב': ['b', 'v'], // Bet/Vet
  'ג': ['g'], // Gimel
  'ד': ['d'], // Dalet
  'ה': ['h', ''], // He - often silent at end
  'ו': ['v', 'o', 'u'], // Vav - also serves as vowel
  'ז': ['z'], // Zayin
  'ח': ['ch', 'kh'], // Chet
  'ט': ['t'], // Tet
  'י': ['y', 'i'], // Yod - also serves as vowel
  'כ': ['k', 'kh'], // Kaf/Khaf
  'ך': ['kh'], // Final Khaf
  'ל': ['l'], // Lamed
  'מ': ['m'], // Mem
  'ם': ['m'], // Final Mem
  'נ': ['n'], // Nun
  'ן': ['n'], // Final Nun
  'ס': ['s'], // Samekh
  'ע': ['', 'a'], // Ayin - guttural, often silent
  'פ': ['p', 'f'], // Pe/Fe
  'ף': ['f'], // Final Fe
  'צ': ['ts', 'tz'], // Tsade
  'ץ': ['ts', 'tz'], // Final Tsade
  'ק': ['k', 'q'], // Qof
  'ר': ['r'], // Resh
  'ש': ['sh', 's'], // Shin/Sin
  'ת': ['t', 'th'] // Tav
};

/**
 * Greek Phoneme Dictionary
 * Maps Greek letters to phonetic sounds
 */
export const GREEK_PHONEMES = {
  // Vowels
  'α': ['a'], // Alpha
  'ε': ['e'], // Epsilon
  'η': ['e', 'ee'], // Eta
  'ι': ['i'], // Iota
  'ο': ['o'], // Omicron
  'υ': ['u', 'y'], // Upsilon
  'ω': ['o', 'oh'], // Omega

  // Consonants
  'β': ['b', 'v'], // Beta
  'γ': ['g'], // Gamma
  'δ': ['d'], // Delta
  'ζ': ['z'], // Zeta
  'θ': ['th'], // Theta
  'κ': ['k'], // Kappa
  'λ': ['l'], // Lambda
  'μ': ['m'], // Mu
  'ν': ['n'], // Nu
  'ξ': ['x', 'ks'], // Xi
  'π': ['p'], // Pi
  'ρ': ['r'], // Rho
  'σ': ['s'], // Sigma
  'ς': ['s'], // Final Sigma
  'τ': ['t'], // Tau
  'φ': ['f', 'ph'], // Phi
  'χ': ['ch', 'kh'], // Chi
  'ψ': ['ps'], // Psi

  // Diphthongs
  'αι': ['ai', 'ay'],
  'ει': ['ei', 'ee'],
  'οι': ['oi', 'oy'],
  'υι': ['ui', 'uy'],
  'αυ': ['au', 'av'],
  'ευ': ['eu', 'ev'],
  'ου': ['ou', 'oo']
};

/**
 * Common Hebrew Spiritual Roots
 * Key words with Strong's numbers for pattern matching
 */
export const HEBREW_SPIRITUAL_ROOTS = [
  {
    strongsNumber: 'H7307',
    word: 'רוּחַ',
    transliteration: 'ruach',
    phonemes: ['r', 'u', 'ach'],
    meaning: 'Spirit, Wind, Breath',
    theme: 'Holy Spirit',
    gematria: 214 // ר(200) + ו(6) + ח(8)
  },
  {
    strongsNumber: 'H3068',
    word: 'יהוה',
    transliteration: 'YHWH',
    phonemes: ['y', 'a', 'h', 'u', 'a', 'h'],
    meaning: 'The LORD (Yahuah)',
    theme: 'Divine Name',
    gematria: 26 // י(10) + ה(5) + ו(6) + ה(5)
  },
  {
    strongsNumber: 'H1288',
    word: 'בָּרַךְ',
    transliteration: 'barak',
    phonemes: ['b', 'a', 'r', 'a', 'kh'],
    meaning: 'Bless, Kneel',
    theme: 'Blessing',
    gematria: 222
  },
  {
    strongsNumber: 'H8034',
    word: 'שֵׁם',
    transliteration: 'shem',
    phonemes: ['sh', 'e', 'm'],
    meaning: 'Name',
    theme: 'Identity',
    gematria: 340
  },
  {
    strongsNumber: 'H6944',
    word: 'קֹדֶשׁ',
    transliteration: 'qodesh',
    phonemes: ['q', 'o', 'd', 'e', 'sh'],
    meaning: 'Holy, Sacred',
    theme: 'Holiness',
    gematria: 404
  },
  {
    strongsNumber: 'H8416',
    word: 'תְּהִלָּה',
    transliteration: 'tehillah',
    phonemes: ['t', 'e', 'h', 'i', 'l', 'l', 'ah'],
    meaning: 'Praise, Song of Praise',
    theme: 'Worship',
    gematria: 440
  },
  {
    strongsNumber: 'H3444',
    word: 'יְשׁוּעָה',
    transliteration: 'yeshuah',
    phonemes: ['y', 'e', 'sh', 'u', 'ah'],
    meaning: 'Salvation, Deliverance',
    theme: 'Redemption',
    gematria: 391
  },
  {
    strongsNumber: 'H2617',
    word: 'חֶסֶד',
    transliteration: 'chesed',
    phonemes: ['ch', 'e', 's', 'e', 'd'],
    meaning: 'Lovingkindness, Mercy',
    theme: 'Covenant Love',
    gematria: 72
  }
];

/**
 * Common Greek Spiritual Roots
 */
export const GREEK_SPIRITUAL_ROOTS = [
  {
    strongsNumber: 'G4151',
    word: 'πνεῦμα',
    transliteration: 'pneuma',
    phonemes: ['p', 'n', 'eu', 'ma'],
    meaning: 'Spirit, Wind, Breath',
    theme: 'Holy Spirit',
    isopsephy: 576
  },
  {
    strongsNumber: 'G26',
    word: 'ἀγάπη',
    transliteration: 'agape',
    phonemes: ['a', 'g', 'a', 'p', 'e'],
    meaning: 'Love (Divine Love)',
    theme: 'Love',
    isopsephy: 93
  },
  {
    strongsNumber: 'G5485',
    word: 'χάρις',
    transliteration: 'charis',
    phonemes: ['ch', 'a', 'r', 'i', 's'],
    meaning: 'Grace, Favor',
    theme: 'Grace',
    isopsephy: 911
  },
  {
    strongsNumber: 'G1391',
    word: 'δόξα',
    transliteration: 'doxa',
    phonemes: ['d', 'o', 'x', 'a'],
    meaning: 'Glory, Majesty',
    theme: 'Glory',
    isopsephy: 145
  },
  {
    strongsNumber: 'G1515',
    word: 'εἰρήνη',
    transliteration: 'eirene',
    phonemes: ['ei', 'r', 'e', 'n', 'e'],
    meaning: 'Peace',
    theme: 'Peace',
    isopsephy: 175
  },
  {
    strongsNumber: 'G4102',
    word: 'πίστις',
    transliteration: 'pistis',
    phonemes: ['p', 'i', 's', 't', 'i', 's'],
    meaning: 'Faith, Trust',
    theme: 'Faith',
    isopsephy: 800
  }
];

/**
 * Aramaic/Syriac Phoneme Dictionary
 * Maps Aramaic letters (Imperial/Square Script) to phonetic sounds
 * Used in Targum Onkelos, Peshitta, and Syriac Scriptures
 */
export const ARAMAIC_PHONEMES = {
  // Consonants (similar to Hebrew but with distinct pronunciation)
  'א': ['', 'a'], // Aleph
  'ב': ['b', 'v'], // Beth
  'ג': ['g'], // Gamal
  'ד': ['d'], // Dalath
  'ה': ['h'], // He
  'ו': ['w', 'o', 'u'], // Waw
  'ז': ['z'], // Zayin
  'ח': ['ḥ', 'kh'], // Heth
  'ט': ['ṭ', 't'], // Teth
  'י': ['y', 'i'], // Yodh
  'כ': ['k', 'kh'], // Kaph
  'ך': ['kh'], // Final Kaph
  'ל': ['l'], // Lamadh
  'מ': ['m'], // Mim
  'ם': ['m'], // Final Mim
  'נ': ['n'], // Nun
  'ן': ['n'], // Final Nun
  'ס': ['s'], // Semkath
  'ע': ['ʿ', 'a'], // ʿE (Ayin)
  'פ': ['p', 'f'], // Pe
  'ף': ['f'], // Final Pe
  'צ': ['ṣ', 'ts'], // Ṣadhe
  'ץ': ['ṣ', 'ts'], // Final Ṣadhe
  'ק': ['q', 'k'], // Qoph
  'ר': ['r'], // Resh
  'ש': ['sh', 's'], // Shin
  'ת': ['t', 'th'], // Taw

  // Syriac-specific letters
  'ܐ': ['', 'a'], // Syriac Alap
  'ܒ': ['b', 'v'], // Syriac Beth
  'ܓ': ['g'], // Syriac Gamal
  'ܕ': ['d'], // Syriac Dalath
  'ܗ': ['h'], // Syriac He
  'ܘ': ['w', 'o', 'u'], // Syriac Waw
  'ܙ': ['z'], // Syriac Zayn
  'ܚ': ['ḥ', 'kh'], // Syriac Heth
  'ܛ': ['ṭ', 't'], // Syriac Teth
  'ܝ': ['y', 'i'], // Syriac Yudh
  'ܟ': ['k'], // Syriac Kaph
  'ܠ': ['l'], // Syriac Lamadh
  'ܡ': ['m'], // Syriac Mim
  'ܢ': ['n'], // Syriac Nun
  'ܣ': ['s'], // Syriac Semkath
  'ܥ': ['ʿ', 'a'], // Syriac E
  'ܦ': ['p', 'f'], // Syriac Pe
  'ܨ': ['ṣ', 'ts'], // Syriac Ṣadhe
  'ܩ': ['q', 'k'], // Syriac Qoph
  'ܪ': ['r'], // Syriac Resh
  'ܫ': ['sh'], // Syriac Shin
  'ܬ': ['t', 'th'] // Syriac Taw
};

/**
 * Common Aramaic Spiritual Roots
 * Key words from Targum Onkelos and Peshitta
 */
export const ARAMAIC_SPIRITUAL_ROOTS = [
  {
    strongsNumber: 'A7308', // Aramaic equivalent to H7307
    word: 'רוּחָא',
    transliteration: 'rucha',
    phonemes: ['r', 'u', 'ch', 'a'],
    meaning: 'Spirit, Wind (Aramaic)',
    theme: 'Holy Spirit',
    scriptureReferences: ['Daniel 2:1', 'Daniel 4:8', 'Daniel 5:11'],
    gematria: 215
  },
  {
    strongsNumber: 'A426', // Aramaic for God
    word: 'אֱלָהּ',
    transliteration: 'elah',
    phonemes: ['e', 'l', 'a', 'h'],
    meaning: 'God, Elohim (Aramaic)',
    theme: 'Divine Nature',
    scriptureReferences: ['Ezra 5:1', 'Daniel 2:18', 'Daniel 6:26'],
    gematria: 36
  },
  {
    strongsNumber: 'A1247', // Aramaic for son
    word: 'בַּר',
    transliteration: 'bar',
    phonemes: ['b', 'a', 'r'],
    meaning: 'Son',
    theme: 'Sonship',
    scriptureReferences: ['Psalm 2:12 (Targum)', 'Daniel 3:25'],
    gematria: 202
  },
  {
    strongsNumber: 'A3046', // Aramaic for know
    word: 'יְדַע',
    transliteration: 'yeda',
    phonemes: ['y', 'e', 'd', 'a'],
    meaning: 'To know, perceive',
    theme: 'Knowledge',
    scriptureReferences: ['Daniel 2:8', 'Daniel 4:25'],
    gematria: 84
  },
  {
    strongsNumber: 'A6925', // Aramaic for holy
    word: 'קַדִּישׁ',
    transliteration: 'qaddish',
    phonemes: ['q', 'a', 'd', 'd', 'i', 'sh'],
    meaning: 'Holy, Sacred (Aramaic)',
    theme: 'Holiness',
    scriptureReferences: ['Daniel 4:13', 'Daniel 4:17', 'Daniel 5:11'],
    gematria: 414
  },
  {
    strongsNumber: 'A8120', // Aramaic for heaven/sky
    word: 'שְׁמַיָּא',
    transliteration: 'shemaya',
    phonemes: ['sh', 'e', 'm', 'a', 'y', 'a'],
    meaning: 'Heaven, Sky',
    theme: 'Heavenly Realm',
    scriptureReferences: ['Daniel 2:18', 'Daniel 4:26', 'Ezra 5:11'],
    gematria: 391
  },
  {
    strongsNumber: 'A7761', // Aramaic for word
    word: 'מִלָּה',
    transliteration: 'millah',
    phonemes: ['m', 'i', 'l', 'l', 'a', 'h'],
    meaning: 'Word, Matter',
    theme: 'Divine Word',
    scriptureReferences: ['Daniel 2:5', 'Daniel 4:33'],
    gematria: 75
  },
  {
    strongsNumber: 'A2417', // Aramaic for life
    word: 'חַיִּין',
    transliteration: 'chayin',
    phonemes: ['ch', 'a', 'y', 'i', 'n'],
    meaning: 'Life, Living',
    theme: 'Life',
    scriptureReferences: ['Daniel 2:30', 'Daniel 4:34'],
    gematria: 78
  }
];

/**
 * Phonetic Similarity Matcher
 * Uses Levenshtein distance and phonetic comparison
 */
export class PhoneticMatcher {
  /**
   * Calculate Levenshtein distance between two strings
   *
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Edit distance
   */
  static levenshteinDistance(str1, str2) {
    const len1 = str1.length;
    const len2 = str2.length;
    const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(0));

    for (let i = 0; i <= len1; i++) matrix[i][0] = i;
    for (let j = 0; j <= len2; j++) matrix[0][j] = j;

    for (let i = 1; i <= len1; i++) {
      for (let j = 1; j <= len2; j++) {
        const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,      // Deletion
          matrix[i][j - 1] + 1,      // Insertion
          matrix[i - 1][j - 1] + cost // Substitution
        );
      }
    }

    return matrix[len1][len2];
  }

  /**
   * Calculate phonetic similarity (0-1 score)
   *
   * @param {string} phoneme1 - First phoneme sequence
   * @param {string} phoneme2 - Second phoneme sequence
   * @returns {number} Similarity score (0-1)
   */
  static calculateSimilarity(phoneme1, phoneme2) {
    const p1 = phoneme1.toLowerCase().replace(/[^a-z]/g, '');
    const p2 = phoneme2.toLowerCase().replace(/[^a-z]/g, '');

    if (p1 === p2) return 1.0; // Perfect match

    const maxLen = Math.max(p1.length, p2.length);
    if (maxLen === 0) return 0.0;

    const distance = this.levenshteinDistance(p1, p2);
    const similarity = 1 - (distance / maxLen);

    return Math.max(0, Math.min(1, similarity)); // Clamp to [0, 1]
  }

  /**
   * Find phonetic matches in spiritual roots
   *
   * @param {string} phonemeSequence - Detected phoneme sequence
   * @param {Array<Object>} roots - Array of spiritual roots
   * @param {number} threshold - Minimum similarity threshold (0-1)
   * @returns {Array<Object>} Matching roots with similarity scores
   */
  static findMatches(phonemeSequence, roots, threshold = 0.6) {
    const matches = [];

    for (const root of roots) {
      // Join phonemes to create comparable string
      const rootPhonemes = root.phonemes.join('');
      const similarity = this.calculateSimilarity(phonemeSequence, rootPhonemes);

      if (similarity >= threshold) {
        matches.push({
          ...root,
          similarity: Math.round(similarity * 10000) / 10000, // 4 decimal places
          phoneticMatch: phonemeSequence
        });
      }
    }

    // Sort by similarity (highest first)
    return matches.sort((a, b) => b.similarity - a.similarity);
  }
}

/**
 * Linguistic Echo Detector
 * Main service for detecting ancient language connections
 */
export class LinguisticEchoDetector {
  constructor() {
    this.hebrewRoots = HEBREW_SPIRITUAL_ROOTS;
    this.greekRoots = GREEK_SPIRITUAL_ROOTS;
    this.aramaicRoots = ARAMAIC_SPIRITUAL_ROOTS;
  }

  /**
   * Detect linguistic echoes from phoneme sequence
   *
   * @param {string} phonemeSequence - Detected phoneme sequence
   * @param {number} threshold - Similarity threshold (default: 0.6)
   * @returns {Promise<Array<Object>>} Detected echoes
   */
  async detectEchoes(phonemeSequence, threshold = 0.6) {
    try {
      console.log(`🔍 Detecting linguistic echoes for: "${phonemeSequence}"`);

      const echoes = [];

      // Search Hebrew roots
      const hebrewMatches = PhoneticMatcher.findMatches(
        phonemeSequence,
        this.hebrewRoots,
        threshold
      );

      for (const match of hebrewMatches) {
        const echo = await this.enrichWithStrongsData(match, 'hebrew');
        if (echo) echoes.push(echo);
      }

      // Search Greek roots
      const greekMatches = PhoneticMatcher.findMatches(
        phonemeSequence,
        this.greekRoots,
        threshold
      );

      for (const match of greekMatches) {
        const echo = await this.enrichWithStrongsData(match, 'greek');
        if (echo) echoes.push(echo);
      }

      // Search Aramaic roots
      const aramaicMatches = PhoneticMatcher.findMatches(
        phonemeSequence,
        this.aramaicRoots,
        threshold
      );

      for (const match of aramaicMatches) {
        const echo = await this.enrichWithStrongsData(match, 'aramaic');
        if (echo) echoes.push(echo);
      }

      console.log(`✅ Found ${echoes.length} linguistic echoes (Hebrew: ${hebrewMatches.length}, Greek: ${greekMatches.length}, Aramaic: ${aramaicMatches.length})`);
      return echoes;
    } catch (error) {
      console.error('❌ Echo detection error:', error);
      return [];
    }
  }

  /**
   * Enrich match with Strong's Concordance data from database
   *
   * @param {Object} match - Phonetic match
   * @param {string} language - 'hebrew', 'greek', or 'aramaic'
   * @returns {Promise<Object>} Enriched echo data
   */
  async enrichWithStrongsData(match, language) {
    try {
      // Query Strong's lexicon from database
      const { data, error } = await supabase
        .from('strongs_lexicon')
        .select('*')
        .eq('strongs_number', match.strongsNumber)
        .single();

      if (error || !data) {
        console.warn(`⚠️ Strong's data not found for ${match.strongsNumber}`);
        return {
          ...match,
          sourceLanguage: language,
          scriptureReferences: []
        };
      }

      // Get scripture references where this word appears
      const references = await this.getScriptureReferences(match.strongsNumber);

      return {
        ...match,
        sourceLanguage: language,
        primaryMeaning: data.definition || match.meaning,
        scriptureReferences: references.slice(0, 5), // Top 5 references
        pronunciation: data.pronunciation,
        derivation: data.derivation
      };
    } catch (error) {
      console.error(`❌ Error enriching ${match.strongsNumber}:`, error);
      return null;
    }
  }

  /**
   * Get scripture references for a Strong's number
   *
   * @param {string} strongsNumber - Strong's number (e.g., 'H7307')
   * @returns {Promise<Array<string>>} Scripture references
   */
  async getScriptureReferences(strongsNumber) {
    try {
      // Query verses table for morphology containing this Strong's number
      const { data, error } = await supabase
        .from('verses')
        .select('book, chapter, verse, morphology')
        .limit(10);

      if (error || !data) {
        return [];
      }

      const references = [];

      for (const row of data) {
        if (row.morphology && typeof row.morphology === 'object') {
          const morphArray = Array.isArray(row.morphology) ? row.morphology : [row.morphology];

          for (const morph of morphArray) {
            if (morph.strongsNumber === strongsNumber || morph.strongs === strongsNumber) {
              references.push(`${row.book} ${row.chapter}:${row.verse}`);
              break;
            }
          }
        }

        if (references.length >= 5) break;
      }

      return references;
    } catch (error) {
      console.error('❌ Error fetching scripture references:', error);
      return [];
    }
  }

  /**
   * Calculate gematria for Hebrew word
   *
   * @param {string} hebrewWord - Hebrew text
   * @returns {number} Gematria value
   */
  calculateGematria(hebrewWord) {
    const gematriaValues = {
      'א': 1, 'ב': 2, 'ג': 3, 'ד': 4, 'ה': 5, 'ו': 6, 'ז': 7, 'ח': 8, 'ט': 9,
      'י': 10, 'כ': 20, 'ך': 20, 'ל': 30, 'מ': 40, 'ם': 40, 'נ': 50, 'ן': 50,
      'ס': 60, 'ע': 70, 'פ': 80, 'ף': 80, 'צ': 90, 'ץ': 90, 'ק': 100,
      'ר': 200, 'ש': 300, 'ת': 400
    };

    let sum = 0;
    for (const char of hebrewWord) {
      sum += gematriaValues[char] || 0;
    }

    return sum;
  }

  /**
   * Calculate isopsephy for Greek word
   *
   * @param {string} greekWord - Greek text
   * @returns {number} Isopsephy value
   */
  calculateIsopsephy(greekWord) {
    const isopsephyValues = {
      'α': 1, 'β': 2, 'γ': 3, 'δ': 4, 'ε': 5, 'ϛ': 6, 'ζ': 7, 'η': 8, 'θ': 9,
      'ι': 10, 'κ': 20, 'λ': 30, 'μ': 40, 'ν': 50, 'ξ': 60, 'ο': 70, 'π': 80,
      'ϙ': 90, 'ρ': 100, 'σ': 200, 'ς': 200, 'τ': 300, 'υ': 400, 'φ': 500,
      'χ': 600, 'ψ': 700, 'ω': 800, 'ϡ': 900
    };

    let sum = 0;
    for (const char of greekWord.toLowerCase()) {
      sum += isopsephyValues[char] || 0;
    }

    return sum;
  }
}

export default {
  HEBREW_PHONEMES,
  GREEK_PHONEMES,
  HEBREW_SPIRITUAL_ROOTS,
  GREEK_SPIRITUAL_ROOTS,
  PhoneticMatcher,
  LinguisticEchoDetector
};
