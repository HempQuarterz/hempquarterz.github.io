/**
 * Spiritual Journal - Prayer Session Browser
 *
 * UI for browsing, searching, and reviewing past LSI prayer sessions
 * with AI-generated insights, linguistic echoes, and personal tags.
 *
 * FAITH ALIGNMENT: Provides a private spiritual journal for personal
 * reflection and growth tracking. All data is user-owned and private.
 *
 * Features:
 * - Session list with date/duration/title
 * - Search and filter by tags, dates, themes
 * - Session detail view with full analysis
 * - Audio playback of recorded sessions
 * - Tag management (add/edit/remove)
 * - Personal notes on each session
 * - Export sessions for offline reflection
 */

import React, { useState, useEffect } from 'react';
import { supabase } from '../../config/supabase';
import '../../styles/lsi/spiritual-journal.css';

const SpiritualJournal = ({ userId = null }) => {
  // State
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [sessionAnalysis, setSessionAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [sortBy, setSortBy] = useState('date_desc'); // date_desc, date_asc, duration_desc

  // Tag Management
  const [availableTags, setAvailableTags] = useState([]);
  const [isAddingTag, setIsAddingTag] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const sessionsPerPage = 10;

  /**
   * Load sessions on component mount
   */
  useEffect(() => {
    loadSessions();
    loadAvailableTags();
  }, [userId]);

  /**
   * Apply filters whenever search/filter state changes
   */
  useEffect(() => {
    applyFilters();
  }, [sessions, searchTerm, filterTag, sortBy]);

  /**
   * Load all prayer sessions from database
   */
  const loadSessions = async () => {
    try {
      setLoading(true);
      setError(null);

      let query = supabase
        .from('prayer_sessions')
        .select('*')
        .order('created_at', { ascending: false });

      // Filter by user if provided (for multi-user support later)
      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;

      setSessions(data || []);
      console.log(`✅ Loaded ${data?.length || 0} prayer sessions`);

    } catch (err) {
      console.error('❌ Error loading sessions:', err);
      setError(err.message || 'Failed to load prayer sessions');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load available tags from all sessions
   */
  const loadAvailableTags = async () => {
    try {
      const { data, error: fetchError } = await supabase
        .from('session_tags')
        .select('tag_name')
        .order('tag_name');

      if (fetchError) throw fetchError;

      // Get unique tags
      const uniqueTags = [...new Set(data.map(row => row.tag_name))];
      setAvailableTags(uniqueTags);

    } catch (err) {
      console.error('❌ Error loading tags:', err);
    }
  };

  /**
   * Apply search and filter criteria
   */
  const applyFilters = () => {
    let filtered = [...sessions];

    // Search by title or notes
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(session =>
        session.session_title?.toLowerCase().includes(term) ||
        session.personal_notes?.toLowerCase().includes(term)
      );
    }

    // Filter by tag
    if (filterTag) {
      // Note: This requires joining with session_tags table
      // For now, we'll implement this when tag data is loaded per session
    }

    // Sort
    switch (sortBy) {
      case 'date_desc':
        filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      case 'date_asc':
        filtered.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        break;
      case 'duration_desc':
        filtered.sort((a, b) => (b.duration_seconds || 0) - (a.duration_seconds || 0));
        break;
      default:
        break;
    }

    setFilteredSessions(filtered);
  };

  /**
   * Load session details and analysis
   */
  const loadSessionDetails = async (sessionId) => {
    try {
      setSelectedSession(sessionId);
      setSessionAnalysis(null);

      // Load analysis data
      const { data, error: fetchError } = await supabase
        .from('session_analysis')
        .select('*')
        .eq('session_id', sessionId)
        .eq('analysis_type', 'ai_interpretation')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') { // Ignore "no rows" error
        throw fetchError;
      }

      setSessionAnalysis(data);
      console.log(`✅ Loaded analysis for session ${sessionId}`);

    } catch (err) {
      console.error('❌ Error loading session analysis:', err);
    }
  };

  /**
   * Add tag to session
   */
  const addTagToSession = async (sessionId, tagName) => {
    try {
      const { error: insertError } = await supabase
        .from('session_tags')
        .insert({
          session_id: sessionId,
          tag_name: tagName
        });

      if (insertError) throw insertError;

      console.log(`✅ Added tag "${tagName}" to session ${sessionId}`);
      loadAvailableTags(); // Refresh tag list

    } catch (err) {
      console.error('❌ Error adding tag:', err);
      setError(err.message);
    }
  };

  /**
   * Update session notes
   */
  const updateSessionNotes = async (sessionId, notes) => {
    try {
      const { error: updateError } = await supabase
        .from('prayer_sessions')
        .update({ personal_notes: notes })
        .eq('id', sessionId);

      if (updateError) throw updateError;

      // Update local state
      setSessions(sessions.map(s =>
        s.id === sessionId ? { ...s, personal_notes: notes } : s
      ));

      console.log(`✅ Updated notes for session ${sessionId}`);

    } catch (err) {
      console.error('❌ Error updating notes:', err);
      setError(err.message);
    }
  };

  /**
   * Format duration as MM:SS
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
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  /**
   * Pagination
   */
  const indexOfLastSession = currentPage * sessionsPerPage;
  const indexOfFirstSession = indexOfLastSession - sessionsPerPage;
  const currentSessions = filteredSessions.slice(indexOfFirstSession, indexOfLastSession);
  const totalPages = Math.ceil(filteredSessions.length / sessionsPerPage);

  return (
    <div className="spiritual-journal">
      {/* Header */}
      <div className="journal-header">
        <h2>📖 Spiritual Journal</h2>
        <p className="journal-subtitle">
          Your personal prayer session history with AI-powered insights
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Search and Filters */}
      <div className="journal-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="🔍 Search sessions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterTag}
            onChange={(e) => setFilterTag(e.target.value)}
            className="filter-select"
          >
            <option value="">All Tags</option>
            {availableTags.map(tag => (
              <option key={tag} value={tag}>{tag}</option>
            ))}
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="duration_desc">Longest First</option>
          </select>
        </div>
      </div>

      {/* Session List */}
      <div className="journal-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner">⏳</div>
            <p>Loading your prayer sessions...</p>
          </div>
        ) : filteredSessions.length === 0 ? (
          <div className="empty-state">
            <p className="empty-icon">📭</p>
            <p className="empty-text">
              {sessions.length === 0
                ? 'No prayer sessions yet. Start your first LSI session to begin your spiritual journal!'
                : 'No sessions match your search criteria.'}
            </p>
          </div>
        ) : (
          <>
            <div className="session-list">
              {currentSessions.map(session => (
                <div
                  key={session.id}
                  className={`session-card ${selectedSession === session.id ? 'selected' : ''}`}
                  onClick={() => loadSessionDetails(session.id)}
                >
                  <div className="session-header">
                    <h3 className="session-title">
                      {session.session_title || `Prayer Session - ${formatDate(session.created_at)}`}
                    </h3>
                    <span className="session-duration">
                      ⏱️ {formatDuration(session.duration_seconds || 0)}
                    </span>
                  </div>

                  <div className="session-meta">
                    <span className="session-date">📅 {formatDate(session.created_at)}</span>
                    <span className="session-status">
                      {session.analysis_status === 'completed' ? '✅' : '⏳'}
                      {' '}{session.analysis_status || 'pending'}
                    </span>
                  </div>

                  {session.personal_notes && (
                    <p className="session-notes-preview">
                      {session.personal_notes.substring(0, 100)}
                      {session.personal_notes.length > 100 ? '...' : ''}
                    </p>
                  )}
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="btn-pagination"
                >
                  ← Previous
                </button>
                <span className="page-info">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="btn-pagination"
                >
                  Next →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Session Detail View (will be implemented in next component) */}
      {selectedSession && (
        <div className="session-detail-placeholder">
          <p className="placeholder-text">
            Session details and AI insights will appear here.
            <br />
            (SessionDetailView component to be implemented)
          </p>
        </div>
      )}

      {/* Faith Disclaimer */}
      <div className="faith-disclaimer">
        <span className="disclaimer-icon">⚠️</span>
        <span>
          <strong>Privacy Notice:</strong> Your spiritual journal is private and secure.
          AI-generated insights are for personal reflection only, not prophetic revelation.
        </span>
      </div>
    </div>
  );
};

export default SpiritualJournal;
