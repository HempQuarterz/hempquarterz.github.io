# All4Yah Database Setup

This directory contains SQL scripts for setting up the Supabase database.

## Quick Start

### 1. Run the Schema

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your **All4Yah** project
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy the contents of `schema.sql` and paste it into the editor
6. Click **Run** (or press Cmd/Ctrl + Enter)

### 2. Verify Tables Created

After running the schema, you should see these tables in **Table Editor**:

- ✅ `manuscripts` - Manuscript metadata
- ✅ `verses` - Verse text storage
- ✅ `lexicon` - Hebrew/Greek dictionary
- ✅ `name_mappings` - Divine name restoration
- ✅ `translations` - AI/human translations
- ✅ `annotations` - Community notes

### 3. Test the Connection

Run the test script from your project root:

```bash
node database/test-connection.js
```

## Schema Overview

### Core Tables

**manuscripts**
- Stores metadata about each source text (WLC, TR, WEB, etc.)
- Fields: code, name, language, description, source_url, license

**verses**
- Stores actual verse content from manuscripts
- Fields: manuscript_id, book, chapter, verse, text, strong_numbers
- Indexed for fast lookups

**lexicon**
- Hebrew/Greek dictionary with Strong's numbers
- Fields: strong_number, original_word, transliteration, definition

**name_mappings**
- Rules for restoring divine names (YHWH → Yahuah)
- Fields: original_text, traditional_rendering, restored_rendering

### Features

- ✅ UUID primary keys
- ✅ Automatic timestamps (created_at, updated_at)
- ✅ Foreign key constraints
- ✅ Indexes for performance
- ✅ Row Level Security (RLS) enabled
- ✅ Public read access (for now)

## Next Steps

After the schema is set up:

1. Import Westminster Leningrad Codex (Hebrew OT)
2. Import World English Bible (English baseline)
3. Build API endpoints
4. Create frontend components

## Troubleshooting

**Error: "extension uuid-ossp does not exist"**
- Supabase should have this by default. If not, run:
  ```sql
  CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  ```

**Error: "permission denied"**
- Make sure you're logged into the correct Supabase project
- Check that you have admin access

**Need to reset?**
- Drop all tables and re-run schema.sql
- Or use Supabase dashboard to reset the database
