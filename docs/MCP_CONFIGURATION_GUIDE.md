# MCP Configuration Guide for All4Yah Project

**Purpose:** Configure the Supabase MCP server to work with the All4Yah Bible database
**Date:** 2025-01-24

---

## Current Situation

The Supabase MCP server is currently connected to a different database (hemp/cannabis industry project). We need to configure it to work with the All4Yah Bible database.

**All4Yah Database:**
- **Project:** txeeaekwhkdilycefczq
- **URL:** https://txeeaekwhkdilycefczq.supabase.co
- **Expected Tables:** manuscripts, verses, lexicon, name_mappings, translations, annotations

---

## Option 1: Reconfigure Existing Supabase MCP (Recommended)

### Step 1: Locate MCP Configuration

The Supabase MCP configuration is typically stored in one of these locations:

**For Claude Desktop:**
```bash
~/.config/Claude/claude_desktop_config.json
```

**For Claude Code:**
```bash
~/.config/claude-code/mcp_settings.json
```

### Step 2: Update Supabase MCP Configuration

Find the `supabase` server entry and update with All4Yah credentials:

```json
{
  "mcpServers": {
    "supabase": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://txeeaekwhkdilycefczq.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZWVhZWt3aGtkaWx5Y2VmY3pxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzODg5MSwiZXhwIjoyMDc2NDE0ODkxfQ.sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"
      }
    }
  }
}
```

### Step 3: Restart Claude Code

After updating the configuration:
1. Close Claude Code completely
2. Reopen Claude Code
3. The Supabase MCP should now connect to the All4Yah database

### Step 4: Verify Connection

Test the connection by running:
```javascript
// In Claude Code
await mcp__supabase__execute_sql({
  query: "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;"
});

// Expected output should include:
// manuscripts, verses, lexicon, name_mappings, translations, annotations
```

---

## Option 2: Use Multiple Supabase MCP Instances

If you need to access both databases, configure two separate MCP servers:

```json
{
  "mcpServers": {
    "supabase-all4yah": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://txeeaekwhkdilycefczq.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZWVhZWt3aGtkaWx5Y2VmY3pxIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDgzODg5MSwiZXhwIjoyMDc2NDE0ODkxfQ.sb_secret..."
      }
    },
    "supabase-hemp": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-supabase"],
      "env": {
        "SUPABASE_URL": "https://[hemp-project-id].supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "[hemp-service-role-key]"
      }
    }
  }
}
```

**Note:** This creates two separate MCP servers: `mcp__supabase-all4yah__*` and `mcp__supabase-hemp__*`

---

## Option 3: Manual Database Operations (Current Workaround)

Until the Supabase MCP is reconfigured, use direct Node.js scripts:

### Apply Migration:
```bash
cd /home/hempquarterz/projects/All4Yah/hempquarterz.github.io

# Create migration apply script
node -e "
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
require('dotenv').config();

const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
);

const migration = fs.readFileSync('database/migrations/001_add_provenance_and_theophoric_tables.sql', 'utf-8');

// Note: Supabase JS client doesn't support executing raw SQL migrations
// Use psql or Supabase Dashboard SQL Editor instead
console.log('Migration SQL ready. Apply via:');
console.log('1. Supabase Dashboard > SQL Editor');
console.log('2. Copy-paste migration SQL');
console.log('3. Click Run');
"
```

### Import Strong's Lexicon:
```bash
# Test mode (10 entries each)
node database/import-strongs-lexicon.js --test

# Full import (14,298 entries)
node database/import-strongs-lexicon.js --all
```

---

## Recommended Approach

**For All4Yah Development:**

1. **Use Option 3 (Manual Scripts)** for now since:
   - Import scripts already written
   - Direct Supabase client connection via .env
   - No MCP reconfiguration needed immediately

2. **Later, configure Option 1** when:
   - You need frequent database queries in Claude Code
   - You want to use MCP tools for schema inspection
   - You're doing exploratory data analysis

---

## Supabase Dashboard Access

**Alternative to MCP:** Use the Supabase Dashboard for migrations and queries

1. **Navigate to:** https://supabase.com/dashboard/project/txeeaekwhkdilycefczq
2. **Go to:** SQL Editor
3. **Paste migration SQL** from `database/migrations/001_add_provenance_and_theophoric_tables.sql`
4. **Click:** Run

**Advantages:**
- Visual feedback
- Query history
- Table browser
- No MCP configuration needed

---

## Next Steps

### Immediate (Today):
1. Apply migration via Supabase Dashboard SQL Editor
2. Run `node database/import-strongs-lexicon.js --test`
3. Verify 20 entries imported (10 Hebrew + 10 Greek)
4. Run `node database/import-strongs-lexicon.js --all`
5. Verify 14,298 entries imported

### Later (This Week):
1. Configure Supabase MCP for All4Yah (Option 1 or 2)
2. Test MCP connection
3. Use MCP for future queries

---

## Credentials Summary

**All4Yah Supabase Project:**
```
Project ID: txeeaekwhkdilycefczq
URL: https://txeeaekwhkdilycefczq.supabase.co
Anon Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR4ZWVhZWt3aGtkaWx5Y2VmY3pxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA4Mzg4OTEsImV4cCI6MjA3NjQxNDg5MX0.LW6NLz4GXHgOFMLKrV9VRX6ENXxD1JAKUB5nIHJUFfo
Service Role Key: (partial - full key in .env file)
```

**Where to find Service Role Key:**
1. Supabase Dashboard > Project Settings > API
2. Copy "service_role" key
3. **WARNING:** Never expose in browser code - server-side only!

---

## Troubleshooting

### Issue: Migration fails with "relation does not exist"
**Solution:** Run base schema first:
```bash
# Apply base schema from database/schema.sql
# Then apply migration 001
```

### Issue: Import script fails with permission error
**Solution:** Ensure using service_role key in .env:
```bash
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # Full service role key
```

### Issue: MCP tools not working
**Solution:** Check MCP server status:
```bash
# Restart Claude Code
# Check logs: ~/.config/Claude/logs/ or ~/.config/claude-code/logs/
```

---

**Document End**

For questions or issues, refer to:
- Supabase MCP docs: https://github.com/modelcontextprotocol/servers/tree/main/src/supabase
- Supabase CLI docs: https://supabase.com/docs/guides/cli
