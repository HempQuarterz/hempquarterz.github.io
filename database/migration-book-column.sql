
-- Migration: Expand book column for Dead Sea Scrolls
-- Date: 2025-10-25
-- Reason: DSS scroll names exceed VARCHAR(3) limit

-- Expand book column to support longer manuscript names
ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);

-- Verify the migration
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'verses'
AND column_name = 'book';
