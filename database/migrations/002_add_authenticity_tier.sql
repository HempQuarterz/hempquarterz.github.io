-- Migration 002: Add Authenticity Tier to Manuscripts
-- Purpose: Distinguish between free/unaltered primary sources and filtered/restricted texts
-- Date: 2025-10-25
--
-- This migration implements the "Authentic 10" classification system for All4Yah:
--
-- TIER 1 (AUTHENTIC): Free & Unaltered Core Texts
--   - Public domain or openly licensed
--   - Original language data (no paraphrasing or theological smoothing)
--   - Minimal editorial interference (diplomatic/facsimile editions)
--   - Examples: WLC, LXX Rahlfs, SBLGNT, Codex Sinaiticus, Vulgate, Dead Sea Scrolls
--
-- TIER 2 (FILTERED): Partially Free or Filtered Texts
--   - Openly accessible but filtered through interpretation layers
--   - May include modern tagging, commentary, or corrections
--   - Examples: Peshitta (with Western corrections), Sefaria (with modern layers), WEB (modern English)
--
-- TIER 3 (RESTRICTED): Not Free or Heavily Filtered
--   - Behind paywalls or proprietary restrictions
--   - Contains modern editorial reconstructions
--   - Examples: BDB/HALOT/LSJ Lexicons, NA28 (if not publicly licensed)

-- Add authenticity_tier column to manuscripts table
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS authenticity_tier INTEGER CHECK (authenticity_tier IN (1, 2, 3));

-- Add tier_notes column for documentation
ALTER TABLE manuscripts
ADD COLUMN IF NOT EXISTS tier_notes TEXT;

COMMENT ON COLUMN manuscripts.authenticity_tier IS 'Tier 1: Authentic (free & unaltered), Tier 2: Filtered (interpretation layers), Tier 3: Restricted (proprietary/heavily edited)';
COMMENT ON COLUMN manuscripts.tier_notes IS 'Explanation of why this manuscript is classified in its tier';

-- Update existing manuscripts with their authenticity tiers

-- TIER 1: AUTHENTIC (Free & Unaltered Primary Sources)
UPDATE manuscripts
SET authenticity_tier = 1,
    tier_notes = 'Diplomatic Masoretic text from Leningrad Codex. Complete, faithful to original codex with no doctrinal bias. Public domain.'
WHERE code = 'WLC';

UPDATE manuscripts
SET authenticity_tier = 1,
    tier_notes = 'Open-licensed transcription of SBL Greek New Testament. Critical text with no interpretive bias. Fully free under CC BY-SA 4.0.'
WHERE code = 'SBLGNT';

UPDATE manuscripts
SET authenticity_tier = 1,
    tier_notes = 'Critical diplomatic edition (Rahlfs 1935) of ancient Greek Septuagint. No paraphrasing, CCAT-based data. CC BY-NC-SA 4.0.'
WHERE code = 'LXX';

UPDATE manuscripts
SET authenticity_tier = 1,
    tier_notes = 'Clementine Vulgate - public domain Latin base text, not modernized or paraphrased. Jerome''s translation ~400 CE.'
WHERE code = 'VUL';

UPDATE manuscripts
SET authenticity_tier = 1,
    tier_notes = 'Textus Receptus - traditional Greek text underlying KJV. Pure Byzantine text type with morphology and Strong''s numbers. Public domain.'
WHERE code = 'TR';

-- TIER 2: FILTERED (Partially Free or Filtered Texts)
UPDATE manuscripts
SET authenticity_tier = 2,
    tier_notes = 'Modern English translation (2000 CE). While public domain and excellent, it is a translation rather than original language text. Useful for comparison but not for restoration work.'
WHERE code = 'WEB';

-- Add index for filtering by tier
CREATE INDEX IF NOT EXISTS idx_manuscripts_tier ON manuscripts(authenticity_tier);

-- Create view for Tier 1 "Authentic Corpus" manuscripts only
CREATE OR REPLACE VIEW authentic_manuscripts AS
SELECT * FROM manuscripts
WHERE authenticity_tier = 1
ORDER BY code;

COMMENT ON VIEW authentic_manuscripts IS 'The "Authentic 10" Corpus - Tier 1 manuscripts suitable for primary AI restoration work. These represent unaltered diplomatic/facsimile editions of original language texts.';

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Authenticity Tier Migration Complete!';
  RAISE NOTICE '';
  RAISE NOTICE 'Summary:';
  RAISE NOTICE '  - Added authenticity_tier column (1=Authentic, 2=Filtered, 3=Restricted)';
  RAISE NOTICE '  - Added tier_notes column for documentation';
  RAISE NOTICE '  - Classified existing 6 manuscripts:';
  RAISE NOTICE '    * Tier 1 (Authentic): WLC, SBLGNT, LXX, VUL, TR (5 manuscripts)';
  RAISE NOTICE '    * Tier 2 (Filtered): WEB (1 manuscript)';
  RAISE NOTICE '  - Created authentic_manuscripts view for Tier 1 only';
  RAISE NOTICE '';
  RAISE NOTICE 'The "Authentic Corpus" now contains 5 unaltered primary sources.';
  RAISE NOTICE 'Future manuscripts will be classified upon import.';
END $$;
