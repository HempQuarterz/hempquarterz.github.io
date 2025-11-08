/**
 * Audio Processor - Web Audio API Utilities for LSI
 * Handles microphone access, recording, and real-time audio analysis
 *
 * FAITH ALIGNMENT: This tool captures audio for reflection purposes only.
 * It does not claim to interpret divine meaning.
 */

/**
 * AudioProcessor class
 * Manages audio capture, recording, and real-time analysis
 */
class AudioProcessor {
  constructor() {
    this.audioContext = null;
    this.mediaStream = null;
    this.mediaRecorder = null;
    this.analyser = null;
    this.source = null;
    this.gainNode = null; // Add gain node for volume boost
    this.recordedChunks = [];
    this.isRecording = false;
    this.isPaused = false;
    this.startTime = null;
    this.pausedDuration = 0;
    this.lastPauseTime = null;
  }

  /**
   * Initialize Web Audio API and request microphone access
   * @returns {Promise<boolean>} Success status
   */
  async initialize() {
    try {
      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Web Audio API not supported in this browser');
      }

      // Request microphone access
      // Disable autoGainControl to allow OS volume control
      const constraints = {
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false, // Changed to false to allow OS volume control
          sampleRate: 44100,
          channelCount: 1 // Mono audio
        }
      };

      this.mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

      // Create Audio Context
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext({ sampleRate: 44100 });

      // Create analyser node for real-time visualization
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 2048; // Higher resolution for waveform
      this.analyser.smoothingTimeConstant = 0.8;

      // Create gain node to boost quiet microphone input
      // Increased boost since we disabled autoGainControl
      this.gainNode = this.audioContext.createGain();
      this.gainNode.gain.value = 10.0; // Boost by 10x (1000% volume)

      // Create source from media stream
      this.source = this.audioContext.createMediaStreamSource(this.mediaStream);

      // Connect: source → gain → analyser
      this.source.connect(this.gainNode);
      this.gainNode.connect(this.analyser);

      console.log('✅ Audio processor initialized successfully');
      console.log('🔊 Audio gain boost: 10x (1000%)');
      console.log('🔇 Auto gain control: DISABLED (allows manual volume control)');
      return true;
    } catch (error) {
      console.error('❌ Failed to initialize audio processor:', error);
      throw error;
    }
  }

  /**
   * Start recording audio
   * @param {Object} options - Recording options
   * @returns {Promise<void>}
   */
  async startRecording(options = {}) {
    try {
      if (!this.mediaStream) {
        throw new Error('Audio processor not initialized. Call initialize() first.');
      }

      if (this.isRecording) {
        console.warn('Recording already in progress');
        return;
      }

      // Configure MediaRecorder
      const mimeType = this.getSupportedMimeType();
      this.mediaRecorder = new MediaRecorder(this.mediaStream, {
        mimeType,
        audioBitsPerSecond: options.audioBitsPerSecond || 128000
      });

      // Reset recorded chunks
      this.recordedChunks = [];
      this.startTime = Date.now();
      this.pausedDuration = 0;

      // Handle data available
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };

      // Handle recording stop
      this.mediaRecorder.onstop = () => {
        console.log('✅ Recording stopped');
      };

      // Handle errors
      this.mediaRecorder.onerror = (error) => {
        console.error('❌ MediaRecorder error:', error);
      };

      // Start recording
      this.mediaRecorder.start(100); // Collect data every 100ms
      this.isRecording = true;
      this.isPaused = false;

      console.log(`✅ Recording started with ${mimeType}`);
    } catch (error) {
      console.error('❌ Failed to start recording:', error);
      throw error;
    }
  }

  /**
   * Pause recording
   */
  pauseRecording() {
    if (!this.isRecording || this.isPaused) {
      console.warn('Cannot pause: not recording or already paused');
      return;
    }

    this.mediaRecorder.pause();
    this.isPaused = true;
    this.lastPauseTime = Date.now();
    console.log('⏸️ Recording paused');
  }

  /**
   * Resume recording
   */
  resumeRecording() {
    if (!this.isRecording || !this.isPaused) {
      console.warn('Cannot resume: not recording or not paused');
      return;
    }

    this.mediaRecorder.resume();
    this.isPaused = false;

    // Track paused duration
    if (this.lastPauseTime) {
      this.pausedDuration += Date.now() - this.lastPauseTime;
      this.lastPauseTime = null;
    }

    console.log('▶️ Recording resumed');
  }

  /**
   * Stop recording and return audio blob
   * @returns {Promise<Blob>} Recorded audio blob
   */
  async stopRecording() {
    return new Promise((resolve, reject) => {
      if (!this.isRecording) {
        reject(new Error('Not currently recording'));
        return;
      }

      this.mediaRecorder.onstop = () => {
        const mimeType = this.getSupportedMimeType();
        const blob = new Blob(this.recordedChunks, { type: mimeType });

        this.isRecording = false;
        this.isPaused = false;

        console.log(`✅ Recording stopped. Size: ${(blob.size / 1024).toFixed(2)} KB`);
        resolve(blob);
      };

      this.mediaRecorder.stop();
    });
  }

  /**
   * Get recording duration in seconds
   * @returns {number} Duration in seconds
   */
  getRecordingDuration() {
    if (!this.startTime) return 0;

    const now = this.isPaused ? this.lastPauseTime : Date.now();
    const totalMs = now - this.startTime - this.pausedDuration;

    return Math.floor(totalMs / 1000);
  }

  /**
   * Get real-time audio data for waveform visualization
   * @returns {Uint8Array} Time domain data
   */
  getTimeDomainData() {
    if (!this.analyser) return new Uint8Array(0);

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteTimeDomainData(dataArray);

    return dataArray;
  }

  /**
   * Get real-time frequency data
   * @returns {Uint8Array} Frequency data
   */
  getFrequencyData() {
    if (!this.analyser) return new Uint8Array(0);

    const bufferLength = this.analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    this.analyser.getByteFrequencyData(dataArray);

    return dataArray;
  }

  /**
   * Get current audio input level (0-100)
   * @returns {number} Input level percentage
   */
  getInputLevel() {
    const timeDomainData = this.getTimeDomainData();
    if (timeDomainData.length === 0) return 0;

    // Calculate RMS (Root Mean Square) for accurate volume
    let sum = 0;
    for (let i = 0; i < timeDomainData.length; i++) {
      const normalized = (timeDomainData[i] - 128) / 128;
      sum += normalized * normalized;
    }
    const rms = Math.sqrt(sum / timeDomainData.length);

    // Convert to percentage (0-100)
    // Increased amplification from 3x to 10x for better sensitivity
    return Math.min(100, Math.round(rms * 100 * 10));
  }

  /**
   * Get average frequency (Hz) of current audio
   * @returns {number} Average frequency in Hz
   */
  getAverageFrequency() {
    const frequencyData = this.getFrequencyData();
    if (frequencyData.length === 0) return 0;

    let sum = 0;
    let count = 0;

    for (let i = 0; i < frequencyData.length; i++) {
      if (frequencyData[i] > 0) {
        // Convert bin index to frequency
        const frequency = (i * this.audioContext.sampleRate) / (this.analyser.fftSize * 2);
        sum += frequency * frequencyData[i];
        count += frequencyData[i];
      }
    }

    return count > 0 ? Math.round(sum / count) : 0;
  }

  /**
   * Detect peak intensity (dB)
   * @returns {number} Peak intensity in dB
   */
  getPeakIntensity() {
    const frequencyData = this.getFrequencyData();
    if (frequencyData.length === 0) return 0;

    const max = Math.max(...frequencyData);

    // Convert to dB (approximate)
    const db = 20 * Math.log10(max / 255);
    return Math.max(0, Math.round(db + 100)); // Normalize to 0-100 range
  }

  /**
   * Get supported MIME type for MediaRecorder
   * @returns {string} MIME type
   */
  getSupportedMimeType() {
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/wav'
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }

    // Fallback
    return 'audio/webm';
  }

  /**
   * Convert audio blob to base64 string
   * @param {Blob} blob - Audio blob
   * @returns {Promise<string>} Base64 string
   */
  async blobToBase64(blob) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Clean up resources and stop microphone access
   */
  cleanup() {
    try {
      // Stop recording if active
      if (this.isRecording && this.mediaRecorder) {
        this.mediaRecorder.stop();
      }

      // Stop all tracks
      if (this.mediaStream) {
        this.mediaStream.getTracks().forEach(track => track.stop());
      }

      // Disconnect audio nodes
      if (this.source) {
        this.source.disconnect();
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
      }

      // Close audio context
      if (this.audioContext && this.audioContext.state !== 'closed') {
        this.audioContext.close();
      }

      // Reset state
      this.audioContext = null;
      this.mediaStream = null;
      this.mediaRecorder = null;
      this.analyser = null;
      this.source = null;
      this.recordedChunks = [];
      this.isRecording = false;
      this.isPaused = false;

      console.log('✅ Audio processor cleaned up');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }

  /**
   * Get detailed audio stream diagnostics
   * @returns {Object} Diagnostic information
   */
  getDiagnostics() {
    if (!this.mediaStream) {
      return { error: 'No media stream available' };
    }

    const audioTracks = this.mediaStream.getAudioTracks();
    const track = audioTracks[0];

    if (!track) {
      return { error: 'No audio track found' };
    }

    const settings = track.getSettings();
    const capabilities = track.getCapabilities ? track.getCapabilities() : {};
    const constraints = track.getConstraints();

    return {
      streamActive: this.mediaStream.active,
      trackState: track.readyState, // 'live' or 'ended'
      trackEnabled: track.enabled,
      trackMuted: track.muted,
      trackLabel: track.label,
      trackId: track.id,
      settings: {
        autoGainControl: settings.autoGainControl,
        echoCancellation: settings.echoCancellation,
        noiseSuppression: settings.noiseSuppression,
        sampleRate: settings.sampleRate,
        sampleSize: settings.sampleSize,
        channelCount: settings.channelCount,
        latency: settings.latency,
        deviceId: settings.deviceId
      },
      capabilities: capabilities,
      constraints: constraints,
      audioContextState: this.audioContext ? this.audioContext.state : 'none',
      audioContextSampleRate: this.audioContext ? this.audioContext.sampleRate : 0,
      gainValue: this.gainNode ? this.gainNode.gain.value : 0
    };
  }

  /**
   * Check if browser supports required features
   * @returns {Object} Support status
   */
  static checkBrowserSupport() {
    return {
      getUserMedia: !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia),
      audioContext: !!(window.AudioContext || window.webkitAudioContext),
      mediaRecorder: !!window.MediaRecorder,
      supported: !!(
        navigator.mediaDevices &&
        navigator.mediaDevices.getUserMedia &&
        (window.AudioContext || window.webkitAudioContext) &&
        window.MediaRecorder
      )
    };
  }
}

export default AudioProcessor;
