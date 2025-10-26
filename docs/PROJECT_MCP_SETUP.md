# All4Yah Project - MCP Configuration Guide

## Problem
The Supabase MCP is connecting to the wrong database (`ktoqznqmlnxrtvubewyz` - Industrial Hemp project) instead of the All4Yah database (`txeeaekwhkdilycefczq`). This happens because MCP configurations are shared globally across all VS Code workspaces.

## Solution: Project-Specific Configuration

### Option 1: Workspace-Specific Environment Variables (Recommended)

Create a `.env.mcp` file in this project directory:

```bash
# All4Yah Supabase Configuration
SUPABASE_PROJECT_REF=txeeaekwhkdilycefczq
SUPABASE_DB_PASSWORD=@4HQZgassmoe
SUPABASE_REGION=us-east-1
SUPABASE_ACCESS_TOKEN=sbp_8bbda53f27cc215d9f5bb753c9d972035e917207
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO
```

Then update your global `~/.config/supabase-mcp/.env` to source project-specific configs:

```bash
# Load project-specific config if available
if [ -f "$PWD/.env.mcp" ]; then
  source "$PWD/.env.mcp"
fi
```

### Option 2: Separate MCP Configurations

Create separate config directories for each project:

**All4Yah MCP Config:**
```bash
mkdir -p ~/.config/supabase-mcp-all4yah
```

Create `~/.config/supabase-mcp-all4yah/.env`:
```bash
SUPABASE_PROJECT_REF=txeeaekwhkdilycefczq
SUPABASE_DB_PASSWORD=@4HQZgassmoe
SUPABASE_REGION=us-east-1
SUPABASE_ACCESS_TOKEN=sbp_8bbda53f27cc215d9f5bb753c9d972035e917207
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO
```

**Industrial Hemp MCP Config:**
```bash
mkdir -p ~/.config/supabase-mcp-hemp
```

Create `~/.config/supabase-mcp-hemp/.env`:
```bash
SUPABASE_PROJECT_REF=ktoqznqmlnxrtvubewyz
SUPABASE_DB_PASSWORD=<your-hemp-password>
SUPABASE_REGION=us-east-1
SUPABASE_ACCESS_TOKEN=<your-hemp-token>
SUPABASE_SERVICE_ROLE_KEY=<your-hemp-service-key>
```

### Option 3: Project-Specific VS Code Workspace Settings

Update `.vscode/settings.json` in each project:

**All4Yah** (`.vscode/settings.json`):
```json
{
  "terminal.integrated.env.linux": {
    "SUPABASE_PROJECT_REF": "txeeaekwhkdilycefczq",
    "SUPABASE_DB_PASSWORD": "@4HQZgassmoe",
    "SUPABASE_REGION": "us-east-1",
    "SUPABASE_ACCESS_TOKEN": "sbp_8bbda53f27cc215d9f5bb753c9d972035e917207",
    "SUPABASE_SERVICE_ROLE_KEY": "sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO"
  }
}
```

**Industrial Hemp** (`.vscode/settings.json`):
```json
{
  "terminal.integrated.env.linux": {
    "SUPABASE_PROJECT_REF": "ktoqznqmlnxrtvubewyz",
    "SUPABASE_DB_PASSWORD": "<your-hemp-password>",
    "SUPABASE_REGION": "us-east-1"
  }
}
```

### Option 4: Shell Scripts for Project Switching

Create convenience scripts in each project:

**All4Yah** (`scripts/activate-mcp.sh`):
```bash
#!/bin/bash
# Activate All4Yah MCP configuration

export SUPABASE_PROJECT_REF=txeeaekwhkdilycefczq
export SUPABASE_DB_PASSWORD='@4HQZgassmoe'
export SUPABASE_REGION=us-east-1
export SUPABASE_ACCESS_TOKEN=sbp_8bbda53f27cc215d9f5bb753c9d972035e917207
export SUPABASE_SERVICE_ROLE_KEY=sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO

# Create symlink to project-specific config
ln -sf ~/.config/supabase-mcp-all4yah/.env ~/.config/supabase-mcp/.env

echo "✅ Activated All4Yah Supabase MCP configuration"
echo "📊 Project: txeeaekwhkdilycefczq (All4Yah - Bible manuscripts)"
```

**Industrial Hemp** (`scripts/activate-mcp.sh`):
```bash
#!/bin/bash
# Activate Industrial Hemp MCP configuration

export SUPABASE_PROJECT_REF=ktoqznqmlnxrtvubewyz
export SUPABASE_DB_PASSWORD='<your-hemp-password>'
export SUPABASE_REGION=us-east-1

# Create symlink to project-specific config
ln -sf ~/.config/supabase-mcp-hemp/.env ~/.config/supabase-mcp/.env

echo "✅ Activated Industrial Hemp Supabase MCP configuration"
echo "📊 Project: ktoqznqmlnxrtvubewyz (Industrial Hemp)"
```

Usage:
```bash
# When working on All4Yah
cd /home/hempquarterz/projects/All4Yah/hempquarterz.github.io
source scripts/activate-mcp.sh

# When working on Industrial Hemp
cd /path/to/hemp/project
source scripts/activate-mcp.sh
```

## Recommended Setup (Hybrid Approach)

1. **Create separate config directories** (Option 2)
2. **Use activation scripts** (Option 4) to switch between projects
3. **Update VS Code settings** (Option 3) for terminal environment

### Implementation Steps:

```bash
# 1. Create All4Yah MCP config
mkdir -p ~/.config/supabase-mcp-all4yah
cat > ~/.config/supabase-mcp-all4yah/.env << 'EOF'
SUPABASE_PROJECT_REF=txeeaekwhkdilycefczq
SUPABASE_DB_PASSWORD=@4HQZgassmoe
SUPABASE_REGION=us-east-1
SUPABASE_ACCESS_TOKEN=sbp_8bbda53f27cc215d9f5bb753c9d972035e917207
SUPABASE_SERVICE_ROLE_KEY=sb_secret_ga_5t6BceIDCZzm5rJ8FlA_y1wxONOO
EOF

# 2. Backup current global config (Industrial Hemp)
mkdir -p ~/.config/supabase-mcp-hemp
cp ~/.config/supabase-mcp/.env ~/.config/supabase-mcp-hemp/.env

# 3. Create All4Yah activation script
mkdir -p scripts
cat > scripts/activate-mcp.sh << 'EOF'
#!/bin/bash
ln -sf ~/.config/supabase-mcp-all4yah/.env ~/.config/supabase-mcp/.env
echo "✅ Activated All4Yah Supabase MCP (txeeaekwhkdilycefczq)"
EOF
chmod +x scripts/activate-mcp.sh

# 4. Activate for this session
source scripts/activate-mcp.sh
```

## Testing the Connection

After activating the All4Yah configuration, test the connection:

```bash
# Via Node.js
node database/get-full-inventory.js

# Should show:
# - 10 manuscripts
# - ~200,000 verses
# - Including Dead Sea Scrolls (41,947 lines)
```

## Troubleshooting

### MCP still connects to wrong database

1. **Restart VS Code/Claude Code** - MCP connections are cached
2. **Check environment variables**:
   ```bash
   echo $SUPABASE_PROJECT_REF  # Should show: txeeaekwhkdilycefczq
   ```
3. **Verify symlink**:
   ```bash
   ls -l ~/.config/supabase-mcp/.env
   # Should point to: ~/.config/supabase-mcp-all4yah/.env
   ```
4. **Clear MCP cache** (if exists):
   ```bash
   rm -rf ~/.cache/mcp/* 2>/dev/null
   ```

### Projects interfering with each other

- Always run the activation script before working on a project
- Add activation to your `.bashrc` or project-specific `.envrc` (if using direnv)
- Consider using VS Code's multi-root workspaces with separate settings

## Future: VS Code Workspace Profiles

VS Code now supports [Workspace Profiles](https://code.visualstudio.com/docs/editor/profiles) which can isolate:
- Settings
- Extensions
- MCP configurations

Consider creating separate profiles:
- **All4Yah Profile** - Biblical manuscripts, Hebrew/Greek tools
- **Industrial Hemp Profile** - Hemp industry data, research tools

## Security Notes

⚠️ **IMPORTANT**: The `.env` files contain sensitive credentials:
- **Never commit** `.env` files to git
- **Add to `.gitignore`**: `.env`, `.env.*`, `scripts/activate-mcp.sh`
- **Restrict permissions**: `chmod 600 ~/.config/supabase-mcp*/.env`

## Quick Reference

| Project | Database ID | Purpose |
|---------|-------------|---------|
| All4Yah | `txeeaekwhkdilycefczq` | Biblical manuscripts, divine name restoration |
| Industrial Hemp | `ktoqznqmlnxrtvubewyz` | Hemp industry data |

**Current Active Config:**
```bash
cat ~/.config/supabase-mcp/.env | grep SUPABASE_PROJECT_REF
```

**Switch to All4Yah:**
```bash
source scripts/activate-mcp.sh
```

---

**Status**: Configuration guide created
**Next**: Implement recommended setup and test MCP connection
