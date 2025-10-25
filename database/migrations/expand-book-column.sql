-- Migration: Expand book column to support Dead Sea Scrolls
-- Date: 2025-10-25
-- Purpose: Change verses.book from VARCHAR(3) to VARCHAR(50) to accommodate
--          Dead Sea Scrolls naming (e.g., "4Q223_224", "Arugleviticus", "1QpHab")
--
-- Impact: This affects all existing verses but is necessary for DSS support
--         and future manuscripts with non-standard naming conventions.

-- Expand book column from VARCHAR(3) to VARCHAR(50)
ALTER TABLE verses
ALTER COLUMN book TYPE VARCHAR(50);

-- Verify the change
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'verses'
AND column_name = 'book';
