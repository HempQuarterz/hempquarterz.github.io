/**
 * Audio Capture Demo - Proof of Concept
 * Demonstrates Web Audio API integration for LSI
 *
 * FAITH ALIGNMENT: This demonstration shows audio capture capabilities
 * for personal spiritual reflection only.
 */

import React, { useState, useEffect, useRef } from 'react';
import AudioProcessor from '../../utils/lsi/audioProcessor';
import WaveformGenerator from '../../utils/lsi/waveformGenerator';
import {
  uploadAudioFile,
  createPrayerSession,
  initializeStorageBucket
} from '../../utils/lsi/supabaseStorage';
import '../../styles/lsi/audio-capture-demo.css';

const AudioCaptureDemo = () => {
  // State
  const [isSupported, setIsSupported] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [duration, setDuration] = useState(0);
  const [inputLevel, setInputLevel] = useState(0);
  const [avgFrequency, setAvgFrequency] = useState(0);
  const [peakIntensity, setPeakIntensity] = useState(0);
  const [error, setError] = useState(null);
  const [recordedBlobUrl, setRecordedBlobUrl] = useState(null);
  const [recordedBlob, setRecordedBlob] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [diagnostics, setDiagnostics] = useState(null);
  const [showDiagnostics, setShowDiagnostics] = useState(false);

  // Refs
  const audioProcessorRef = useRef(null);
  const waveformGeneratorRef = useRef(null);
  const canvasRef = useRef(null);
  const metricsIntervalRef = useRef(null);
  const durationIntervalRef = useRef(null);

  // Check browser support and initialize storage on mount
  useEffect(() => {
    const support = AudioProcessor.checkBrowserSupport();
    setIsSupported(support.supported);

    if (!support.supported) {
      setError('Your browser does not support audio recording. Please use a modern browser like Chrome, Firefox, or Edge.');
    }

    // Initialize Supabase Storage bucket
    initializeStorageBucket().then(result => {
      if (result.success) {
        console.log('✅ Storage bucket initialized');
      } else {
        console.warn('⚠️ Storage bucket initialization failed, uploads may not work');
      }
    });

    return () => {
      // Cleanup on unmount
      if (audioProcessorRef.current) {
        audioProcessorRef.current.cleanup();
      }
      if (waveformGeneratorRef.current) {
        waveformGeneratorRef.current.cleanup();
      }
      if (metricsIntervalRef.current) {
        clearInterval(metricsIntervalRef.current);
      }
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    };
  }, []);

  // Initialize waveform canvas when available
  useEffect(() => {
    if (canvasRef.current && !waveformGeneratorRef.current) {
      waveformGeneratorRef.current = new WaveformGenerator(canvasRef.current, {
        height: 150,
        waveColor: '#2dd4bf',
        backgroundColor: '#0f3460',
        showGrid: true
      });
    }
  }, [canvasRef.current]);

  /**
   * Initialize audio processor
   */
  const handleInitialize = async () => {
    try {
      setError(null);

      if (!audioProcessorRef.current) {
        audioProcessorRef.current = new AudioProcessor();
      }

      await audioProcessorRef.current.initialize();
      setIsInitialized(true);

      // Start waveform animation immediately
      if (waveformGeneratorRef.current) {
        waveformGeneratorRef.current.startAnimation(() => {
          return audioProcessorRef.current.getTimeDomainData();
        });
      }

      // Start live metrics monitoring (even when not recording)
      // This shows the user that their mic is picking up sound
      metricsIntervalRef.current = setInterval(() => {
        if (audioProcessorRef.current) {
          const level = audioProcessorRef.current.getInputLevel();
          const freq = audioProcessorRef.current.getAverageFrequency();
          const peak = audioProcessorRef.current.getPeakIntensity();

          setInputLevel(level);
          setAvgFrequency(freq);
          setPeakIntensity(peak);

          // Debug: Log when we detect sound
          if (level > 5) {
            console.log(`🎤 Audio detected - Level: ${level}%, Freq: ${freq}Hz, Peak: ${peak}dB`);
          }
        }
      }, 100);

      console.log('✅ Audio processor initialized - Live monitoring active');
      console.log('🎤 Microphone tracks:', audioProcessorRef.current.mediaStream.getTracks());
      console.log('🎤 Audio context state:', audioProcessorRef.current.audioContext.state);
    } catch (err) {
      console.error('❌ Initialization error:', err);
      setError(err.message || 'Failed to access microphone. Please grant permission.');
    }
  };

  /**
   * Fetch audio stream diagnostics
   */
  const handleFetchDiagnostics = () => {
    if (audioProcessorRef.current) {
      const diag = audioProcessorRef.current.getDiagnostics();
      setDiagnostics(diag);
      setShowDiagnostics(true);
      console.log('🔍 Audio Diagnostics:', diag);
    }
  };

  /**
   * Start recording
   */
  const handleStartRecording = async () => {
    try {
      setError(null);

      if (!audioProcessorRef.current) {
        throw new Error('Audio processor not initialized');
      }

      // Check if we need to re-initialize (e.g., if browser revoked permissions)
      if (!audioProcessorRef.current.mediaStream ||
          !audioProcessorRef.current.mediaStream.active) {
        console.log('🔄 Media stream inactive, re-initializing...');
        await audioProcessorRef.current.initialize();
      }

      await audioProcessorRef.current.startRecording();
      setIsRecording(true);
      setIsPaused(false);
      setDuration(0);
      setRecordedBlobUrl(null);

      // Start duration counter
      durationIntervalRef.current = setInterval(() => {
        const dur = audioProcessorRef.current.getRecordingDuration();
        setDuration(dur);
      }, 100);

      // Note: Metrics interval already running from initialization
      // No need to restart it here

      console.log('✅ Recording started');
    } catch (err) {
      console.error('❌ Recording error:', err);
      setError(err.message || 'Failed to start recording');
    }
  };

  /**
   * Pause recording
   */
  const handlePause = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.pauseRecording();
      setIsPaused(true);
    }
  };

  /**
   * Resume recording
   */
  const handleResume = () => {
    if (audioProcessorRef.current) {
      audioProcessorRef.current.resumeRecording();
      setIsPaused(false);
    }
  };

  /**
   * Stop recording
   */
  const handleStopRecording = async () => {
    try {
      if (!audioProcessorRef.current) return;

      const blob = await audioProcessorRef.current.stopRecording();
      setIsRecording(false);
      setIsPaused(false);

      // Clear duration interval only (keep metrics running for live monitoring)
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      // Note: metricsIntervalRef continues running to show live mic input

      // Verify blob has data
      if (blob.size === 0) {
        throw new Error('Recording produced no audio data. Please try again.');
      }

      // Create blob URL for playback
      const url = URL.createObjectURL(blob);
      setRecordedBlobUrl(url);
      setRecordedBlob(blob); // Save blob for upload

      console.log(`✅ Recording stopped. Size: ${(blob.size / 1024).toFixed(2)} KB, Type: ${blob.type}`);
    } catch (err) {
      console.error('❌ Stop recording error:', err);
      setError(err.message || 'Failed to stop recording');
    }
  };

  /**
   * Save recording to Supabase (upload audio + create session record)
   */
  const handleSaveRecording = async () => {
    if (!recordedBlob) {
      setError('No recording to save');
      return;
    }

    try {
      setIsUploading(true);
      setError(null);
      console.log('💾 Saving prayer session...');

      // Step 1: Create session record first to get session ID
      const sessionData = {
        duration_seconds: duration,
        sample_rate: 44100,
        bit_rate: 128000,
        channel_count: 1,
        audio_mime_type: recordedBlob.type,
        audio_file_size_kb: Math.round(recordedBlob.size / 1024),
        session_title: `Prayer Session - ${new Date().toLocaleString()}`,
        analysis_status: 'pending'
      };

      const sessionResult = await createPrayerSession(sessionData);

      if (!sessionResult.success) {
        throw new Error(sessionResult.error?.message || 'Failed to create session record');
      }

      const newSessionId = sessionResult.session.id;
      setSessionId(newSessionId);
      console.log(`✅ Session created: ${newSessionId}`);

      // Step 2: Upload audio file
      const uploadResult = await uploadAudioFile(recordedBlob, {
        sessionId: newSessionId,
        userId: null, // Anonymous for now
        duration
      });

      if (!uploadResult.success) {
        throw new Error(uploadResult.error?.message || 'Failed to upload audio');
      }

      console.log(`✅ Audio uploaded: ${uploadResult.filePath}`);

      // Step 3: Update session with file path
      const updateResult = await sessionResult.session;
      // Note: We could update the session here with audio_file_path if needed

      setUploadSuccess(true);
      setIsUploading(false);

      console.log('✅ Prayer session saved successfully!');
    } catch (err) {
      console.error('❌ Save error:', err);
      setError(err.message || 'Failed to save recording');
      setIsUploading(false);
      setUploadSuccess(false);
    }
  };

  /**
   * Format duration as MM:SS
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="audio-capture-demo">
      <div className="demo-header">
        <h2>🎙️ Audio Capture Proof of Concept</h2>
        <p className="demo-subtitle">Web Audio API Integration for LSI</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Browser Support Warning */}
      {!isSupported && (
        <div className="warning-message">
          <span className="warning-icon">❌</span>
          <span>Your browser does not support audio recording. Please use Chrome, Firefox, or Edge.</span>
        </div>
      )}

      {/* Initialization */}
      {isSupported && !isInitialized && (
        <div className="init-section">
          <p>Click the button below to grant microphone access and initialize the audio processor.</p>
          <button
            className="btn-primary btn-large"
            onClick={handleInitialize}
          >
            🎙️ Initialize Microphone
          </button>
        </div>
      )}

      {/* Recording Interface */}
      {isInitialized && (
        <div className="recording-interface">
          {/* Waveform Canvas */}
          <div className="waveform-container">
            <canvas ref={canvasRef} className="waveform-canvas" />
            {isRecording && (
              <div className="recording-indicator">
                <span className="pulse-dot"></span>
                <span>Recording: {formatDuration(duration)}</span>
              </div>
            )}
          </div>

          {/* Microphone Status Diagnostic */}
          <div style={{
            marginTop: '1rem',
            padding: '0.75rem',
            background: 'rgba(45, 212, 191, 0.1)',
            border: '1px solid rgba(45, 212, 191, 0.3)',
            borderRadius: '8px',
            fontSize: '0.85rem'
          }}>
            <strong style={{ color: '#2dd4bf' }}>🔍 Microphone Status:</strong>
            <div style={{ marginTop: '0.5rem', display: 'grid', gap: '0.25rem' }}>
              <div>• Microphone Permission: <strong style={{ color: '#10b981' }}>Granted</strong></div>
              <div>• Audio Stream: <strong style={{ color: '#10b981' }}>Active</strong></div>
              <div>• Monitoring: <strong style={{ color: '#10b981' }}>Running</strong></div>
              <div>• Current Input Level: <strong style={{ color: inputLevel > 10 ? '#10b981' : '#f59e0b' }}>{inputLevel}%</strong></div>
            </div>
            <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', fontStyle: 'italic', color: '#666' }}>
              {inputLevel < 5 ? '⚠️ Very quiet or no sound detected. Try speaking louder or check your microphone settings.' :
               inputLevel < 15 ? '✓ Weak signal detected. Speak closer to the microphone for better results.' :
               '✓ Good signal! Your microphone is working correctly.'}
            </div>
            {inputLevel < 15 && (
              <div style={{
                marginTop: '0.75rem',
                padding: '0.5rem',
                background: 'rgba(245, 158, 11, 0.1)',
                border: '1px solid rgba(245, 158, 11, 0.3)',
                borderRadius: '6px',
                fontSize: '0.8rem',
                color: '#92400e'
              }}>
                <strong>💡 Boost Microphone Input:</strong> Your microphone level is low. Try these:
                <br />
                <strong>1. System Microphone Volume:</strong>
                <br />
                &nbsp;&nbsp;• Windows: Sound Settings → Input → Increase microphone volume
                <br />
                &nbsp;&nbsp;• Linux: Sound Settings → Input Devices → Increase microphone level
                <br />
                <strong>2. Physical Mic:</strong> Speak louder or move closer to microphone
                <br />
                <small style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                  Note: Browser app volume (shown at 1%) is OUTPUT only and won't affect INPUT
                </small>
              </div>
            )}
          </div>

          {/* Advanced Diagnostics Button */}
          <div style={{ marginTop: '1rem', textAlign: 'center' }}>
            <button
              onClick={handleFetchDiagnostics}
              style={{
                padding: '0.5rem 1rem',
                background: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: '600',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {showDiagnostics ? '🔍 Refresh Diagnostics' : '🔍 Show Advanced Diagnostics'}
            </button>
          </div>

          {/* Advanced Diagnostics Panel */}
          {showDiagnostics && diagnostics && (
            <div style={{
              marginTop: '1rem',
              padding: '1rem',
              background: 'rgba(99, 102, 241, 0.05)',
              border: '2px solid rgba(99, 102, 241, 0.3)',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontFamily: 'monospace'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '0.75rem',
                paddingBottom: '0.5rem',
                borderBottom: '1px solid rgba(99, 102, 241, 0.2)'
              }}>
                <strong style={{ color: '#6366f1', fontSize: '0.95rem' }}>🔍 Audio Stream Diagnostics</strong>
                <button
                  onClick={() => setShowDiagnostics(false)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#666',
                    cursor: 'pointer',
                    fontSize: '1.2rem',
                    padding: '0.25rem'
                  }}
                >
                  ✕
                </button>
              </div>

              {diagnostics.error ? (
                <div style={{ color: '#ef4444' }}>❌ {diagnostics.error}</div>
              ) : (
                <div style={{ display: 'grid', gap: '0.75rem' }}>
                  {/* Stream Status */}
                  <div>
                    <strong style={{ color: '#6366f1' }}>Stream Status:</strong>
                    <div style={{ marginTop: '0.25rem', paddingLeft: '1rem', color: '#666' }}>
                      • Active: <strong style={{ color: diagnostics.streamActive ? '#10b981' : '#ef4444' }}>
                        {diagnostics.streamActive ? 'YES ✓' : 'NO ✗'}
                      </strong>
                      <br />
                      • Track State: <strong>{diagnostics.trackState}</strong>
                      <br />
                      • Track Enabled: <strong style={{ color: diagnostics.trackEnabled ? '#10b981' : '#ef4444' }}>
                        {diagnostics.trackEnabled ? 'YES ✓' : 'NO ✗'}
                      </strong>
                      <br />
                      • Track Muted: <strong style={{ color: diagnostics.trackMuted ? '#ef4444' : '#10b981' }}>
                        {diagnostics.trackMuted ? 'YES (Problem!)' : 'NO ✓'}
                      </strong>
                    </div>
                  </div>

                  {/* Audio Settings - CRITICAL FOR DEBUGGING */}
                  <div>
                    <strong style={{ color: '#6366f1' }}>Audio Processing Settings (CRITICAL):</strong>
                    <div style={{ marginTop: '0.25rem', paddingLeft: '1rem', color: '#666' }}>
                      • Auto Gain Control: <strong style={{
                        color: diagnostics.settings.autoGainControl === false ? '#10b981' : '#f59e0b'
                      }}>
                        {diagnostics.settings.autoGainControl === false
                          ? 'DISABLED ✓ (OS can control volume)'
                          : diagnostics.settings.autoGainControl === true
                            ? 'ENABLED ⚠️ (May lock OS volume)'
                            : 'UNKNOWN'}
                      </strong>
                      <br />
                      • Echo Cancellation: <strong>{diagnostics.settings.echoCancellation ? 'YES' : 'NO'}</strong>
                      <br />
                      • Noise Suppression: <strong>{diagnostics.settings.noiseSuppression ? 'YES' : 'NO'}</strong>
                      <br />
                      • Sample Rate: <strong>{diagnostics.settings.sampleRate || 'N/A'} Hz</strong>
                      <br />
                      • Channels: <strong>{diagnostics.settings.channelCount || 'N/A'}</strong>
                      <br />
                      • Latency: <strong>{diagnostics.settings.latency ? `${(diagnostics.settings.latency * 1000).toFixed(1)} ms` : 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Web Audio API Status */}
                  <div>
                    <strong style={{ color: '#6366f1' }}>Web Audio API:</strong>
                    <div style={{ marginTop: '0.25rem', paddingLeft: '1rem', color: '#666' }}>
                      • Context State: <strong>{diagnostics.audioContextState}</strong>
                      <br />
                      • Context Sample Rate: <strong>{diagnostics.audioContextSampleRate} Hz</strong>
                      <br />
                      • Gain Boost: <strong style={{ color: diagnostics.gainValue >= 10 ? '#10b981' : '#f59e0b' }}>
                        {diagnostics.gainValue}x ({diagnostics.gainValue * 100}%)
                      </strong>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div>
                    <strong style={{ color: '#6366f1' }}>Device Info:</strong>
                    <div style={{ marginTop: '0.25rem', paddingLeft: '1rem', color: '#666' }}>
                      • Label: <strong>{diagnostics.trackLabel || 'Unknown'}</strong>
                      <br />
                      • Device ID: <strong style={{ fontSize: '0.7rem' }}>{diagnostics.settings.deviceId || 'N/A'}</strong>
                    </div>
                  </div>

                  {/* Key Recommendation */}
                  <div style={{
                    marginTop: '0.5rem',
                    padding: '0.75rem',
                    background: diagnostics.settings.autoGainControl === false
                      ? 'rgba(16, 185, 129, 0.1)'
                      : 'rgba(245, 158, 11, 0.1)',
                    border: `1px solid ${diagnostics.settings.autoGainControl === false
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(245, 158, 11, 0.3)'}`,
                    borderRadius: '6px',
                    fontSize: '0.8rem'
                  }}>
                    {diagnostics.settings.autoGainControl === false ? (
                      <>
                        <strong style={{ color: '#10b981' }}>✅ Good Configuration!</strong>
                        <br />
                        Auto Gain Control is DISABLED, which means your operating system should be able to
                        manually adjust this browser's microphone input volume in sound settings.
                        <br /><br />
                        <strong>Next Steps:</strong>
                        <ol style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: 0 }}>
                          <li>Open your system sound settings</li>
                          <li>Look for the browser under input devices</li>
                          <li>You should now be able to adjust the microphone slider</li>
                          <li>Increase the slider to 50-100% for better audio detection</li>
                        </ol>
                      </>
                    ) : (
                      <>
                        <strong style={{ color: '#f59e0b' }}>⚠️ Configuration Issue</strong>
                        <br />
                        Auto Gain Control is still ENABLED. This may prevent your OS from manually
                        controlling the browser's microphone volume. Please refresh the page to apply
                        the latest audio configuration.
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Live Audio Metrics - Always visible when initialized */}
          <div className="audio-metrics" style={{ marginTop: '1.5rem' }}>
            <div className="metric-header" style={{
              textAlign: 'center',
              marginBottom: '1rem',
              color: inputLevel > 10 ? '#2dd4bf' : '#666',
              fontWeight: '600'
            }}>
              {inputLevel > 10 ? '🎤 Microphone Active' : '🎤 Speak to see levels'}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
              <div className="metric-card">
                <div className="metric-label">Input Level</div>
                <div className="metric-value">{inputLevel}%</div>
                <div className="meter-bar">
                  <div
                    className="meter-fill"
                    style={{
                      width: `${inputLevel}%`,
                      backgroundColor: inputLevel > 80 ? '#ef4444' : inputLevel > 50 ? '#f59e0b' : '#2dd4bf',
                      transition: 'width 0.1s ease, background-color 0.3s ease'
                    }}
                  ></div>
                </div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Avg Frequency</div>
                <div className="metric-value">{avgFrequency} Hz</div>
              </div>

              <div className="metric-card">
                <div className="metric-label">Peak Intensity</div>
                <div className="metric-value">{peakIntensity} dB</div>
              </div>
            </div>
          </div>

          {/* Recording Controls */}
          <div className="recording-controls" style={{ marginTop: '1.5rem' }}>
            {!isRecording && (
              <button
                className="btn-primary btn-large"
                onClick={handleStartRecording}
              >
                🎙️ Start Recording
              </button>
            )}

            {isRecording && !isPaused && (
              <>
                <button
                  className="btn-secondary"
                  onClick={handlePause}
                >
                  ⏸️ Pause
                </button>
                <button
                  className="btn-danger"
                  onClick={handleStopRecording}
                >
                  ⏹️ Stop Recording
                </button>
              </>
            )}

            {isRecording && isPaused && (
              <>
                <button
                  className="btn-primary"
                  onClick={handleResume}
                >
                  ▶️ Resume
                </button>
                <button
                  className="btn-danger"
                  onClick={handleStopRecording}
                >
                  ⏹️ Stop Recording
                </button>
              </>
            )}
          </div>

          {/* Playback */}
          {recordedBlobUrl && (
            <div className="playback-section">
              <h3>✅ Recording Complete</h3>
              <p>Duration: {formatDuration(duration)}</p>
              <audio
                controls
                src={recordedBlobUrl}
                className="audio-player"
                onError={(e) => {
                  console.error('❌ Audio playback error:', e.target.error);
                  setError('Failed to play audio. The recording may be corrupted.');
                }}
                onLoadedData={(e) => {
                  console.log('✅ Audio loaded successfully');
                  console.log(`   Duration: ${e.target.duration}s`);
                }}
                onCanPlay={() => console.log('✅ Audio ready to play')}
                onPlay={() => console.log('▶️ Audio playback started')}
                onPause={() => console.log('⏸️ Audio playback paused')}
                onVolumeChange={(e) => console.log(`🔊 Volume: ${e.target.volume}, Muted: ${e.target.muted}`)}
              />
              {/* Upload Status */}
              {uploadSuccess && (
                <div className="upload-success">
                  <span className="success-icon">✅</span>
                  <span>Recording saved to cloud successfully! Session ID: {sessionId?.substring(0, 8)}...</span>
                </div>
              )}

              {isUploading && (
                <div className="upload-progress">
                  <span className="loading-spinner">⏳</span>
                  <span>Uploading to secure storage...</span>
                </div>
              )}

              <div className="playback-actions">
                {!uploadSuccess && (
                  <button
                    className="btn-primary"
                    onClick={handleSaveRecording}
                    disabled={isUploading}
                  >
                    {isUploading ? '⏳ Saving...' : '☁️ Save to Cloud'}
                  </button>
                )}
                <button
                  className="btn-secondary"
                  onClick={() => {
                    const a = document.createElement('a');
                    a.href = recordedBlobUrl;
                    a.download = `lsi-recording-${Date.now()}.webm`;
                    a.click();
                  }}
                  disabled={isUploading}
                >
                  💾 Download Recording
                </button>
                <button
                  className="btn-secondary"
                  onClick={() => {
                    setRecordedBlobUrl(null);
                    setRecordedBlob(null);
                    setUploadSuccess(false);
                    setSessionId(null);
                  }}
                  disabled={isUploading}
                >
                  🗑️ Discard
                </button>
              </div>
            </div>
          )}

          {/* Faith Disclaimer */}
          <div className="faith-disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span>
              <strong>Demo Mode:</strong> This proof-of-concept demonstrates audio
              capture capabilities for personal spiritual reflection only. Production
              LSI will include end-to-end encryption and secure storage.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default AudioCaptureDemo;
