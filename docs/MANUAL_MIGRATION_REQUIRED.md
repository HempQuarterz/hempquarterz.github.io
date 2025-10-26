# Manual Database Migration Required

## Problem Summary

The Dead Sea Scrolls import is blocked because the `verses.book` column is currently `VARCHAR(3)`, but DSS scroll names can be much longer (e.g., "4Q223_224", "Arugleviticus", "1QpHab").

**Automated migration attempts have failed** due to technical limitations:
- ❌ Supabase MCP connects to wrong database (`ktoqznqmlnxrtvubewyz` instead of `txeeaekwhkdilycefczq`)
- ❌ Supabase JS client cannot execute DDL statements (no `exec_sql` RPC)
- ❌ Direct psql connection has IPv6 network issues
- ❌ pg Node.js library has same network issues

## Required Manual Action

You must execute the migration SQL manually via the Supabase Dashboard:

### Step 1: Open Supabase SQL Editor

Navigate to:
```
https://supabase.com/dashboard/project/txeeaekwhkdilycefczq/sql/new
```

### Step 2: Execute Migration SQL

Copy and paste this SQL into the editor and click "Run":

```sql
-- Expand book column to support Dead Sea Scrolls and other manuscripts
ALTER TABLE verses ALTER COLUMN book TYPE VARCHAR(50);
```

### Step 3: Verify Migration

Run this verification query:

```sql
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'verses'
AND column_name = 'book';
```

Expected result:
```
column_name | data_type          | character_maximum_length
-----------|--------------------|--------------------------
book        | character varying  | 50
```

### Step 4: Re-run DSS Import

After confirming the migration succeeded, run:

```bash
cd /home/hempquarterz/projects/All4Yah/hempquarterz.github.io
node database/import-dead-sea-scrolls.js --full
```

This will import all 52,769 Dead Sea Scrolls lines across 997 scrolls.

## Why Manual Migration is Necessary

The Supabase infrastructure has several technical limitations:

1. **MCP Server Mismatch**: The Supabase MCP server connects to project `ktoqznqmlnxrtvubewyz`, but the Node.js scripts connect to project `txeeaekwhkdilycefczq` (the correct production database with 10 manuscripts).

2. **No DDL via JS Client**: The Supabase JavaScript client cannot execute DDL statements like `ALTER TABLE`. The `exec_sql` RPC function does not exist in this project.

3. **Network Restrictions**: Direct PostgreSQL connections via psql and pg Node.js library are blocked by IPv6 networking issues (`ENETUNREACH`).

4. **Manual Dashboard Access Only**: The only reliable way to execute DDL is through the Supabase Dashboard SQL Editor, which provides authenticated web-based access.

## Impact of Migration

- **Existing Data**: No data loss. All existing verses will remain intact.
- **Performance**: Minimal. VARCHAR(50) vs VARCHAR(3) has negligible storage/performance impact.
- **Compatibility**: Improves compatibility with non-standard manuscript naming (DSS, fragments, etc.).

## After Migration Success

Once the migration completes and DSS import succeeds, you will have achieved the **"Authentic 10" milestone**:

1. ✅ Westminster Leningrad Codex (WLC) - 23,145 verses
2. ✅ World English Bible (WEB) - 31,102 verses
3. ✅ SBL Greek New Testament (SBLGNT) - 7,927 verses
4. ✅ Septuagint (LXX) - 36,093 verses
5. ✅ Codex Sinaiticus (SIN) - 9,658 verses (FIXED)
6. ✅ Nestle 1904 (N1904) - 7,943 verses (FIXED)
7. ✅ Byzantine Majority Text (BYZMT) - 7,947 verses
8. ✅ Textus Receptus (TR) - 7,957 verses
9. ✅ Clementine Vulgate (VUL) - 35,525 verses
10. ⏳ Dead Sea Scrolls (DSS) - 52,769 lines (PENDING THIS MIGRATION)

**Total when complete**: ~220,066 verses/lines across 10 Tier-1 authentic manuscripts!

## Questions?

If you encounter any issues:
1. Verify you're logged into the correct Supabase project (`txeeaekwhkdilycefczq`)
2. Check that you have admin/owner permissions on the project
3. Ensure the SQL Editor is showing the correct project in the top-left dropdown
4. If the migration fails, check for any foreign key constraints or triggers on the `verses` table

---

**Status**: MANUAL ACTION REQUIRED
**Priority**: HIGH - Blocks Dead Sea Scrolls import and "Authentic 10" milestone
**Estimated Time**: 2 minutes to execute migration via dashboard
