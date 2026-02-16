-- GIN indexes for full-text search performance
-- Run this against the All4Yah Supabase project via SQL Editor

-- Full-text search on verse text (enables fast .textSearch('text', query))
CREATE INDEX IF NOT EXISTS idx_verses_text_search
ON verses USING GIN (to_tsvector('english', text));

-- Array containment on strong_numbers (enables fast .contains('strong_numbers', [...]))
CREATE INDEX IF NOT EXISTS idx_verses_strong_numbers_gin
ON verses USING GIN (strong_numbers);

-- Full-text search on lexicon definitions
CREATE INDEX IF NOT EXISTS idx_lexicon_definition_search
ON lexicon USING GIN (to_tsvector('english', definition));
