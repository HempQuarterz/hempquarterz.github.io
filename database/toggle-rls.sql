-- Toggle RLS for verses table during data import
-- Run this in Supabase SQL Editor before importing data

-- DISABLE RLS (for import)
ALTER TABLE verses DISABLE ROW LEVEL SECURITY;

-- After import is complete, RE-ENABLE RLS:
-- ALTER TABLE verses ENABLE ROW LEVEL SECURITY;
