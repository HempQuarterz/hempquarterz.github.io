/**
 * AI Pattern Recognition Service for LSI
 * Analyzes prayer audio for phonetic patterns, acoustic features, and rhythmic structures
 *
 * FAITH ALIGNMENT: Pattern detection for personal spiritual reflection only.
 * No claims of divine interpretation - analysis is algorithmic.
 *
 * Architecture:
 * 1. Acoustic Analysis (Web Audio API) - Real-time frequency, intensity, tempo
 * 2. Phoneme Detection (Deepgram API) - Speech-to-phoneme transcription
 * 3. Pattern Classification - Identify repetitive, flowing, staccato, crescendo patterns
 */

/**
 * Acoustic Feature Extractor
 * Uses Web Audio API to extract real-time audio characteristics
 */
export class AcousticAnalyzer {
  constructor(audioContext, analyserNode) {
    this.audioContext = audioContext;
    this.analyser = analyserNode;
    this.analyser.fftSize = 2048;
    this.analyser.smoothingTimeConstant = 0.8;

    this.bufferLength = this.analyser.frequencyBinCount;
    this.timeDomainData = new Uint8Array(this.bufferLength);
    this.frequencyData = new Uint8Array(this.bufferLength);

    // Pattern tracking
    this.patternHistory = [];
    this.beatHistory = [];
    this.lastBeatTime = 0;
  }

  /**
   * Extract acoustic features at a specific timestamp
   *
   * @param {number} timestamp - Milliseconds from recording start
   * @returns {Object} Acoustic features
   */
  extractFeatures(timestamp) {
    // Get time domain data (waveform)
    this.analyser.getByteTimeDomainData(this.timeDomainData);

    // Get frequency data (spectrum)
    this.analyser.getByteFrequencyData(this.frequencyData);

    // Calculate fundamental frequency (pitch)
    const fundamentalFrequency = this.calculateFundamentalFrequency();

    // Calculate intensity (volume/power)
    const intensity = this.calculateIntensity();

    // Detect tempo/rhythm
    const tempo = this.detectTempo(timestamp);

    // Detect pattern type
    const patternType = this.classifyPattern();

    return {
      timestamp,
      fundamentalFrequency,
      intensity,
      tempo,
      patternType,
      spectralCentroid: this.calculateSpectralCentroid(),
      zeroCrossingRate: this.calculateZeroCrossingRate()
    };
  }

  /**
   * Calculate fundamental frequency (pitch) using autocorrelation
   *
   * @returns {number} Frequency in Hz
   */
  calculateFundamentalFrequency() {
    const sampleRate = this.audioContext.sampleRate;
    const bufferSize = this.timeDomainData.length;

    // Autocorrelation method
    let maxCorrelation = 0;
    let maxLag = 0;

    // Search for period in range 50Hz - 500Hz (typical human voice)
    const minLag = Math.floor(sampleRate / 500); // 500 Hz
    const maxLagSearch = Math.floor(sampleRate / 50); // 50 Hz

    for (let lag = minLag; lag < maxLagSearch && lag < bufferSize / 2; lag++) {
      let correlation = 0;
      for (let i = 0; i < bufferSize - lag; i++) {
        const val1 = (this.timeDomainData[i] - 128) / 128;
        const val2 = (this.timeDomainData[i + lag] - 128) / 128;
        correlation += val1 * val2;
      }

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        maxLag = lag;
      }
    }

    // Convert lag to frequency
    const frequency = maxLag > 0 ? sampleRate / maxLag : 0;

    // Return frequency rounded to 2 decimal places
    return Math.round(frequency * 100) / 100;
  }

  /**
   * Calculate intensity (RMS power) in dB
   *
   * @returns {number} Intensity in decibels
   */
  calculateIntensity() {
    let sum = 0;
    for (let i = 0; i < this.timeDomainData.length; i++) {
      const normalized = (this.timeDomainData[i] - 128) / 128;
      sum += normalized * normalized;
    }

    const rms = Math.sqrt(sum / this.timeDomainData.length);

    // Convert to decibels (reference: 1.0 = 0 dB)
    const db = 20 * Math.log10(rms + 1e-10); // Add small value to avoid log(0)

    return Math.round(db * 100) / 100;
  }

  /**
   * Detect tempo using beat detection
   *
   * @param {number} timestamp - Current timestamp in ms
   * @returns {number} Estimated BPM
   */
  detectTempo(timestamp) {
    // Simple beat detection based on energy peaks
    const energy = this.calculateIntensity();

    // Detect beat if energy exceeds threshold and enough time has passed
    const minBeatInterval = 200; // Minimum 200ms between beats (max 300 BPM)
    const timeSinceLastBeat = timestamp - this.lastBeatTime;

    if (energy > -20 && timeSinceLastBeat > minBeatInterval) {
      this.beatHistory.push(timestamp);
      this.lastBeatTime = timestamp;

      // Keep only last 10 beats
      if (this.beatHistory.length > 10) {
        this.beatHistory.shift();
      }
    }

    // Calculate BPM from beat intervals
    if (this.beatHistory.length >= 2) {
      const intervals = [];
      for (let i = 1; i < this.beatHistory.length; i++) {
        intervals.push(this.beatHistory[i] - this.beatHistory[i - 1]);
      }

      const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const bpm = Math.round(60000 / avgInterval); // Convert ms to BPM

      return Math.min(300, Math.max(30, bpm)); // Clamp to reasonable range
    }

    return 0; // Not enough data yet
  }

  /**
   * Classify pattern type based on acoustic features
   *
   * @returns {string} Pattern type
   */
  classifyPattern() {
    const currentIntensity = this.calculateIntensity();
    const currentFreq = this.calculateFundamentalFrequency();
    const zcr = this.calculateZeroCrossingRate();

    // Track history for pattern detection
    this.patternHistory.push({
      intensity: currentIntensity,
      frequency: currentFreq,
      zcr
    });

    // Keep only last 20 samples (about 2 seconds at 100ms intervals)
    if (this.patternHistory.length > 20) {
      this.patternHistory.shift();
    }

    // Need enough history to classify
    if (this.patternHistory.length < 10) {
      return 'initializing';
    }

    // Calculate trends
    const intensityTrend = this.calculateTrend(this.patternHistory.map(p => p.intensity));
    const frequencyVariance = this.calculateVariance(this.patternHistory.map(p => p.frequency));

    // Classification rules
    if (intensityTrend > 2) {
      return 'crescendo'; // Growing louder
    } else if (intensityTrend < -2) {
      return 'decrescendo'; // Growing softer
    } else if (frequencyVariance < 100) {
      return 'repetitive'; // Very stable pitch
    } else if (zcr > 100) {
      return 'staccato'; // Rapid changes
    } else {
      return 'flowing'; // Smooth, continuous
    }
  }

  /**
   * Calculate spectral centroid (brightness)
   *
   * @returns {number} Spectral centroid in Hz
   */
  calculateSpectralCentroid() {
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < this.frequencyData.length; i++) {
      const frequency = (i * this.audioContext.sampleRate) / (2 * this.frequencyData.length);
      const magnitude = this.frequencyData[i];

      numerator += frequency * magnitude;
      denominator += magnitude;
    }

    return denominator > 0 ? Math.round(numerator / denominator) : 0;
  }

  /**
   * Calculate zero-crossing rate (roughness/noisiness)
   *
   * @returns {number} Zero-crossing rate
   */
  calculateZeroCrossingRate() {
    let crossings = 0;

    for (let i = 1; i < this.timeDomainData.length; i++) {
      const prevSample = this.timeDomainData[i - 1] - 128;
      const currSample = this.timeDomainData[i] - 128;

      if ((prevSample >= 0 && currSample < 0) || (prevSample < 0 && currSample >= 0)) {
        crossings++;
      }
    }

    return crossings;
  }

  /**
   * Calculate trend (slope) of a time series
   *
   * @param {Array<number>} values - Time series values
   * @returns {number} Slope
   */
  calculateTrend(values) {
    const n = values.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += values[i];
      sumXY += i * values[i];
      sumXX += i * i;
    }

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    return slope;
  }

  /**
   * Calculate variance of a time series
   *
   * @param {Array<number>} values - Time series values
   * @returns {number} Variance
   */
  calculateVariance(values) {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => (v - mean) ** 2);
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  /**
   * Reset analyzer state
   */
  reset() {
    this.patternHistory = [];
    this.beatHistory = [];
    this.lastBeatTime = 0;
  }
}

/**
 * Phoneme Detection Service (Deepgram Integration)
 * NOTE: Requires Deepgram API key and backend proxy for production
 */
export class PhonemeDetector {
  constructor(apiKey = null) {
    this.apiKey = apiKey || process.env.REACT_APP_DEEPGRAM_API_KEY;
    this.useProxy = !this.apiKey; // Use backend proxy if no API key

    // Phoneme patterns for pattern matching
    this.phonemePatterns = new Map();
  }

  /**
   * Detect phonemes from audio blob using Deepgram
   *
   * @param {Blob} audioBlob - Recorded audio
   * @returns {Promise<Object>} Phoneme detection result
   */
  async detectPhonemes(audioBlob) {
    try {
      console.log('🔍 Detecting phonemes via Deepgram...');

      // For demo mode, return mock data
      // TODO: Implement actual Deepgram API call in production
      if (!this.apiKey) {
        console.warn('⚠️ No Deepgram API key - using mock phoneme data');
        return this.getMockPhonemeData();
      }

      // Production implementation (requires backend proxy)
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/lsi/detect-phonemes', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Deepgram API error: ${response.statusText}`);
      }

      const result = await response.json();
      return this.parseDeepgramResponse(result);
    } catch (error) {
      console.error('❌ Phoneme detection error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Parse Deepgram API response into phoneme data
   *
   * @param {Object} deepgramResult - Raw Deepgram response
   * @returns {Object} Parsed phoneme data
   */
  parseDeepgramResponse(deepgramResult) {
    // Extract phonemes from Deepgram's word-level data
    const phonemes = [];

    if (deepgramResult.results?.channels?.[0]?.alternatives?.[0]?.words) {
      const words = deepgramResult.results.channels[0].alternatives[0].words;

      for (const word of words) {
        phonemes.push({
          phoneme: word.word,
          start: word.start,
          end: word.end,
          confidence: word.confidence
        });
      }
    }

    return {
      success: true,
      phonemes,
      transcript: deepgramResult.results?.channels?.[0]?.alternatives?.[0]?.transcript || ''
    };
  }

  /**
   * Get mock phoneme data for demo mode
   *
   * @returns {Object} Mock phoneme data
   */
  getMockPhonemeData() {
    return {
      success: true,
      phonemes: [
        { phoneme: 'sha', start: 0.5, end: 0.8, confidence: 0.92 },
        { phoneme: 'la', start: 0.9, end: 1.1, confidence: 0.88 },
        { phoneme: 'ma', start: 1.2, end: 1.5, confidence: 0.95 },
        { phoneme: 'ka', start: 1.6, end: 1.9, confidence: 0.91 },
        { phoneme: 'ra', start: 2.0, end: 2.3, confidence: 0.87 }
      ],
      transcript: 'sha-la-ma-ka-ra',
      note: 'Mock data for demo - integrate Deepgram API in production'
    };
  }

  /**
   * Count syllables in phoneme sequence
   *
   * @param {Array<Object>} phonemes - Detected phonemes
   * @returns {number} Syllable count
   */
  countSyllables(phonemes) {
    // Simple heuristic: count vowel sounds
    const vowelSounds = ['a', 'e', 'i', 'o', 'u', 'ah', 'eh', 'ih', 'oh', 'uh'];

    let count = 0;
    for (const phoneme of phonemes) {
      const ph = phoneme.phoneme.toLowerCase();
      if (vowelSounds.some(v => ph.includes(v))) {
        count++;
      }
    }

    return count;
  }
}

/**
 * Pattern Recognition Orchestrator
 * Combines acoustic analysis and phoneme detection
 */
export class PatternRecognitionService {
  constructor(audioProcessor) {
    this.audioProcessor = audioProcessor;
    this.acousticAnalyzer = null;
    this.phonemeDetector = new PhonemeDetector();

    this.patterns = [];
    this.analysisInterval = null;
  }

  /**
   * Start real-time pattern recognition
   *
   * @param {number} interval - Analysis interval in ms (default: 100ms)
   */
  startAnalysis(interval = 100) {
    if (!this.audioProcessor || !this.audioProcessor.audioContext) {
      throw new Error('Audio processor not initialized');
    }

    // Initialize acoustic analyzer
    this.acousticAnalyzer = new AcousticAnalyzer(
      this.audioProcessor.audioContext,
      this.audioProcessor.analyser
    );

    console.log('🎵 Starting pattern recognition...');

    // Run acoustic analysis at regular intervals
    let startTime = Date.now();
    this.analysisInterval = setInterval(() => {
      const timestamp = Date.now() - startTime;
      const features = this.acousticAnalyzer.extractFeatures(timestamp);

      // Store pattern
      this.patterns.push(features);

      console.log(`Pattern detected at ${timestamp}ms:`, features.patternType);
    }, interval);
  }

  /**
   * Stop pattern recognition
   */
  stopAnalysis() {
    if (this.analysisInterval) {
      clearInterval(this.analysisInterval);
      this.analysisInterval = null;
      console.log('✅ Pattern recognition stopped');
    }
  }

  /**
   * Analyze recorded audio blob (post-recording analysis)
   *
   * @param {Blob} audioBlob - Recorded audio
   * @returns {Promise<Object>} Complete analysis result
   */
  async analyzeRecording(audioBlob) {
    try {
      console.log('🔬 Analyzing recording...');

      // Step 1: Detect phonemes
      const phonemeResult = await this.phonemeDetector.detectPhonemes(audioBlob);

      if (!phonemeResult.success) {
        throw new Error(phonemeResult.error);
      }

      // Step 2: Count syllables
      const syllableCount = this.phonemeDetector.countSyllables(phonemeResult.phonemes);

      // Step 3: Aggregate acoustic patterns
      const acousticSummary = this.summarizePatterns();

      // Step 4: Combine results
      return {
        success: true,
        phonemes: phonemeResult.phonemes,
        transcript: phonemeResult.transcript,
        syllableCount,
        patterns: this.patterns,
        summary: {
          totalPatterns: this.patterns.length,
          dominantPattern: acousticSummary.dominantPattern,
          averageFrequency: acousticSummary.avgFrequency,
          averageIntensity: acousticSummary.avgIntensity,
          averageTempo: acousticSummary.avgTempo
        }
      };
    } catch (error) {
      console.error('❌ Recording analysis error:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Summarize detected patterns
   *
   * @returns {Object} Pattern summary
   */
  summarizePatterns() {
    if (this.patterns.length === 0) {
      return {
        dominantPattern: 'none',
        avgFrequency: 0,
        avgIntensity: 0,
        avgTempo: 0
      };
    }

    // Calculate averages
    const avgFrequency = this.patterns.reduce((sum, p) => sum + p.fundamentalFrequency, 0) / this.patterns.length;
    const avgIntensity = this.patterns.reduce((sum, p) => sum + p.intensity, 0) / this.patterns.length;
    const avgTempo = this.patterns.reduce((sum, p) => sum + p.tempo, 0) / this.patterns.length;

    // Find dominant pattern type
    const patternCounts = {};
    for (const pattern of this.patterns) {
      patternCounts[pattern.patternType] = (patternCounts[pattern.patternType] || 0) + 1;
    }

    const dominantPattern = Object.keys(patternCounts).reduce((a, b) =>
      patternCounts[a] > patternCounts[b] ? a : b
    );

    return {
      dominantPattern,
      avgFrequency: Math.round(avgFrequency * 100) / 100,
      avgIntensity: Math.round(avgIntensity * 100) / 100,
      avgTempo: Math.round(avgTempo)
    };
  }

  /**
   * Reset pattern recognition state
   */
  reset() {
    this.stopAnalysis();
    this.patterns = [];
    if (this.acousticAnalyzer) {
      this.acousticAnalyzer.reset();
    }
  }

  /**
   * Get detected patterns
   *
   * @returns {Array<Object>} All detected patterns
   */
  getPatterns() {
    return this.patterns;
  }
}

export default {
  AcousticAnalyzer,
  PhonemeDetector,
  PatternRecognitionService
};
