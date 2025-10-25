# Database Manager Skill

A skill for managing Supabase database operations for the All4Yah project.

## Capabilities:

### 1. Check Database Status
- Query total verse count across all manuscripts
- Check manuscript table for active manuscripts
- Verify name_mappings table entries
- Test database connection

### 2. Run Database Queries
- Execute safe SELECT queries
- Generate verse statistics
- Count verses by manuscript
- List available books and chapters

### 3. Import Operations
- Guide through manuscript import process
- Verify import scripts are ready
- Check for required environment variables
- Test import with sample data

### 4. Backup and Maintenance
- Document backup procedures
- Guide through RLS policy verification
- Check index performance
- Monitor database size

## Usage:

When invoked, this skill will:
1. Check which database operation is needed
2. Verify environment variables are set
3. Execute the operation safely
4. Report results with statistics
5. Provide recommendations if issues found

## Safety:

- Only performs READ operations by default
- Requires explicit confirmation for WRITE operations
- Uses anon key for read-only queries
- Requires service role key for imports (server-side only)
- Never exposes sensitive credentials

## Examples:

**Check total verses:**
```javascript
const { data } = await supabase
  .from('verses')
  .select('*', { count: 'exact', head: true });
console.log(`Total verses: ${data.count}`);
```

**List manuscripts:**
```javascript
const { data } = await supabase
  .from('manuscripts')
  .select('code, name, language, verse_count')
  .order('code');
```

**Verify name mappings:**
```javascript
const { data } = await supabase
  .from('name_mappings')
  .select('original, restored, strongs_number, language');
```
