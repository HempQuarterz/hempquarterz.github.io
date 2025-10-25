-- ============================================================================
-- MIGRATION: Add Provenance Ledger and Theophoric Names Tables
-- Date: 2025-01-24
-- Purpose: Phase 1 - Add confidence tracking, provenance logging, and
--          theophoric names database for divine name restoration
-- ============================================================================

-- ============================================================================
-- TABLE: provenance_ledger (Immutable audit trail for restoration decisions)
-- ============================================================================
CREATE TABLE IF NOT EXISTS provenance_ledger (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  restoration_type VARCHAR(20) NOT NULL CHECK (restoration_type IN ('name', 'translation', 'variant')),
  original_text TEXT NOT NULL,
  restored_text TEXT NOT NULL,
  confidence_score DECIMAL(5,4) NOT NULL CHECK (confidence_score >= 0.0 AND confidence_score <= 1.0),
  method VARCHAR(50) NOT NULL, -- 'strongs_match', 'pattern_match', 'ai_model', 'manual'
  model_version VARCHAR(20) DEFAULT 'v1.0', -- 'v1.0', 'SRM-v2.1', etc.
  reasoning JSONB, -- Full decision reasoning with context
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  provenance_hash TEXT NOT NULL, -- SHA-256 hash for immutability verification
  UNIQUE(verse_id, restoration_type, original_text, timestamp)
);

-- Indexes for provenance ledger
CREATE INDEX idx_provenance_verse ON provenance_ledger(verse_id);
CREATE INDEX idx_provenance_confidence ON provenance_ledger(confidence_score DESC);
CREATE INDEX idx_provenance_method ON provenance_ledger(method);
CREATE INDEX idx_provenance_timestamp ON provenance_ledger(timestamp DESC);

-- RLS for provenance ledger
ALTER TABLE provenance_ledger ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON provenance_ledger FOR SELECT USING (true);
CREATE POLICY "Service role write access" ON provenance_ledger FOR INSERT
  WITH CHECK (true); -- Only service role can write

-- ============================================================================
-- TABLE: theophoric_names (153+ Hebrew names containing divine element)
-- ============================================================================
CREATE TABLE IF NOT EXISTS theophoric_names (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name_hebrew TEXT NOT NULL,
  name_transliteration TEXT,
  name_english TEXT NOT NULL,
  theophoric_element TEXT NOT NULL CHECK (theophoric_element IN ('Yahu-', '-yahu', '-yah', 'Yah-', 'El-', '-el')),
  strong_number VARCHAR(10), -- Link to lexicon entry (e.g., 'H3091')
  meaning TEXT, -- e.g., "Yahuah saves"
  occurrences INT DEFAULT 0,
  first_occurrence TEXT, -- e.g., "Genesis 4:26" or book/chapter/verse reference
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(name_hebrew, name_english)
);

-- Indexes for theophoric names
CREATE INDEX idx_theophoric_element ON theophoric_names(theophoric_element);
CREATE INDEX idx_theophoric_strongs ON theophoric_names(strong_number);
CREATE INDEX idx_theophoric_english ON theophoric_names(name_english);

-- RLS for theophoric names
ALTER TABLE theophoric_names ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON theophoric_names FOR SELECT USING (true);

-- ============================================================================
-- TABLE: verse_alignments (Cross-manuscript verse alignment scores)
-- ============================================================================
CREATE TABLE IF NOT EXISTS verse_alignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verse_wlc_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  verse_lxx_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  verse_sblgnt_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  verse_web_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  alignment_score DECIMAL(4,3) CHECK (alignment_score >= 0.000 AND alignment_score <= 1.000),
  alignment_method VARCHAR(20) DEFAULT 'manual' CHECK (alignment_method IN ('bert', 'manual', 'heuristic', 'ai')),
  alignment_metadata JSONB, -- Store detailed alignment information
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for verse alignments
CREATE INDEX idx_alignments_wlc ON verse_alignments(verse_wlc_id);
CREATE INDEX idx_alignments_lxx ON verse_alignments(verse_lxx_id);
CREATE INDEX idx_alignments_sblgnt ON verse_alignments(verse_sblgnt_id);
CREATE INDEX idx_alignments_web ON verse_alignments(verse_web_id);
CREATE INDEX idx_alignments_score ON verse_alignments(alignment_score DESC);

-- RLS for verse alignments
ALTER TABLE verse_alignments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON verse_alignments FOR SELECT USING (true);

-- ============================================================================
-- TABLE: textual_variants (Manuscript variant tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS textual_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  book VARCHAR(3) NOT NULL,
  chapter INT NOT NULL CHECK (chapter > 0),
  verse INT NOT NULL CHECK (verse > 0),
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  variant_text TEXT NOT NULL,
  variant_type VARCHAR(20) CHECK (variant_type IN ('omission', 'addition', 'substitution', 'word_order', 'spelling')),
  significance VARCHAR(10) CHECK (significance IN ('major', 'minor', 'spelling')),
  notes TEXT,
  scholarly_sources TEXT[], -- Array of citations
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for textual variants
CREATE INDEX idx_variants_reference ON textual_variants(book, chapter, verse);
CREATE INDEX idx_variants_manuscript ON textual_variants(manuscript_id);
CREATE INDEX idx_variants_significance ON textual_variants(significance);

-- RLS for textual variants
ALTER TABLE textual_variants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read access" ON textual_variants FOR SELECT USING (true);

-- ============================================================================
-- Update existing tables
-- ============================================================================

-- Add confidence_score column to existing translations table (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='translations' AND column_name='confidence_score'
  ) THEN
    ALTER TABLE translations
    ADD COLUMN confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00);
  END IF;
END $$;

-- ============================================================================
-- Triggers for updated_at
-- ============================================================================
CREATE TRIGGER update_verse_alignments_updated_at BEFORE UPDATE ON verse_alignments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Comments for documentation
-- ============================================================================
COMMENT ON TABLE provenance_ledger IS 'Immutable audit trail for all divine name restoration decisions with confidence scores and SHA-256 provenance hashing';
COMMENT ON TABLE theophoric_names IS 'Database of 153+ Hebrew names containing divine elements (Yahu-, -yahu, -yah) providing linguistic evidence for Yahuah pronunciation';
COMMENT ON TABLE verse_alignments IS 'Cross-manuscript verse alignment scores for parallel corpus analysis (WLC ↔ LXX ↔ SBLGNT ↔ WEB)';
COMMENT ON TABLE textual_variants IS 'Textual criticism database tracking manuscript variants (omissions, additions, substitutions, word order changes)';

-- ============================================================================
-- Success message
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '✅ Migration 001 completed successfully!';
  RAISE NOTICE 'Tables added: provenance_ledger, theophoric_names, verse_alignments, textual_variants';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Import Strong''s Hebrew Lexicon (8,674 entries)';
  RAISE NOTICE '2. Import Strong''s Greek Lexicon (5,624 entries)';
  RAISE NOTICE '3. Populate theophoric_names table';
  RAISE NOTICE '4. Update restoration.js with confidence scoring';
END $$;
