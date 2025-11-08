/**
 * Waveform Generator - Canvas Waveform Rendering for LSI
 * Renders real-time and static waveforms on HTML5 Canvas
 *
 * FAITH ALIGNMENT: Visual representations for reflection and study only.
 */

/**
 * WaveformGenerator class
 * Handles canvas-based waveform visualization
 */
class WaveformGenerator {
  constructor(canvasElement, options = {}) {
    this.canvas = canvasElement;
    this.ctx = canvasElement.getContext('2d');
    this.options = {
      backgroundColor: options.backgroundColor || '#1a1a2e',
      waveColor: options.waveColor || '#2dd4bf',
      waveGlowColor: options.waveGlowColor || 'rgba(45, 212, 191, 0.5)',
      lineWidth: options.lineWidth || 2,
      height: options.height || 150,
      responsive: options.responsive !== false,
      showGrid: options.showGrid || false,
      gridColor: options.gridColor || 'rgba(255, 255, 255, 0.1)'
    };

    this.animationId = null;
    this.isAnimating = false;

    // Set canvas dimensions
    this.resize();

    // Handle window resize if responsive
    if (this.options.responsive) {
      window.addEventListener('resize', () => this.resize());
    }
  }

  /**
   * Resize canvas to match container
   */
  resize() {
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * window.devicePixelRatio;
    this.canvas.height = this.options.height * window.devicePixelRatio;
    this.canvas.style.width = `${rect.width}px`;
    this.canvas.style.height = `${this.options.height}px`;

    // Scale context for high DPI
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
  }

  /**
   * Clear canvas
   */
  clear() {
    this.ctx.fillStyle = this.options.backgroundColor;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw grid lines
   */
  drawGrid() {
    if (!this.options.showGrid) return;

    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    this.ctx.strokeStyle = this.options.gridColor;
    this.ctx.lineWidth = 1;

    // Horizontal center line
    this.ctx.beginPath();
    this.ctx.moveTo(0, height / 2);
    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();

    // Vertical grid lines (every 10%)
    for (let i = 0; i <= 10; i++) {
      const x = (width / 10) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, height);
      this.ctx.stroke();
    }
  }

  /**
   * Draw real-time waveform from time domain data
   * @param {Uint8Array} timeDomainData - Audio time domain data
   */
  drawRealTimeWaveform(timeDomainData) {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Clear canvas
    this.clear();

    // Draw grid
    this.drawGrid();

    // Draw waveform
    this.ctx.lineWidth = this.options.lineWidth;
    this.ctx.strokeStyle = this.options.waveColor;

    // Add glow effect
    this.ctx.shadowBlur = 10;
    this.ctx.shadowColor = this.options.waveGlowColor;

    this.ctx.beginPath();

    const sliceWidth = width / timeDomainData.length;
    let x = 0;

    for (let i = 0; i < timeDomainData.length; i++) {
      const v = timeDomainData[i] / 128.0; // Normalize to 0-2
      const y = (v * height) / 2;

      if (i === 0) {
        this.ctx.moveTo(x, y);
      } else {
        this.ctx.lineTo(x, y);
      }

      x += sliceWidth;
    }

    this.ctx.lineTo(width, height / 2);
    this.ctx.stroke();

    // Reset shadow
    this.ctx.shadowBlur = 0;
  }

  /**
   * Draw static waveform from audio peaks
   * @param {Array<number>} peaks - Array of peak values (0-1)
   * @param {Object} options - Drawing options
   */
  drawStaticWaveform(peaks, options = {}) {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    const barWidth = options.barWidth || 3;
    const barGap = options.barGap || 1;
    const barColor = options.barColor || this.options.waveColor;
    const centerLine = height / 2;

    // Clear canvas
    this.clear();

    // Draw grid
    this.drawGrid();

    // Calculate how many bars fit
    const totalBarWidth = barWidth + barGap;
    const barCount = Math.floor(width / totalBarWidth);

    // Downsample peaks if needed
    const sampledPeaks = this.downsamplePeaks(peaks, barCount);

    // Draw bars
    this.ctx.fillStyle = barColor;

    for (let i = 0; i < sampledPeaks.length; i++) {
      const x = i * totalBarWidth;
      const barHeight = sampledPeaks[i] * (height / 2) * 0.9; // 90% of half height

      // Draw top half
      this.ctx.fillRect(x, centerLine - barHeight, barWidth, barHeight);

      // Draw bottom half (mirrored)
      this.ctx.fillRect(x, centerLine, barWidth, barHeight);
    }
  }

  /**
   * Draw constellation-style waveform (for HSM)
   * @param {Array<Object>} patterns - Prayer pattern data
   */
  drawConstellationWaveform(patterns) {
    const width = this.canvas.width / window.devicePixelRatio;
    const height = this.canvas.height / window.devicePixelRatio;

    // Clear canvas
    this.clear();

    if (!patterns || patterns.length === 0) return;

    // Draw connections first (behind nodes)
    this.ctx.strokeStyle = 'rgba(96, 165, 250, 0.3)';
    this.ctx.lineWidth = 1;

    for (let i = 0; i < patterns.length - 1; i++) {
      const current = patterns[i];
      const next = patterns[i + 1];

      const x1 = (current.timestamp_offset / patterns[patterns.length - 1].timestamp_offset) * width;
      const y1 = height - (current.intensity * height * 0.8) - height * 0.1;

      const x2 = (next.timestamp_offset / patterns[patterns.length - 1].timestamp_offset) * width;
      const y2 = height - (next.intensity * height * 0.8) - height * 0.1;

      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.ctx.stroke();
    }

    // Draw nodes
    patterns.forEach((pattern, index) => {
      const x = (pattern.timestamp_offset / patterns[patterns.length - 1].timestamp_offset) * width;
      const y = height - (pattern.intensity * height * 0.8) - height * 0.1;

      // Node size based on intensity
      const radius = 3 + (pattern.intensity * 5);

      // Draw node with glow
      this.ctx.fillStyle = '#60a5fa';
      this.ctx.shadowBlur = 15;
      this.ctx.shadowColor = 'rgba(96, 165, 250, 0.8)';

      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, Math.PI * 2);
      this.ctx.fill();

      this.ctx.shadowBlur = 0;

      // Draw label for key moments
      if (pattern.linguistic_echo) {
        this.ctx.fillStyle = '#f8f9fa';
        this.ctx.font = '10px Inter, sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText(pattern.linguistic_echo, x, y - radius - 5);
      }
    });
  }

  /**
   * Downsample peaks array to fit target count
   * @param {Array<number>} peaks - Original peaks
   * @param {number} targetCount - Target number of bars
   * @returns {Array<number>} Downsampled peaks
   */
  downsamplePeaks(peaks, targetCount) {
    if (peaks.length <= targetCount) return peaks;

    const sampledPeaks = [];
    const blockSize = peaks.length / targetCount;

    for (let i = 0; i < targetCount; i++) {
      const start = Math.floor(i * blockSize);
      const end = Math.floor((i + 1) * blockSize);
      const block = peaks.slice(start, end);

      // Get max value in block
      const maxInBlock = Math.max(...block);
      sampledPeaks.push(maxInBlock);
    }

    return sampledPeaks;
  }

  /**
   * Generate peaks from audio buffer
   * @param {AudioBuffer} audioBuffer - Web Audio API AudioBuffer
   * @param {number} peakCount - Number of peaks to generate
   * @returns {Array<number>} Array of peak values (0-1)
   */
  static generatePeaksFromBuffer(audioBuffer, peakCount = 1000) {
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const peaks = [];
    const samplesPerPeak = Math.floor(channelData.length / peakCount);

    for (let i = 0; i < peakCount; i++) {
      const start = i * samplesPerPeak;
      const end = start + samplesPerPeak;
      let max = 0;

      for (let j = start; j < end && j < channelData.length; j++) {
        const absValue = Math.abs(channelData[j]);
        if (absValue > max) max = absValue;
      }

      peaks.push(max);
    }

    return peaks;
  }

  /**
   * Start animation loop for real-time waveform
   * @param {Function} getDataCallback - Function that returns time domain data
   */
  startAnimation(getDataCallback) {
    if (this.isAnimating) return;

    this.isAnimating = true;

    const animate = () => {
      if (!this.isAnimating) return;

      const data = getDataCallback();
      if (data && data.length > 0) {
        this.drawRealTimeWaveform(data);
      }

      this.animationId = requestAnimationFrame(animate);
    };

    animate();
  }

  /**
   * Stop animation loop
   */
  stopAnimation() {
    this.isAnimating = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  /**
   * Update waveform color
   * @param {string} color - New color
   */
  setWaveColor(color) {
    this.options.waveColor = color;
  }

  /**
   * Update background color
   * @param {string} color - New color
   */
  setBackgroundColor(color) {
    this.options.backgroundColor = color;
  }

  /**
   * Clean up resources
   */
  cleanup() {
    this.stopAnimation();

    if (this.options.responsive) {
      window.removeEventListener('resize', () => this.resize());
    }
  }
}

export default WaveformGenerator;
