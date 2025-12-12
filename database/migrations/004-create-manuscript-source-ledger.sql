-- Migration 004: Manuscript Source Ledger
-- Tracks all manuscript sources with licensing, provenance, and metadata
-- Created: 2025-10-27

-- Source Ledger Table
CREATE TABLE IF NOT EXISTS manuscript_sources (
  id SERIAL PRIMARY KEY,

  -- Core Identification
  source_id VARCHAR(50) UNIQUE NOT NULL,  -- e.g., 'ebible-web', 'morphgnt-sblgnt'
  source_name TEXT NOT NULL,               -- e.g., 'World English Bible'
  source_url TEXT,                         -- Official website or download URL

  -- Language & Format
  language VARCHAR(50) NOT NULL,           -- 'hebrew', 'greek', 'english', etc.
  script VARCHAR(50),                      -- 'Hebrew', 'Greek', 'Latin', 'Ge\'ez', etc.
  format VARCHAR(50) NOT NULL,             -- 'USFM', 'XML', 'JSON', 'TSV', 'Plain Text'

  -- Licensing (CRITICAL for legal compliance)
  license VARCHAR(100) NOT NULL,           -- 'Public Domain', 'CC BY-SA 4.0', 'CC0', etc.
  license_verified_date DATE,              -- When license was last verified
  license_url TEXT,                        -- Link to license document
  requires_attribution BOOLEAN DEFAULT false,
  commercial_use_allowed BOOLEAN DEFAULT true,
  modification_allowed BOOLEAN DEFAULT true,

  -- Provenance & Quality
  original_manuscript_reference TEXT,      -- e.g., 'Biblia Hebraica Stuttgartensia'
  base_text TEXT,                          -- e.g., 'ASV 1901', 'Revised Version 1895'
  translation_date_range VARCHAR(50),      -- e.g., '1901', '1990-2010', 'Ancient'
  scholarly_consensus VARCHAR(20),         -- 'High', 'Medium', 'Low', 'Unknown'

  -- Coverage
  canonical_tier INT[],                    -- [1] = Protestant 66, [2] = Deuterocanon, [3] = Ethiopian
  books_included TEXT[],                   -- Array of book codes: ['GEN', 'EXO', ...]
  verses_count INT,                        -- Total verses available

  -- Import Status
  import_status VARCHAR(20) DEFAULT 'pending',  -- 'pending', 'in_progress', 'completed', 'failed'
  import_date TIMESTAMP,
  import_notes TEXT,

  -- Metadata
  notes TEXT,                              -- Additional notes, warnings, special considerations
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Index for fast lookups
CREATE INDEX idx_manuscript_sources_source_id ON manuscript_sources(source_id);
CREATE INDEX idx_manuscript_sources_language ON manuscript_sources(language);
CREATE INDEX idx_manuscript_sources_license ON manuscript_sources(license);
CREATE INDEX idx_manuscript_sources_import_status ON manuscript_sources(import_status);

-- Link manuscript_sources to manuscripts table
ALTER TABLE manuscripts ADD COLUMN IF NOT EXISTS source_id VARCHAR(50) REFERENCES manuscript_sources(source_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_manuscript_sources_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_manuscript_sources_timestamp
BEFORE UPDATE ON manuscript_sources
FOR EACH ROW
EXECUTE FUNCTION update_manuscript_sources_timestamp();

-- Insert existing sources for tracking
INSERT INTO manuscript_sources (
  source_id, source_name, source_url, language, script, format,
  license, license_verified_date, requires_attribution,
  original_manuscript_reference, translation_date_range,
  canonical_tier, import_status, import_date, notes
) VALUES
  -- Westminster Leningrad Codex (Hebrew OT)
  (
    'tanach-wlc',
    'Westminster Leningrad Codex',
    'https://tanach.us/Tanach.xml',
    'hebrew',
    'Hebrew',
    'XML',
    'Public Domain',
    '2025-10-27',
    false,
    'Leningrad Codex (1008 CE)',
    '1008 CE (manuscript), 2006 (digitization)',
    ARRAY[1],
    'completed',
    '2025-01-15',
    'Complete Hebrew Old Testament with vowel points and cantillation marks. Source: J. Alan Groves Center for Advanced Biblical Research.'
  ),

  -- World English Bible (English, Canonical)
  (
    'ebible-web-canonical',
    'World English Bible (66 books)',
    'https://ebible.org/find/show.php?id=eng-web',
    'english',
    'Latin',
    'USFM',
    'Public Domain',
    '2025-10-27',
    false,
    'American Standard Version 1901, Biblia Hebraica Stuttgartensia, Byzantine Majority Text',
    '2000-2023',
    ARRAY[1],
    'completed',
    '2025-02-01',
    'Based on ASV 1901 with modern English. Updated to Byzantine Majority Text for NT. Public Domain - no restrictions.'
  ),

  -- World English Bible Deuterocanon (English, Apocrypha)
  (
    'ebible-web-deuterocanon',
    'World English Bible (Deuterocanon/Apocrypha)',
    'https://eBible.org/Scriptures/eng-web_usfm.zip',
    'english',
    'Latin',
    'USFM',
    'Public Domain',
    '2025-10-27',
    false,
    'Revised Version Apocrypha 1895, Brenton Septuagint 1851',
    '2000-2023',
    ARRAY[2],
    'pending',
    NULL,
    'Includes 18 deuterocanonical books: TOB, JDT, ESG, WIS, SIR, BAR, LJE, 1MA, 2MA, 1ES, MAN, PS2, 3MA, 2ES, 4MA, S3Y, SUS, BEL. Public Domain - no restrictions.'
  ),

  -- SBL Greek New Testament
  (
    'morphgnt-sblgnt',
    'SBL Greek New Testament',
    'https://github.com/morphgnt/sblgnt',
    'greek',
    'Greek',
    'TSV',
    'CC BY-SA 4.0',
    '2025-10-27',
    true,
    'Critical eclectic text based on modern manuscripts',
    '2010',
    ARRAY[1],
    'completed',
    '2025-03-01',
    'Society of Biblical Literature Greek New Testament. Includes morphological parsing. Attribution required: "SBLGNT, CC BY-SA 4.0"'
  ),

  -- Targum Onkelos (Aramaic Pentateuch)
  (
    'sefaria-onkelos',
    'Targum Onkelos',
    'https://www.sefaria.org/texts/Tanakh/Targum',
    'aramaic',
    'Hebrew',
    'JSON',
    'CC BY-SA 4.0',
    '2025-10-27',
    true,
    'Aramaic translation of Torah (ancient)',
    'Ancient (200-500 CE), digitized 2024',
    ARRAY[1],
    'completed',
    '2025-03-15',
    'Aramaic translation of the Pentateuch. Source: Sefaria.org. Attribution required: "Sefaria.org, CC BY-SA 4.0"'
  );

-- Comments for documentation
COMMENT ON TABLE manuscript_sources IS 'Ledger of all manuscript sources with licensing, provenance, and import tracking';
COMMENT ON COLUMN manuscript_sources.license IS 'CRITICAL: Must verify before import. Only Public Domain, CC0, CC BY, CC BY-SA allowed without special permission';
COMMENT ON COLUMN manuscript_sources.requires_attribution IS 'If true, must include attribution in UI footer and documentation';
COMMENT ON COLUMN manuscript_sources.canonical_tier IS 'Array: 1=Protestant 66 books, 2=Deuterocanon, 3=Ethiopian/Pseudepigrapha';
