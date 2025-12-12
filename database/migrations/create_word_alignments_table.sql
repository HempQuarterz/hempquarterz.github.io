-- Migration: Create word_alignments table for interlinear alignment
-- Purpose: Store word-by-word correspondences between manuscripts in different languages
-- Date: 2025-01-22
-- Phase: Phase 3 - Interlinear Alignment

-- Create word_alignments table
CREATE TABLE IF NOT EXISTS word_alignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Source verse (primary manuscript, usually Hebrew OT or Greek NT)
  source_manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE NOT NULL,
  source_book VARCHAR(10) NOT NULL,
  source_chapter INTEGER NOT NULL CHECK (source_chapter > 0),
  source_verse INTEGER NOT NULL CHECK (source_verse > 0),
  source_word_position INTEGER NOT NULL CHECK (source_word_position >= 0),
  source_word TEXT NOT NULL,
  source_lemma TEXT,                      -- Dictionary form (e.g., λόγος → λέγω)
  source_strongs VARCHAR(20),             -- Strong's number (e.g., H3068, G2316)
  source_morphology JSONB,                -- Detailed parsing (tense, mood, case, etc.)

  -- Target verse (translation/parallel manuscript)
  target_manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE NOT NULL,
  target_book VARCHAR(10) NOT NULL,
  target_chapter INTEGER NOT NULL CHECK (target_chapter > 0),
  target_verse INTEGER NOT NULL CHECK (target_verse > 0),
  target_word_position INTEGER NOT NULL CHECK (target_word_position >= 0),
  target_word TEXT NOT NULL,
  target_lemma TEXT,                      -- Dictionary form if applicable
  target_strongs VARCHAR(20),             -- Strong's number if available

  -- Alignment metadata
  alignment_confidence DECIMAL(3,2) CHECK (alignment_confidence >= 0 AND alignment_confidence <= 1),
  alignment_type VARCHAR(20) CHECK (alignment_type IN ('one-to-one', 'one-to-many', 'many-to-one', 'phrase', 'null-alignment')),
  alignment_method VARCHAR(20) CHECK (alignment_method IN ('manual', 'strongs', 'lexical', 'statistical')),
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Unique constraint: one alignment per source word position
  CONSTRAINT word_alignments_source_unique UNIQUE (
    source_manuscript_id,
    source_book,
    source_chapter,
    source_verse,
    source_word_position
  )
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_word_alignments_source
  ON word_alignments (source_manuscript_id, source_book, source_chapter, source_verse);

CREATE INDEX IF NOT EXISTS idx_word_alignments_target
  ON word_alignments (target_manuscript_id, target_book, target_chapter, target_verse);

CREATE INDEX IF NOT EXISTS idx_word_alignments_strongs_source
  ON word_alignments (source_strongs)
  WHERE source_strongs IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_word_alignments_strongs_target
  ON word_alignments (target_strongs)
  WHERE target_strongs IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_word_alignments_confidence
  ON word_alignments (alignment_confidence DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE word_alignments ENABLE ROW LEVEL SECURITY;

-- Create policy: Public read access
CREATE POLICY word_alignments_read_policy
  ON word_alignments
  FOR SELECT
  USING (true);

-- Comments for documentation
COMMENT ON TABLE word_alignments IS 'Word-by-word alignment data for interlinear display across manuscripts';
COMMENT ON COLUMN word_alignments.source_manuscript_id IS 'Reference to original-language manuscript (WLC, SBLGNT, etc.)';
COMMENT ON COLUMN word_alignments.target_manuscript_id IS 'Reference to translation manuscript (WEB, etc.)';
COMMENT ON COLUMN word_alignments.source_strongs IS 'Strong''s concordance number for source word (e.g., H3068, G2316)';
COMMENT ON COLUMN word_alignments.alignment_confidence IS 'Confidence score 0.00-1.00 (manual=1.0, auto=varies)';
COMMENT ON COLUMN word_alignments.alignment_type IS 'Type: one-to-one, one-to-many, many-to-one, phrase, null-alignment';
COMMENT ON COLUMN word_alignments.alignment_method IS 'Method: manual, strongs, lexical, statistical';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'word_alignments table created successfully with indexes and RLS policies';
END
$$;
