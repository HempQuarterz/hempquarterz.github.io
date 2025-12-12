-- Migration: Add Canonical Tier Support to All4Yah Database
-- Version: 002
-- Date: 2025-01-25
-- Purpose: Enable transparent classification of canonical, deuterocanonical, and apocryphal texts
-- Related: APOCRYPHA_INCLUSION_ANALYSIS.md, books_tier_map.json

-- ============================================================================
-- PART 1: Extend manuscripts table with canonical tier metadata
-- ============================================================================

ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS canonical_tier INTEGER DEFAULT 1
  CHECK (canonical_tier >= 1 AND canonical_tier <= 5),
ADD COLUMN IF NOT EXISTS canonical_status VARCHAR(50) DEFAULT 'canonical'
  CHECK (canonical_status IN (
    'canonical',
    'deuterocanonical',
    'deuterocanonical-ethiopian',
    'apocryphal-historical-witness',
    'cultural-heritage'
  )),
ADD COLUMN IF NOT EXISTS era VARCHAR(150),
ADD COLUMN IF NOT EXISTS provenance_confidence DECIMAL(3,2)
  CHECK (provenance_confidence >= 0.0 AND provenance_confidence <= 1.0),
ADD COLUMN IF NOT EXISTS manuscript_attestation TEXT[];

COMMENT ON COLUMN manuscripts.canonical_tier IS 'Tier 1=Canonical, 2=Deuterocanonical, 3=Apocrypha, 4=Cultural, 5=Excluded';
COMMENT ON COLUMN manuscripts.canonical_status IS 'Detailed canonical classification for transparency';
COMMENT ON COLUMN manuscripts.era IS 'Historical period of composition (e.g., "Second Temple 200-100 BCE")';
COMMENT ON COLUMN manuscripts.provenance_confidence IS 'Scholarly confidence in manuscript authenticity (0.0-1.0)';
COMMENT ON COLUMN manuscripts.manuscript_attestation IS 'Array of manuscript sources (e.g., ["DSS 4Q201", "Codex Sinaiticus"])';

-- ============================================================================
-- PART 2: Create canonical_books reference table
-- ============================================================================

CREATE TABLE IF NOT EXISTS canonical_books (
  id SERIAL PRIMARY KEY,
  book_code VARCHAR(10) UNIQUE NOT NULL,
  book_name VARCHAR(100) NOT NULL,
  testament VARCHAR(50) NOT NULL CHECK (testament IN ('OT', 'NT', 'Deuterocanon', 'Pseudepigrapha', 'Apocrypha', 'Ethiopian', 'Cultural')),
  canonical_tier INTEGER NOT NULL CHECK (canonical_tier >= 1 AND canonical_tier <= 5),
  canonical_status VARCHAR(50) NOT NULL,
  era VARCHAR(150),
  language_origin VARCHAR(100),
  language_extant VARCHAR(100),
  provenance_confidence DECIMAL(3,2) CHECK (provenance_confidence >= 0.0 AND provenance_confidence <= 1.0),
  manuscript_sources TEXT[],
  included_in_canons TEXT[],
  quoted_in_nt TEXT,
  divine_name_occurrences INTEGER,
  divine_name_restorations TEXT[],
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

COMMENT ON TABLE canonical_books IS 'Reference table for all biblical books with canonical tier classifications';
COMMENT ON COLUMN canonical_books.book_code IS 'Standard book abbreviation (e.g., GEN, MAT, TOB, ENO)';
COMMENT ON COLUMN canonical_books.testament IS 'Testament or collection categorization';
COMMENT ON COLUMN canonical_books.language_origin IS 'Original composition language';
COMMENT ON COLUMN canonical_books.language_extant IS 'Languages in which manuscripts survive';
COMMENT ON COLUMN canonical_books.manuscript_sources IS 'Primary manuscript witnesses';
COMMENT ON COLUMN canonical_books.included_in_canons IS 'Which denominational canons include this book';
COMMENT ON COLUMN canonical_books.quoted_in_nt IS 'New Testament quotations (if applicable)';

-- ============================================================================
-- PART 3: Add canonical tier to verses table (optional, for filtering)
-- ============================================================================

ALTER TABLE verses
ADD COLUMN IF NOT EXISTS canonical_tier INTEGER;

COMMENT ON COLUMN verses.canonical_tier IS 'Denormalized canonical tier for fast filtering (sync with manuscripts.canonical_tier)';

-- ============================================================================
-- PART 4: Create indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_manuscripts_canonical_tier
  ON manuscripts(canonical_tier);

CREATE INDEX IF NOT EXISTS idx_manuscripts_canonical_status
  ON manuscripts(canonical_status);

CREATE INDEX IF NOT EXISTS idx_canonical_books_tier
  ON canonical_books(canonical_tier);

CREATE INDEX IF NOT EXISTS idx_canonical_books_testament
  ON canonical_books(testament);

CREATE INDEX IF NOT EXISTS idx_verses_canonical_tier
  ON verses(canonical_tier);

-- ============================================================================
-- PART 5: Update existing manuscripts with Tier 1 metadata
-- ============================================================================

-- WLC (Westminster Leningrad Codex) - Hebrew Old Testament
UPDATE manuscripts
SET
  canonical_tier = 1,
  canonical_status = 'canonical',
  era = 'Torah & Prophets (1450 BCE - 400 BCE trad.)',
  provenance_confidence = 1.0,
  manuscript_attestation = ARRAY[
    'Leningrad Codex (1008 CE)',
    'Dead Sea Scrolls (250 BCE - 70 CE)',
    'Aleppo Codex (920 CE)'
  ]
WHERE code = 'WLC';

-- SBLGNT (SBL Greek New Testament)
UPDATE manuscripts
SET
  canonical_tier = 1,
  canonical_status = 'canonical',
  era = 'First Century Christianity (50-100 CE)',
  provenance_confidence = 1.0,
  manuscript_attestation = ARRAY[
    'P52 (John, c. 125 CE)',
    'P45, P46, P47, P66, P75 (2nd-3rd c.)',
    'Codex Sinaiticus (4th c.)',
    'Codex Vaticanus (4th c.)',
    'Codex Alexandrinus (5th c.)'
  ]
WHERE code = 'SBLGNT';

-- WEB (World English Bible) - English translation
UPDATE manuscripts
SET
  canonical_tier = 1,
  canonical_status = 'canonical',
  era = 'Modern English Translation (2000 CE)',
  provenance_confidence = 1.0,
  manuscript_attestation = ARRAY['Public Domain English Translation based on ASV 1901']
WHERE code = 'WEB';

-- ============================================================================
-- PART 6: Seed canonical_books with Tier 1 (66 books)
-- ============================================================================

-- This will be populated from books_tier_map.json via import script
-- Placeholder for manual insertion if needed:

-- INSERT INTO canonical_books (book_code, book_name, testament, canonical_tier, canonical_status, era, language_origin, provenance_confidence)
-- VALUES
--   ('GEN', 'Genesis', 'OT', 1, 'canonical', 'Torah (1450-1400 BCE trad.)', 'Hebrew', 1.0),
--   ('EXO', 'Exodus', 'OT', 1, 'canonical', 'Torah (1450-1400 BCE trad.)', 'Hebrew', 1.0),
--   ... (continue for all 66 books)
-- ;

-- ============================================================================
-- PART 7: Create view for canonical tier filtering
-- ============================================================================

CREATE OR REPLACE VIEW v_canonical_scripture AS
SELECT
  cb.book_code,
  cb.book_name,
  cb.testament,
  cb.canonical_tier,
  cb.canonical_status,
  cb.era,
  cb.language_origin,
  cb.provenance_confidence,
  m.code AS manuscript_code,
  m.name AS manuscript_name,
  m.language,
  COUNT(v.id) AS verse_count
FROM canonical_books cb
LEFT JOIN manuscripts m ON m.canonical_tier = cb.canonical_tier
LEFT JOIN verses v ON v.manuscript_id = m.id
WHERE cb.canonical_tier <= 2  -- Only show Tier 1-2 by default
GROUP BY cb.book_code, cb.book_name, cb.testament, cb.canonical_tier, cb.canonical_status,
         cb.era, cb.language_origin, cb.provenance_confidence, m.code, m.name, m.language
ORDER BY cb.canonical_tier, cb.testament, cb.book_code;

COMMENT ON VIEW v_canonical_scripture IS 'Canonical tier filtering view - shows Tier 1-2 (Canonical + Deuterocanonical) by default';

-- ============================================================================
-- PART 8: Create function to sync verse canonical_tier
-- ============================================================================

CREATE OR REPLACE FUNCTION sync_verse_canonical_tier()
RETURNS TRIGGER AS $$
BEGIN
  -- When a verse is inserted or updated, sync canonical_tier from manuscripts table
  SELECT canonical_tier INTO NEW.canonical_tier
  FROM manuscripts
  WHERE id = NEW.manuscript_id;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_sync_verse_canonical_tier
BEFORE INSERT OR UPDATE ON verses
FOR EACH ROW
EXECUTE FUNCTION sync_verse_canonical_tier();

COMMENT ON FUNCTION sync_verse_canonical_tier IS 'Auto-sync canonical_tier from manuscripts to verses for fast filtering';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify migration
DO $$
BEGIN
  RAISE NOTICE 'Canonical Tier Migration Complete!';
  RAISE NOTICE 'Next Steps:';
  RAISE NOTICE '1. Run import script to populate canonical_books from books_tier_map.json';
  RAISE NOTICE '2. Import LXX Septuagint (includes Tier 2 deuterocanonical books)';
  RAISE NOTICE '3. Update UI to display canonical tier badges';
  RAISE NOTICE '4. Implement "Filter by Canonical Tier" feature';
END $$;
