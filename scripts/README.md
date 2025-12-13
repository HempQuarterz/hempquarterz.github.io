# All4Yah Scripts

Scripts for deployment, configuration, and management of All4Yah.

---

## VPS Deployment

### Quick Start

```bash
# Option A: Static frontend only
./scripts/setup-vps.sh

# Option B: Full stack (frontend + backend API)
./scripts/setup-vps.sh --with-backend

# Subsequent deployments
./scripts/deploy-vps.sh
```

### Scripts Overview

| Script | Purpose |
|--------|---------|
| `setup-vps.sh` | One-time VPS initialization |
| `deploy-vps.sh` | Subsequent deployments |
| `activate-mcp.sh.template` | MCP database configuration template |

### Setup Options

```bash
./scripts/setup-vps.sh              # Static frontend only
./scripts/setup-vps.sh --with-backend  # With backend API
./scripts/setup-vps.sh --help       # Show help
```

### Deploy Options

```bash
./scripts/deploy-vps.sh              # Full deployment
./scripts/deploy-vps.sh --skip-build # Skip frontend build
./scripts/deploy-vps.sh --backend-only  # Backend only
```

### What Setup Does

1. Installs Node.js 20.x, Nginx, PM2
2. Clones repository to `/var/www/All4Yah`
3. Builds frontend with production optimizations
4. Configures Nginx with SPA routing, gzip, caching
5. Configures API proxy (Option B)
6. Starts backend with PM2 (Option B)

---

## Docker Deployment

```bash
# Production
docker-compose --profile prod up -d --build

# Development (hot reload)
docker-compose --profile dev up -d
```

See `docker-compose.yml` and `Dockerfile` in project root.

---

## PM2 Process Management

```bash
# Using ecosystem config
pm2 start ecosystem.config.js --env production

# Manual commands
pm2 restart all4yah-api
pm2 logs all4yah-api
pm2 monit
```

See `ecosystem.config.js` in project root.

---

## MCP Configuration Management

### Problem
The Supabase MCP server uses a global configuration file (`~/.config/supabase-mcp/.env`) that's shared across all VS Code workspaces. When working on multiple projects (All4Yah and Industrial Hemp), the MCP connects to whichever database was configured last.

### Solution
Project-specific configurations that can be activated with simple scripts:

### Activate All4Yah Database

```bash
source scripts/activate-mcp.sh
```

This will:
- Create a symlink: `~/.config/supabase-mcp/.env` → `~/.config/supabase-mcp-all4yah/.env`
- Export All4Yah environment variables for current terminal session
- Display project information (10 manuscripts, ~200,343 verses)

⚠️ **You MUST restart VS Code/Claude Code** after switching configurations.

### Configuration Structure

```
~/.config/
├── supabase-mcp/
│   └── .env → symlink to active project config
├── supabase-mcp-all4yah/
│   └── .env (All4Yah database: txeeaekwhkdilycefczq)
└── supabase-mcp-hemp/
    └── .env (Industrial Hemp database: ktoqznqmlnxrtvubewyz)
```

### Verify Active Configuration

```bash
cat ~/.config/supabase-mcp/.env | grep SUPABASE_PROJECT_REF
# txeeaekwhkdilycefczq = All4Yah
# ktoqznqmlnxrtvubewyz = Industrial Hemp
```

---

## Environment Variables

### Frontend (`frontend/.env`)
```bash
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key
REACT_APP_PROXY_URL=http://localhost:3001
```

### Backend (`backend/.env`)
```bash
PORT=3001
NODE_ENV=production
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPGRAM_API_KEY=...
```

---

## SSL with Let's Encrypt

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Files in This Directory

| File | Purpose | Git Tracked |
|------|---------|-------------|
| `setup-vps.sh` | VPS initial setup | ✅ Yes |
| `deploy-vps.sh` | Deployment automation | ✅ Yes |
| `activate-mcp.sh` | Database switcher | ❌ No (credentials) |
| `activate-mcp.sh.template` | Safe template | ✅ Yes |
| `README.md` | This documentation | ✅ Yes |

---

## Troubleshooting

### Nginx Issues
```bash
sudo nginx -t              # Test config
sudo systemctl reload nginx   # Reload
sudo tail -f /var/log/nginx/error.log  # View errors
```

### Backend Issues
```bash
pm2 status                 # Check status
pm2 logs all4yah-api       # View logs
pm2 restart all4yah-api    # Restart
```

### Build Issues
```bash
cd /var/www/All4Yah/frontend
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
npm run build:production
```
