/**
 * AudioPlayer Component - Tier 8
 * Text-to-Speech audio playback for Bible verses using Web Speech API
 * Provides voice reading of verses in multiple languages
 */

import React, { useState, useEffect, useRef } from 'react';
import '../styles/audioPlayer.css';

const AudioPlayer = ({ verseText, verseReference, manuscript = 'WEB', onPlaybackComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [speechRate, setSpeechRate] = useState(1.0);
  const [speechPitch, setSpeechPitch] = useState(1.0);
  const [volume, setVolume] = useState(1.0);
  const [error, setError] = useState(null);
  const [browserSupport, setBrowserSupport] = useState(true);

  const utteranceRef = useRef(null);

  /**
   * Initialize Web Speech API and load available voices
   */
  useEffect(() => {
    // Check browser support
    if (!('speechSynthesis' in window)) {
      setBrowserSupport(false);
      setError('Your browser does not support text-to-speech. Please try Chrome, Edge, or Safari.');
      return;
    }

    // Load available voices
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();

      if (voices.length > 0) {
        setAvailableVoices(voices);

        // Select default voice based on manuscript language
        const defaultVoice = selectDefaultVoice(voices, manuscript);
        setSelectedVoice(defaultVoice);
      }
    };

    // Load voices immediately
    loadVoices();

    // Some browsers require waiting for voiceschanged event
    window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

    return () => {
      window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      stopAudio();
    };
  }, [manuscript]);

  /**
   * Select default voice based on manuscript language
   */
  const selectDefaultVoice = (voices, manuscriptCode) => {
    // Language mapping for manuscripts
    const manuscriptLanguages = {
      'WLC': 'he', // Hebrew
      'DSS': 'he', // Hebrew
      'SBLGNT': 'el', // Greek
      'LXX': 'el', // Greek
      'ONKELOS': 'ar', // Aramaic (fallback to Arabic)
      'VUL': 'la', // Latin
      'WEB': 'en', // English
      'BYZMT': 'el', // Greek
      'TR': 'el', // Greek
      'N1904': 'el', // Greek
      'SIN': 'el', // Greek
    };

    const preferredLang = manuscriptLanguages[manuscriptCode] || 'en';

    // Try to find a voice matching the preferred language
    let voice = voices.find(v => v.lang.startsWith(preferredLang));

    // Fallback to English
    if (!voice) {
      voice = voices.find(v => v.lang.startsWith('en'));
    }

    // Ultimate fallback to first available voice
    if (!voice) {
      voice = voices[0];
    }

    return voice;
  };

  /**
   * Play audio using Web Speech API
   */
  const playAudio = () => {
    if (!browserSupport || !verseText) return;

    try {
      // Cancel any existing speech
      window.speechSynthesis.cancel();

      // Create new utterance
      const utterance = new SpeechSynthesisUtterance(verseText);

      // Configure utterance
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }
      utterance.rate = speechRate;
      utterance.pitch = speechPitch;
      utterance.volume = volume;

      // Event listeners
      utterance.onstart = () => {
        setIsPlaying(true);
        setIsPaused(false);
        setError(null);
      };

      utterance.onend = () => {
        setIsPlaying(false);
        setIsPaused(false);
        if (onPlaybackComplete) {
          onPlaybackComplete();
        }
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event);
        setIsPlaying(false);
        setIsPaused(false);
        setError(`Playback error: ${event.error}`);
      };

      utterance.onpause = () => {
        setIsPaused(true);
      };

      utterance.onresume = () => {
        setIsPaused(false);
      };

      // Store reference
      utteranceRef.current = utterance;

      // Start speaking
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.error('Failed to start audio playback:', err);
      setError('Failed to start audio playback');
      setIsPlaying(false);
    }
  };

  /**
   * Pause audio
   */
  const pauseAudio = () => {
    if (window.speechSynthesis.speaking && !window.speechSynthesis.paused) {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  };

  /**
   * Resume audio
   */
  const resumeAudio = () => {
    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    }
  };

  /**
   * Stop audio
   */
  const stopAudio = () => {
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    utteranceRef.current = null;
  };

  /**
   * Handle voice selection change
   */
  const handleVoiceChange = (event) => {
    const voiceName = event.target.value;
    const voice = availableVoices.find(v => v.name === voiceName);
    setSelectedVoice(voice);

    // Restart playback if currently playing
    if (isPlaying) {
      stopAudio();
      setTimeout(playAudio, 100);
    }
  };

  /**
   * Handle rate change
   */
  const handleRateChange = (event) => {
    setSpeechRate(parseFloat(event.target.value));
  };

  /**
   * Handle pitch change
   */
  const handlePitchChange = (event) => {
    setSpeechPitch(parseFloat(event.target.value));
  };

  /**
   * Handle volume change
   */
  const handleVolumeChange = (event) => {
    const newVolume = parseFloat(event.target.value);
    setVolume(newVolume);

    // Update volume if currently playing
    if (utteranceRef.current) {
      utteranceRef.current.volume = newVolume;
    }
  };

  if (!browserSupport) {
    return (
      <div className="audio-player-container">
        <div className="audio-error">
          <strong>⚠️ Text-to-Speech Not Supported</strong>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!verseText) {
    return null;
  }

  return (
    <div className="audio-player-container">
      {/* Header */}
      <div className="audio-header">
        <h3>🎧 Audio Playback</h3>
        <p>Listen to {verseReference} read aloud</p>
      </div>

      {/* Main Controls */}
      <div className="audio-controls">
        <div className="playback-buttons">
          {!isPlaying ? (
            <button className="control-btn play-btn" onClick={playAudio} title="Play">
              ▶️ Play
            </button>
          ) : isPaused ? (
            <button className="control-btn resume-btn" onClick={resumeAudio} title="Resume">
              ▶️ Resume
            </button>
          ) : (
            <button className="control-btn pause-btn" onClick={pauseAudio} title="Pause">
              ⏸️ Pause
            </button>
          )}

          <button
            className="control-btn stop-btn"
            onClick={stopAudio}
            disabled={!isPlaying}
            title="Stop"
          >
            ⏹️ Stop
          </button>
        </div>

        {/* Playback Status */}
        {isPlaying && (
          <div className="playback-status">
            <div className="status-indicator">
              <span className="pulse-dot"></span>
              {isPaused ? 'Paused' : 'Playing...'}
            </div>
          </div>
        )}
      </div>

      {/* Voice Selection */}
      <div className="audio-settings">
        <div className="setting-group">
          <label htmlFor="voice-select">
            🗣️ Voice:
          </label>
          <select
            id="voice-select"
            value={selectedVoice?.name || ''}
            onChange={handleVoiceChange}
            disabled={availableVoices.length === 0}
          >
            {availableVoices.length === 0 ? (
              <option>Loading voices...</option>
            ) : (
              availableVoices.map(voice => (
                <option key={voice.name} value={voice.name}>
                  {voice.name} ({voice.lang})
                </option>
              ))
            )}
          </select>
        </div>

        <div className="setting-group">
          <label htmlFor="rate-slider">
            ⏩ Speed: {speechRate.toFixed(1)}x
          </label>
          <input
            id="rate-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechRate}
            onChange={handleRateChange}
          />
        </div>

        <div className="setting-group">
          <label htmlFor="pitch-slider">
            🎵 Pitch: {speechPitch.toFixed(1)}
          </label>
          <input
            id="pitch-slider"
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={speechPitch}
            onChange={handlePitchChange}
          />
        </div>

        <div className="setting-group">
          <label htmlFor="volume-slider">
            🔊 Volume: {Math.round(volume * 100)}%
          </label>
          <input
            id="volume-slider"
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={volume}
            onChange={handleVolumeChange}
          />
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="audio-error-message">
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Info Footer */}
      <div className="audio-footer">
        <p>
          <strong>How it works:</strong> This feature uses your browser's built-in text-to-speech
          engine to read verses aloud. Voice quality and language support vary by browser and
          operating system. All audio is generated locally - no data is sent to external servers.
        </p>
      </div>
    </div>
  );
};

export default AudioPlayer;
