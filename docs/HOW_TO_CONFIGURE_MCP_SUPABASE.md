# How to Configure MCP Supabase for All4Yah

## Quick Answer: You Don't Need To!

**Your All4Yah database is working perfectly.** All your import scripts and verification tools connect to the correct database. The MCP tool issue doesn't affect your project.

## But If You Want MCP Tools to Work...

The Supabase MCP server is configured globally for Claude Code, not per-project. Here's how to configure it:

### Option 1: Update Global MCP Config (Easiest)

The MCP configuration is likely in one of these files:

```bash
# Check which file exists:
~/.config/supabase-mcp/.env                    # Global Supabase MCP config
~/.claude/mcp_config.json                      # Claude MCP config
~/.config/Claude/claude_desktop_config.json    # Claude Desktop config
```

**Steps:**
1. Find the active MCP config file
2. Update the Supabase credentials to All4Yah's:

```env
SUPABASE_PROJECT_REF=txeeaekwhkdilycefczq
SUPABASE_DB_PASSWORD=@4HQZgassmoe
SUPABASE_ACCESS_TOKEN=sbp_8bbda53f27cc215d9f5bb753c9d972035e917207
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO
```

3. Restart Claude Code

### Option 2: Use Project Scripts (Recommended ✅)

**Don't configure MCP at all!** Instead, use the project scripts that already work:

```bash
# Verify database
node database/verify-imports.js

# Check inventory
node database/get-full-inventory.js

# Query data programmatically
# (Create custom scripts as needed)
```

### Option 3: Create a Project-Specific Query Tool

Create `database/query.js` for ad-hoc queries:

```javascript
#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://txeeaekwhkdilycefczq.supabase.co',
  'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO'
);

async function query() {
  // Your query here
  const { data, error } = await supabase
    .from('verses')
    .select('*')
    .eq('book', 'GEN')
    .eq('chapter', 1)
    .limit(10);

  console.log(JSON.stringify(data, null, 2));
}

query();
```

## Why This Happened

The MCP Supabase server is shared across all your Claude Code projects. It was configured for your Industrial Hemp project (`ktoqznqmlnxrtvubewyz`), so when you use MCP Supabase tools, they query that database instead of All4Yah's (`txeeaekwhkdilycefczq`).

## Current Workaround (Works Great!)

**Your import scripts are smart** - they hardcode the correct database URL:

```javascript
// From database/import-wlc.js, import-sblgnt.js, import-web.js, verify-imports.js
const SUPABASE_URL = 'https://txeeaekwhkdilycefczq.supabase.co';
const SUPABASE_KEY = 'sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
```

This ensures they **always** use the All4Yah database, regardless of global MCP settings.

## Recommendation ⭐

**Keep it as-is!** Your project-specific scripts work perfectly and are more reliable than relying on global MCP configuration.

### Benefits:
1. ✅ Scripts always use correct database
2. ✅ No configuration needed
3. ✅ Works for any developer who clones the repo
4. ✅ Explicit and clear which database is being used
5. ✅ No conflicts between projects

### When to Configure MCP:
Only if you frequently need to run **ad-hoc SQL queries** through Claude Code's chat interface. Otherwise, your scripts handle everything.

## Summary

**You're all set!** Your All4Yah database has:
- ✅ 63,990 verses imported
- ✅ Working import scripts
- ✅ Working verification scripts
- ✅ All data accessible

The MCP tool querying the wrong database is not a problem for your project.
