-- Migration: Allow NULL target_word_position for null-alignment type
-- Purpose: Support cases where source words have no target equivalent (e.g., Hebrew particles)
-- Date: 2025-01-22

-- Modify target_word_position to allow NULL
ALTER TABLE word_alignments
  ALTER COLUMN target_word_position DROP NOT NULL;

-- Update check constraint to allow NULL or positive values
ALTER TABLE word_alignments
  DROP CONSTRAINT IF EXISTS word_alignments_target_word_position_check;

ALTER TABLE word_alignments
  ADD CONSTRAINT word_alignments_target_word_position_check
  CHECK (target_word_position IS NULL OR target_word_position >= 0);

-- Add comment explaining NULL usage
COMMENT ON COLUMN word_alignments.target_word_position IS
  'Word position in target verse (0-based index). NULL indicates null-alignment (no target equivalent).';

-- Success message
DO $$
BEGIN
  RAISE NOTICE 'target_word_position column updated to allow NULL for null-alignment type';
END
$$;
