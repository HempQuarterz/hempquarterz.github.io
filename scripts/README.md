# All4Yah Project Scripts

## MCP Configuration Management

### Problem
The Supabase MCP server uses a global configuration file (`~/.config/supabase-mcp/.env`) that's shared across all VS Code workspaces. When working on multiple projects (All4Yah and Industrial Hemp), the MCP connects to whichever database was configured last.

### Solution
We've created project-specific configurations that can be activated with simple scripts:

## Quick Start

### Activate All4Yah Database

```bash
source scripts/activate-mcp.sh
```

This will:
- ✅ Create a symlink: `~/.config/supabase-mcp/.env` → `~/.config/supabase-mcp-all4yah/.env`
- ✅ Export All4Yah environment variables for current terminal session
- ✅ Display project information (10 manuscripts, ~200,343 verses)

### Important Notes

⚠️ **You MUST restart VS Code/Claude Code** after switching configurations for the MCP to use the new database connection.

## Configuration Structure

```
~/.config/
├── supabase-mcp/
│   └── .env → symlink to active project config
├── supabase-mcp-all4yah/
│   └── .env (All4Yah database: txeeaekwhkdilycefczq)
└── supabase-mcp-hemp/
    └── .env (Industrial Hemp database: ktoqznqmlnxrtvubewyz)
```

## Verify Active Configuration

```bash
# Check which project is active
cat ~/.config/supabase-mcp/.env | grep SUPABASE_PROJECT_REF

# Should show:
# SUPABASE_PROJECT_REF=txeeaekwhkdilycefczq (All4Yah)
# OR
# SUPABASE_PROJECT_REF=ktoqznqmlnxrtvubewyz (Industrial Hemp)
```

## Test Database Connection

After activating All4Yah and restarting VS Code:

```bash
# Via Node.js
node database/get-full-inventory.js

# Expected output:
# - 10 manuscripts (WLC, WEB, SBLGNT, LXX, SIN, N1904, BYZMT, TR, VUL, DSS)
# - ~200,343 total verses/lines
```

## Switching Between Projects

### All4Yah → Industrial Hemp

1. Create Hemp activation script in your Hemp project:
   ```bash
   cd /path/to/hemp/project
   mkdir -p scripts

   cat > scripts/activate-mcp.sh << 'EOF'
   #!/bin/bash
   ln -sf ~/.config/supabase-mcp-hemp/.env ~/.config/supabase-mcp/.env
   echo "✅ Activated Industrial Hemp Supabase MCP (ktoqznqmlnxrtvubewyz)"
   EOF

   chmod +x scripts/activate-mcp.sh
   ```

2. Activate when working on Hemp:
   ```bash
   source scripts/activate-mcp.sh
   # Then restart VS Code/Claude Code
   ```

### Industrial Hemp → All4Yah

```bash
cd /home/hempquarterz/projects/All4Yah/hempquarterz.github.io
source scripts/activate-mcp.sh
# Then restart VS Code/Claude Code
```

## Troubleshooting

### MCP still connects to wrong database after activation

1. **Restart VS Code/Claude Code** - MCP connections are cached
2. **Verify symlink**:
   ```bash
   ls -l ~/.config/supabase-mcp/.env
   # Should point to: ~/.config/supabase-mcp-all4yah/.env
   ```
3. **Check environment**:
   ```bash
   echo $SUPABASE_PROJECT_REF  # Should be: txeeaekwhkdilycefczq
   ```

### Lost Hemp configuration

The Hemp config was backed up during setup:
```bash
cat ~/.config/supabase-mcp-hemp/.env
```

If it's missing, you'll need to recreate it with your Hemp project credentials.

## Security

🔒 The activation scripts contain **sensitive database credentials** and are:
- ✅ Listed in `.gitignore`
- ✅ NOT committed to git
- ✅ Template version (`activate-mcp.sh.template`) provided for reference

**Never commit** files containing credentials:
- `scripts/activate-mcp.sh` ❌
- `~/.config/supabase-mcp*/` `.env` files ❌

## Files in This Directory

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `activate-mcp.sh` | Switches to All4Yah database | ❌ No (has credentials) |
| `activate-mcp.sh.template` | Safe template for setup | ✅ Yes |
| `README.md` | This documentation | ✅ Yes |

## Advanced: VS Code Workspace Profiles

For a more permanent solution, consider using [VS Code Workspace Profiles](https://code.visualstudio.com/docs/editor/profiles):

1. Create separate profiles:
   - **All4Yah Profile** - Biblical manuscripts
   - **Industrial Hemp Profile** - Hemp data

2. Each profile can have:
   - Separate MCP configurations
   - Different extensions
   - Isolated settings

This eliminates the need for manual switching.

## Need Help?

See the complete guide: `PROJECT_MCP_SETUP.md`
