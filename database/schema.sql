-- All4Yah Database Schema
-- Phase 1: Foundation - Manuscript Storage and Retrieval
-- Last Updated: 2025-10-18

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- TABLE: manuscripts
-- Stores metadata about each source manuscript (WLC, TR, WEB, DSS, etc.)
-- ============================================================================
CREATE TABLE manuscripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(10) UNIQUE NOT NULL, -- 'WLC', 'TR', 'WEB', 'DSS', 'LXX'
  name TEXT NOT NULL, -- 'Westminster Leningrad Codex'
  language VARCHAR(10) NOT NULL, -- 'hebrew', 'greek', 'english'
  description TEXT,
  source_url TEXT, -- GitHub or source repository URL
  license TEXT, -- 'CC BY 4.0', 'Public Domain'
  date_range TEXT, -- e.g., "1000 CE", "200 BCE - 100 CE"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- TABLE: verses
-- Stores the actual verse text from each manuscript
-- ============================================================================
CREATE TABLE verses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  manuscript_id UUID REFERENCES manuscripts(id) ON DELETE CASCADE,
  book VARCHAR(3) NOT NULL, -- 'GEN', 'EXO', 'MAT', 'JHN', etc.
  chapter INT NOT NULL CHECK (chapter > 0),
  verse INT NOT NULL CHECK (verse > 0),
  text TEXT NOT NULL, -- The actual verse content
  strong_numbers TEXT[], -- Array of Strong's numbers (e.g., ['H3068', 'H430'])
  morphology JSONB, -- Morphological parsing data (optional)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

  -- Ensure one verse per manuscript
  UNIQUE(manuscript_id, book, chapter, verse)
);

-- Indexes for fast verse lookups
CREATE INDEX idx_verses_manuscript ON verses(manuscript_id);
CREATE INDEX idx_verses_book ON verses(book);
CREATE INDEX idx_verses_lookup ON verses(manuscript_id, book, chapter, verse);
CREATE INDEX idx_verses_book_chapter ON verses(book, chapter);

-- ============================================================================
-- TABLE: lexicon
-- Hebrew/Greek dictionary with Strong's numbers
-- ============================================================================
CREATE TABLE lexicon (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  strong_number VARCHAR(10) UNIQUE NOT NULL, -- 'H3068', 'G2424'
  language VARCHAR(10) NOT NULL CHECK (language IN ('hebrew', 'greek')),
  original_word TEXT NOT NULL, -- Hebrew/Greek characters
  transliteration TEXT, -- 'Yahweh', 'Iesous'
  pronunciation TEXT, -- 'yah-WEH', 'ee-ay-SOOS'
  part_of_speech VARCHAR(20), -- 'noun', 'verb', 'adjective'
  definition TEXT NOT NULL, -- Full definition
  short_definition TEXT, -- Brief gloss
  root_word TEXT, -- Root or parent word
  usage_notes TEXT, -- Additional context
  kjv_usage TEXT, -- How KJV translates it
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for Strong's number lookups
CREATE INDEX idx_lexicon_strong ON lexicon(strong_number);
CREATE INDEX idx_lexicon_language ON lexicon(language);

-- ============================================================================
-- TABLE: name_mappings
-- Divine name restoration rules (YHWH → Yahuah, etc.)
-- ============================================================================
CREATE TABLE name_mappings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  original_text TEXT NOT NULL, -- Hebrew/Greek: 'יהוה', 'Ἰησοῦς'
  traditional_rendering TEXT, -- 'LORD', 'Jesus', 'God'
  restored_rendering TEXT NOT NULL, -- 'Yahuah', 'Yahusha', 'Elohim'
  strong_number VARCHAR(10), -- Reference to lexicon entry
  context_rules JSONB, -- When to apply this mapping
  notes TEXT, -- Explanation of restoration
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for name lookups
CREATE INDEX idx_name_mappings_original ON name_mappings(original_text);
CREATE INDEX idx_name_mappings_strong ON name_mappings(strong_number);

-- ============================================================================
-- TABLE: translations (AI-generated or human)
-- Stores All4Yah's restored translations
-- ============================================================================
CREATE TABLE translations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  translation_type VARCHAR(20) NOT NULL CHECK (translation_type IN ('ai', 'human', 'hybrid')),
  text TEXT NOT NULL, -- The translated verse
  names_restored BOOLEAN DEFAULT false, -- Whether divine names are restored
  translator TEXT, -- 'GPT-4', 'Claude', 'John Doe'
  confidence_score DECIMAL(3,2), -- 0.00 to 1.00 (AI confidence)
  reviewed BOOLEAN DEFAULT false, -- Human review completed
  reviewer TEXT, -- Name of human reviewer
  notes TEXT, -- Translation notes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for translation lookups
CREATE INDEX idx_translations_verse ON translations(verse_id);
CREATE INDEX idx_translations_type ON translations(translation_type);

-- ============================================================================
-- TABLE: annotations (Community scholarly notes)
-- ============================================================================
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  verse_id UUID REFERENCES verses(id) ON DELETE CASCADE,
  user_id UUID, -- Will link to auth.users later
  annotation_type VARCHAR(20) CHECK (annotation_type IN ('note', 'translation', 'textual_variant', 'cross_reference')),
  content TEXT NOT NULL,
  verse_references TEXT[], -- Related verses or sources
  upvotes INT DEFAULT 0,
  downvotes INT DEFAULT 0,
  verified BOOLEAN DEFAULT false, -- Verified by scholar
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index for annotations
CREATE INDEX idx_annotations_verse ON annotations(verse_id);
CREATE INDEX idx_annotations_user ON annotations(user_id);

-- ============================================================================
-- FUNCTION: Update updated_at timestamp automatically
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_manuscripts_updated_at BEFORE UPDATE ON manuscripts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_verses_updated_at BEFORE UPDATE ON verses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_translations_updated_at BEFORE UPDATE ON translations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_annotations_updated_at BEFORE UPDATE ON annotations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SEED DATA: Book abbreviations reference
-- ============================================================================
COMMENT ON COLUMN verses.book IS 'Standard 3-letter book codes: GEN, EXO, LEV, NUM, DEU, JOS, JDG, RUT, 1SA, 2SA, 1KI, 2KI, 1CH, 2CH, EZR, NEH, EST, JOB, PSA, PRO, ECC, SNG, ISA, JER, LAM, EZK, DAN, HOS, JOL, AMO, OBA, JON, MIC, NAM, HAB, ZEP, HAG, ZEC, MAL, MAT, MRK, LUK, JHN, ACT, ROM, 1CO, 2CO, GAL, EPH, PHP, COL, 1TH, 2TH, 1TI, 2TI, TIT, PHM, HEB, JAS, 1PE, 2PE, 1JN, 2JN, 3JN, JUD, REV';

-- ============================================================================
-- Row Level Security (RLS) - Phase 2
-- For now, allow all reads; restrict writes to authenticated users
-- ============================================================================
ALTER TABLE manuscripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
ALTER TABLE lexicon ENABLE ROW LEVEL SECURITY;
ALTER TABLE name_mappings ENABLE ROW LEVEL SECURITY;
ALTER TABLE translations ENABLE ROW LEVEL SECURITY;
ALTER TABLE annotations ENABLE ROW LEVEL SECURITY;

-- Public read access for core data
CREATE POLICY "Public read access" ON manuscripts FOR SELECT USING (true);
CREATE POLICY "Public read access" ON verses FOR SELECT USING (true);
CREATE POLICY "Public read access" ON lexicon FOR SELECT USING (true);
CREATE POLICY "Public read access" ON name_mappings FOR SELECT USING (true);
CREATE POLICY "Public read access" ON translations FOR SELECT USING (true);
CREATE POLICY "Public read access" ON annotations FOR SELECT USING (true);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'All4Yah database schema created successfully!';
  RAISE NOTICE 'Tables created: manuscripts, verses, lexicon, name_mappings, translations, annotations';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '1. Import Westminster Leningrad Codex (WLC)';
  RAISE NOTICE '2. Import World English Bible (WEB)';
  RAISE NOTICE '3. Test API endpoints';
END $$;
