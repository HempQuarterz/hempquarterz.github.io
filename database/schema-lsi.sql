/**
 * All4Yah - Linguistic Spirit Interface (LSI) Database Schema
 *
 * FAITH ALIGNMENT: This schema supports personal spiritual reflection tools.
 * It does not claim to interpret divine meaning, but helps believers document
 * and reflect on their prayer experiences.
 *
 * Tables:
 * - prayer_sessions: Records of individual prayer/tongues sessions
 * - prayer_patterns: AI-detected phonetic and rhythmic patterns
 * - spiritual_tags: User-tagged emotional/spiritual experiences
 * - linguistic_echoes: Potential connections to ancient language roots
 * - session_analysis: AI-generated reflection insights
 */

-- ============================================================================
-- Table: prayer_sessions
-- Purpose: Main record of each prayer/tongues recording session
-- ============================================================================
CREATE TABLE IF NOT EXISTS prayer_sessions (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- User association (future: auth.users integration)
  user_id UUID, -- NULL for demo/anonymous use

  -- Session metadata
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL, -- Total recording duration

  -- Audio file reference (Supabase Storage)
  audio_file_path TEXT, -- e.g., "prayer-sessions/user123/2025-11-03-session1.webm"
  audio_file_size_kb INTEGER,
  audio_mime_type VARCHAR(50) DEFAULT 'audio/webm;codecs=opus',

  -- Encryption metadata
  is_encrypted BOOLEAN DEFAULT FALSE,
  encryption_key_id VARCHAR(100), -- Reference to user's encryption key

  -- Audio characteristics (captured during recording)
  sample_rate INTEGER DEFAULT 44100,
  bit_rate INTEGER DEFAULT 128000,
  channel_count INTEGER DEFAULT 1, -- Mono

  -- Session tags and notes
  session_title VARCHAR(200),
  user_notes TEXT,
  location VARCHAR(100), -- Optional: "Home Chapel", "Prayer Closet", etc.

  -- Spiritual context (user-provided)
  prayer_focus TEXT, -- What the user was praying about
  scripture_reference VARCHAR(100), -- e.g., "Psalms 23", "Romans 8"

  -- Analysis status
  analysis_status VARCHAR(20) DEFAULT 'pending', -- pending, processing, completed, failed
  analyzed_at TIMESTAMP WITH TIME ZONE,

  -- Soft delete
  deleted_at TIMESTAMP WITH TIME ZONE,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for prayer_sessions
CREATE INDEX idx_prayer_sessions_user_id ON prayer_sessions(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_prayer_sessions_recorded_at ON prayer_sessions(recorded_at DESC) WHERE deleted_at IS NULL;
CREATE INDEX idx_prayer_sessions_analysis_status ON prayer_sessions(analysis_status) WHERE deleted_at IS NULL;

-- ============================================================================
-- Table: prayer_patterns
-- Purpose: AI-detected phonetic, rhythmic, and tonal patterns
-- ============================================================================
CREATE TABLE IF NOT EXISTS prayer_patterns (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to prayer session
  session_id UUID NOT NULL REFERENCES prayer_sessions(id) ON DELETE CASCADE,

  -- Pattern timing (offset from session start)
  timestamp_offset_ms INTEGER NOT NULL, -- Milliseconds from start
  duration_ms INTEGER, -- Pattern duration

  -- Phonetic pattern data
  phoneme_sequence TEXT, -- e.g., "sha-la-ma-ka-ra"
  syllable_count INTEGER,

  -- Acoustic features
  fundamental_frequency_hz DECIMAL(10, 2), -- Average pitch
  intensity_db DECIMAL(10, 2), -- Volume/power
  tempo_bpm INTEGER, -- Beats per minute (rhythm)

  -- Pattern classification
  pattern_type VARCHAR(50), -- e.g., 'repetitive', 'crescendo', 'staccato', 'flowing'
  confidence_score DECIMAL(5, 4), -- 0.0000 to 1.0000

  -- AI model metadata
  detected_by VARCHAR(50), -- e.g., 'whisper-v3', 'deepgram-nova'
  model_version VARCHAR(20),

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for prayer_patterns
CREATE INDEX idx_prayer_patterns_session_id ON prayer_patterns(session_id);
CREATE INDEX idx_prayer_patterns_timestamp ON prayer_patterns(session_id, timestamp_offset_ms);

-- ============================================================================
-- Table: spiritual_tags
-- Purpose: User-tagged emotional and spiritual experiences
-- ============================================================================
CREATE TABLE IF NOT EXISTS spiritual_tags (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to prayer session
  session_id UUID NOT NULL REFERENCES prayer_sessions(id) ON DELETE CASCADE,

  -- Tag data
  tag_name VARCHAR(50) NOT NULL, -- e.g., 'peace', 'joy', 'weeping', 'power', 'breakthrough'
  tag_category VARCHAR(30), -- 'emotion', 'intensity', 'spiritual_gift', 'manifestation'

  -- Tag timing (optional - for specific moments in session)
  timestamp_offset_ms INTEGER, -- NULL = applies to entire session

  -- User notes
  tag_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for spiritual_tags
CREATE INDEX idx_spiritual_tags_session_id ON spiritual_tags(session_id);
CREATE INDEX idx_spiritual_tags_name ON spiritual_tags(tag_name);

-- ============================================================================
-- Table: linguistic_echoes
-- Purpose: Potential connections to ancient language roots (Hebrew, Greek, Aramaic)
-- ============================================================================
CREATE TABLE IF NOT EXISTS linguistic_echoes (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to prayer pattern
  pattern_id UUID NOT NULL REFERENCES prayer_patterns(id) ON DELETE CASCADE,
  session_id UUID NOT NULL REFERENCES prayer_sessions(id) ON DELETE CASCADE,

  -- Ancient language connection
  source_language VARCHAR(20) NOT NULL, -- 'hebrew', 'greek', 'aramaic', 'geez', 'latin'
  phonetic_match TEXT NOT NULL, -- The detected sound sequence

  -- Strong's Concordance integration
  strongs_number VARCHAR(10), -- e.g., 'H7307' (Ruach), 'G4151' (Pneuma)
  hebrew_word TEXT, -- e.g., 'רוּחַ' (Ruach)
  greek_word TEXT, -- e.g., 'πνεῦμα' (Pneuma)
  transliteration TEXT, -- e.g., 'ruach', 'pneuma'

  -- Meaning and context
  primary_meaning TEXT, -- e.g., 'Spirit, Wind, Breath'
  thematic_category VARCHAR(50), -- e.g., 'Holy Spirit', 'Worship', 'Healing', 'Deliverance'

  -- Scripture references
  scripture_references TEXT[], -- Array of refs like ['Genesis 1:2', 'John 3:8']

  -- Match confidence
  phonetic_similarity_score DECIMAL(5, 4), -- 0.0000 to 1.0000
  semantic_relevance_score DECIMAL(5, 4), -- AI-assessed contextual fit

  -- Gematria (numeric values)
  hebrew_gematria INTEGER, -- Hebrew letter values
  greek_isopsephy INTEGER, -- Greek letter values

  -- AI interpretation metadata
  detected_by VARCHAR(50), -- 'lsi-interpreter-v1'
  interpretation_notes TEXT,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for linguistic_echoes
CREATE INDEX idx_linguistic_echoes_pattern_id ON linguistic_echoes(pattern_id);
CREATE INDEX idx_linguistic_echoes_session_id ON linguistic_echoes(session_id);
CREATE INDEX idx_linguistic_echoes_strongs ON linguistic_echoes(strongs_number);
CREATE INDEX idx_linguistic_echoes_language ON linguistic_echoes(source_language);

-- ============================================================================
-- Table: session_analysis
-- Purpose: AI-generated reflection insights and spiritual themes
-- ============================================================================
CREATE TABLE IF NOT EXISTS session_analysis (
  -- Primary key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key to prayer session
  session_id UUID NOT NULL REFERENCES prayer_sessions(id) ON DELETE CASCADE,

  -- Overall analysis
  summary TEXT NOT NULL, -- Brief overview of session
  dominant_themes TEXT[], -- Array like ['renewal', 'healing', 'worship']

  -- Emotional/spiritual assessment
  overall_tone VARCHAR(50), -- 'peaceful', 'intense', 'joyful', 'sorrowful', 'reverent'
  intensity_level INTEGER CHECK (intensity_level BETWEEN 1 AND 10),

  -- Pattern summary
  total_patterns_detected INTEGER,
  most_frequent_phoneme TEXT,
  average_tempo_bpm INTEGER,
  tempo_variation VARCHAR(20), -- 'steady', 'accelerating', 'variable'

  -- Linguistic echoes summary
  primary_language_echoes VARCHAR(20), -- Most detected language
  top_strongs_references TEXT[], -- Most prominent Strong's numbers
  suggested_scripture_meditation TEXT[], -- Scripture suggestions for reflection

  -- AI-generated reflection prompt
  reflection_prompt TEXT, -- Question or prompt for user journaling

  -- Example interpretive output
  interpretive_summary TEXT, -- e.g., "Your utterance carries echoes of..."

  -- Disclaimer
  interpretation_disclaimer TEXT DEFAULT 'This analysis is for personal reflection only and does not claim divine interpretation. True understanding comes from Yah through the Ruach ha''Qodesh.',

  -- AI model metadata
  analyzed_by VARCHAR(50), -- 'lsi-interpreter-v1'
  model_version VARCHAR(20),
  analysis_duration_ms INTEGER,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Indexes for session_analysis
CREATE INDEX idx_session_analysis_session_id ON session_analysis(session_id);

-- ============================================================================
-- Row Level Security (RLS) Policies
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE prayer_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE spiritual_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE linguistic_echoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_analysis ENABLE ROW LEVEL SECURITY;

-- Policy: Anonymous users can only access their own sessions (future: auth integration)
-- For now, allow public read/write for demo purposes
CREATE POLICY "Public read access for prayer_sessions"
  ON prayer_sessions FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for prayer_sessions"
  ON prayer_sessions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public update access for prayer_sessions"
  ON prayer_sessions FOR UPDATE
  USING (true);

-- Similar policies for related tables
CREATE POLICY "Public read access for prayer_patterns"
  ON prayer_patterns FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for prayer_patterns"
  ON prayer_patterns FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access for spiritual_tags"
  ON spiritual_tags FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for spiritual_tags"
  ON spiritual_tags FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access for linguistic_echoes"
  ON linguistic_echoes FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for linguistic_echoes"
  ON linguistic_echoes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Public read access for session_analysis"
  ON session_analysis FOR SELECT
  USING (true);

CREATE POLICY "Public insert access for session_analysis"
  ON session_analysis FOR INSERT
  WITH CHECK (true);

-- ============================================================================
-- Functions
-- ============================================================================

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger: Auto-update updated_at on prayer_sessions
CREATE TRIGGER update_prayer_sessions_updated_at
  BEFORE UPDATE ON prayer_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Sample Data (for testing)
-- ============================================================================

-- Insert sample prayer session
INSERT INTO prayer_sessions (
  session_title,
  duration_seconds,
  audio_mime_type,
  prayer_focus,
  scripture_reference,
  user_notes
) VALUES (
  'Morning Prayer - November 3, 2025',
  120,
  'audio/webm;codecs=opus',
  'Seeking guidance and renewal',
  'Psalms 51',
  'Felt a deep sense of peace and the presence of Ruach ha''Qodesh'
);

-- ============================================================================
-- Comments
-- ============================================================================

COMMENT ON TABLE prayer_sessions IS 'Records of individual prayer/tongues recording sessions';
COMMENT ON TABLE prayer_patterns IS 'AI-detected phonetic, rhythmic, and tonal patterns';
COMMENT ON TABLE spiritual_tags IS 'User-tagged emotional and spiritual experiences';
COMMENT ON TABLE linguistic_echoes IS 'Potential connections to ancient language roots (Hebrew, Greek, Aramaic)';
COMMENT ON TABLE session_analysis IS 'AI-generated reflection insights and spiritual themes';

COMMENT ON COLUMN prayer_sessions.is_encrypted IS 'Future: End-to-end encryption flag';
COMMENT ON COLUMN prayer_patterns.detected_by IS 'AI model used for pattern detection (e.g., whisper-v3, deepgram-nova)';
COMMENT ON COLUMN linguistic_echoes.strongs_number IS 'Strong''s Concordance number for Hebrew (H####) or Greek (G####)';
COMMENT ON COLUMN linguistic_echoes.phonetic_similarity_score IS 'Confidence score (0-1) for phonetic match';
COMMENT ON COLUMN session_analysis.interpretation_disclaimer IS 'Faith alignment: Reflection tool, not divine revelation';
