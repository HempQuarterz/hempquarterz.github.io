/**
 * Session Detail View - Full Prayer Session Analysis Display
 *
 * Displays complete session data including:
 * - Audio playback
 * - AI-generated insights
 * - Linguistic echo detection results
 * - Acoustic pattern analysis
 * - Personal notes and tags
 * - Scripture references
 *
 * FAITH ALIGNMENT: Presents AI analysis as interpretive suggestions,
 * not authoritative spiritual guidance. Encourages Scripture meditation
 * and community discernment.
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import '../../styles/lsi/session-detail.css';

const SessionDetailView = ({ sessionId, onClose }) => {
  // State
  const [session, setSession] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [tags, setTags] = useState([]);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tag input
  const [newTag, setNewTag] = useState('');
  const [isAddingTag, setIsAddingTag] = useState(false);

  // Audio playback
  const [audioUrl, setAudioUrl] = useState(null);
  const [audioError, setAudioError] = useState(null);

  /**
   * Load session data on mount
   */
  useEffect(() => {
    if (sessionId) {
      loadSessionData();
    }
  }, [sessionId]);

  /**
   * Load complete session data
   */
  const loadSessionData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Load session record
      const { data: sessionData, error: sessionError } = await supabase
        .from('prayer_sessions')
        .select('*')
        .eq('id', sessionId)
        .single();

      if (sessionError) throw sessionError;
      setSession(sessionData);
      setNotes(sessionData.personal_notes || '');

      // Load analysis
      const { data: analysisData, error: analysisError } = await supabase
        .from('session_analysis')
        .select('*')
        .eq('session_id', sessionId)
        .eq('analysis_type', 'ai_interpretation')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (analysisError && analysisError.code !== 'PGRST116') {
        throw analysisError;
      }
      setAnalysis(analysisData);

      // Load tags
      const { data: tagsData, error: tagsError } = await supabase
        .from('session_tags')
        .select('*')
        .eq('session_id', sessionId);

      if (tagsError) throw tagsError;
      setTags(tagsData || []);

      // Load audio file URL
      if (sessionData.audio_file_path) {
        const { data: urlData } = supabase.storage
          .from('lsi-audio-sessions')
          .getPublicUrl(sessionData.audio_file_path);

        if (urlData?.publicUrl) {
          setAudioUrl(urlData.publicUrl);
        }
      }

      console.log(`✅ Loaded session ${sessionId} details`);

    } catch (err) {
      console.error('❌ Error loading session data:', err);
      setError(err.message || 'Failed to load session details');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Save personal notes
   */
  const handleSaveNotes = async () => {
    try {
      const { error: updateError } = await supabase
        .from('prayer_sessions')
        .update({ personal_notes: notes })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      setIsEditingNotes(false);
      console.log('✅ Notes saved');

    } catch (err) {
      console.error('❌ Error saving notes:', err);
      setError(err.message);
    }
  };

  /**
   * Add tag to session
   */
  const handleAddTag = async () => {
    if (!newTag.trim()) return;

    try {
      const { data, error: insertError } = await supabase
        .from('session_tags')
        .insert({
          session_id: sessionId,
          tag_name: newTag.trim()
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setTags([...tags, data]);
      setNewTag('');
      setIsAddingTag(false);
      console.log(`✅ Added tag: ${newTag}`);

    } catch (err) {
      console.error('❌ Error adding tag:', err);
      setError(err.message);
    }
  };

  /**
   * Remove tag from session
   */
  const handleRemoveTag = async (tagId) => {
    try {
      const { error: deleteError } = await supabase
        .from('session_tags')
        .delete()
        .eq('id', tagId);

      if (deleteError) throw deleteError;

      setTags(tags.filter(t => t.id !== tagId));
      console.log(`✅ Removed tag`);

    } catch (err) {
      console.error('❌ Error removing tag:', err);
      setError(err.message);
    }
  };

  /**
   * Format duration
   */
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  /**
   * Format date
   */
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="session-detail loading">
        <div className="loading-spinner">⏳</div>
        <p>Loading session details...</p>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="session-detail error">
        <div className="error-icon">⚠️</div>
        <p>{error || 'Session not found'}</p>
        <button onClick={onClose} className="btn-secondary">Close</button>
      </div>
    );
  }

  const insights = analysis?.analysis_data || null;

  return (
    <div className="session-detail">
      {/* Header */}
      <div className="detail-header">
        <div>
          <h2 className="detail-title">
            {session.session_title || `Prayer Session`}
          </h2>
          <p className="detail-date">{formatDate(session.created_at)}</p>
        </div>
        <button onClick={onClose} className="btn-close">✕</button>
      </div>

      {/* Session Metadata */}
      <div className="session-metadata">
        <div className="metadata-card">
          <div className="metadata-label">Duration</div>
          <div className="metadata-value">⏱️ {formatDuration(session.duration_seconds || 0)}</div>
        </div>
        <div className="metadata-card">
          <div className="metadata-label">Status</div>
          <div className="metadata-value">
            {session.analysis_status === 'completed' ? '✅' : '⏳'}
            {' '}{session.analysis_status || 'pending'}
          </div>
        </div>
        <div className="metadata-card">
          <div className="metadata-label">Sample Rate</div>
          <div className="metadata-value">{session.sample_rate || 44100} Hz</div>
        </div>
      </div>

      {/* Audio Playback */}
      {audioUrl && (
        <div className="audio-section">
          <h3>🎙️ Audio Recording</h3>
          <audio
            controls
            src={audioUrl}
            className="audio-player-full"
            onError={() => setAudioError('Failed to load audio file')}
          />
          {audioError && <p className="audio-error">{audioError}</p>}
        </div>
      )}

      {/* AI Insights */}
      {insights && (
        <div className="insights-section">
          <h3>🤖 AI-Generated Insights</h3>

          {/* Summary */}
          <div className="insight-card summary-card">
            <h4>Summary</h4>
            <p>{insights.summary}</p>
          </div>

          {/* Detected Echoes */}
          {insights.detectedEchoes && insights.detectedEchoes.length > 0 && (
            <div className="insight-card echoes-card">
              <h4>🔊 Linguistic Echoes Detected</h4>
              <div className="echoes-list">
                {insights.detectedEchoes.map((echo, i) => (
                  <div key={i} className="echo-item">
                    <div className="echo-header">
                      <span className="echo-word">{echo.word}</span>
                      <span className="echo-transliteration">({echo.transliteration})</span>
                      <span className="echo-strongs">{echo.strongsNumber}</span>
                    </div>
                    <div className="echo-meaning">{echo.meaning}</div>
                    <div className="echo-similarity">
                      Similarity: {(echo.similarity * 100).toFixed(1)}%
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Acoustic Themes */}
          {insights.acousticThemes && insights.acousticThemes.length > 0 && (
            <div className="insight-card themes-card">
              <h4>🎵 Acoustic Themes</h4>
              <ul className="themes-list">
                {insights.acousticThemes.map((theme, i) => (
                  <li key={i}>{theme}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Spiritual Insights */}
          {insights.spiritualInsights && insights.spiritualInsights.length > 0 && (
            <div className="insight-card spiritual-card">
              <h4>💡 Spiritual Insights</h4>
              <ul className="insights-list">
                {insights.spiritualInsights.map((insight, i) => (
                  <li key={i}>{insight}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Reflection Prompts */}
          {insights.reflectionPrompts && insights.reflectionPrompts.length > 0 && (
            <div className="insight-card reflection-card">
              <h4>🤔 Reflection Questions</h4>
              <ul className="reflection-list">
                {insights.reflectionPrompts.map((prompt, i) => (
                  <li key={i}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scripture References */}
          {insights.scriptureReferences && insights.scriptureReferences.length > 0 && (
            <div className="insight-card scripture-card">
              <h4>📖 Related Scripture</h4>
              <ul className="scripture-list">
                {insights.scriptureReferences.map((ref, i) => (
                  <li key={i}>{ref}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="ai-disclaimer">
            <span className="disclaimer-icon">⚠️</span>
            <span>{insights.disclaimer}</span>
          </div>
        </div>
      )}

      {/* Tags */}
      <div className="tags-section">
        <h3>🏷️ Tags</h3>
        <div className="tags-container">
          {tags.map(tag => (
            <div key={tag.id} className="tag-pill">
              <span>{tag.tag_name}</span>
              <button
                onClick={() => handleRemoveTag(tag.id)}
                className="tag-remove"
                aria-label="Remove tag"
              >
                ✕
              </button>
            </div>
          ))}
          {isAddingTag ? (
            <div className="tag-input-group">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
                placeholder="Tag name..."
                className="tag-input"
                autoFocus
              />
              <button onClick={handleAddTag} className="btn-tag-save">✓</button>
              <button onClick={() => { setIsAddingTag(false); setNewTag(''); }} className="btn-tag-cancel">✕</button>
            </div>
          ) : (
            <button onClick={() => setIsAddingTag(true)} className="btn-add-tag">+ Add Tag</button>
          )}
        </div>
      </div>

      {/* Personal Notes */}
      <div className="notes-section">
        <h3>📝 Personal Notes</h3>
        {isEditingNotes ? (
          <div className="notes-editor">
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="notes-textarea"
              rows={6}
              placeholder="Write your personal reflections, prayers answered, or insights gained..."
            />
            <div className="notes-actions">
              <button onClick={handleSaveNotes} className="btn-primary">Save Notes</button>
              <button
                onClick={() => { setIsEditingNotes(false); setNotes(session.personal_notes || ''); }}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="notes-display">
            {notes ? (
              <p className="notes-text">{notes}</p>
            ) : (
              <p className="notes-placeholder">No notes yet. Click "Edit Notes" to add your reflections.</p>
            )}
            <button onClick={() => setIsEditingNotes(true)} className="btn-secondary">Edit Notes</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SessionDetailView;
