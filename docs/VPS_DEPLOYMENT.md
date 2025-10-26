# All4Yah VPS Deployment Guide

Complete guide for deploying the All4Yah manuscript viewer to a VPS (Virtual Private Server).

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Initial Setup](#initial-setup)
3. [Deployment Options](#deployment-options)
4. [Deployment Workflow](#deployment-workflow)
5. [Troubleshooting](#troubleshooting)
6. [Advanced Configuration](#advanced-configuration)

---

## Prerequisites

### VPS Requirements
- **Operating System:** Ubuntu 20.04+ or Debian 11+ recommended
- **RAM:** Minimum 1GB (2GB+ recommended)
- **Storage:** Minimum 10GB
- **Network:** Public IP address and domain name (optional but recommended)

### Required Software
- Node.js 18.x LTS
- Nginx
- Git
- PM2 (for backend Option B)

### Access Requirements
- SSH access to your VPS
- Sudo/root privileges
- GitHub repository access

---

## Initial Setup

### Option 1: Automated Setup (Recommended)

1. **SSH into your VPS:**
   ```bash
   ssh user@your-vps-ip
   ```

2. **Clone the All4Yah repository:**
   ```bash
   sudo mkdir -p /var/www
   cd /var/www
   sudo git clone https://github.com/HempQuarterz/hempquarterz.github.io.git All4Yah
   sudo chown -R $USER:$USER All4Yah
   cd All4Yah
   ```

3. **Run the automated setup script:**
   ```bash
   chmod +x scripts/setup-vps.sh
   ./scripts/setup-vps.sh
   ```

   This script will:
   - Update system packages
   - Install Node.js, Nginx, and PM2
   - Build the React frontend
   - Configure Nginx for static hosting
   - Create environment variable templates

### Option 2: Manual Setup

#### Step 1: Update System
```bash
sudo apt update && sudo apt upgrade -y
```

#### Step 2: Install Node.js 18.x
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
node -v  # Verify: v18.x.x
npm -v   # Verify: 9.x.x+
```

#### Step 3: Install Nginx
```bash
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

#### Step 4: Install PM2 (Optional, for backend)
```bash
sudo npm install -g pm2
```

#### Step 5: Clone Repository
```bash
cd /var/www
sudo git clone https://github.com/HempQuarterz/hempquarterz.github.io.git All4Yah
sudo chown -R $USER:$USER All4Yah
cd All4Yah
```

#### Step 6: Build Frontend
```bash
cd frontend
npm install
npm run build
cd ..
```

#### Step 7: Configure Environment Variables
```bash
cp .env.example .env
nano .env
```

Add your Supabase credentials:
```env
REACT_APP_SUPABASE_URL=https://your-project.supabase.co
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Deployment Options

### Option A: Static React + Supabase (Recommended for Simplicity)

**Architecture:**
```
User Browser → Nginx (port 80) → React Build (frontend/build/)
                                      ↓
                                  Supabase API (browser-side connection)
```

**Benefits:**
- Simpler setup and maintenance
- Lower server resource usage
- Faster deployment
- No backend process to manage

**Nginx Configuration:**
```bash
sudo nano /etc/nginx/sites-available/all4yah
```

```nginx
server {
    listen 80;
    server_name all4yah.com www.all4yah.com;  # Replace with your domain

    root /var/www/All4Yah/frontend/build;
    index index.html;

    # React Router support (SPA)
    location / {
        try_files $uri /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_types text/css application/javascript application/json;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable and reload:
```bash
sudo ln -s /etc/nginx/sites-available/all4yah /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Option B: Full-Stack with Node.js Backend (Advanced Features)

**Architecture:**
```
User Browser → Nginx (port 80) → React Build (frontend/build/)
                                      ↓ (API calls /api/*)
                            Nginx Reverse Proxy → Node.js API (port 3001)
                                                        ↓
                                                  Supabase API (server-side)
```

**Benefits:**
- Service role key protection (enhanced security)
- Server-side caching (better performance)
- Advanced divine name restoration
- Full-text search capabilities
- AI-powered features (future)

**Setup Steps:**

1. **Create backend directory and files** (if not migrating from Option A):
   ```bash
   mkdir -p backend
   cd backend
   npm init -y
   npm install express @supabase/supabase-js cors dotenv
   ```

2. **Create `backend/server.js`** (see [Backend Example](#backend-example) below)

3. **Update `.env` with service role key:**
   ```env
   # Frontend (browser-side)
   REACT_APP_SUPABASE_URL=https://your-project.supabase.co
   REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

   # Backend (server-side only)
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   PORT=3001
   ```

4. **Start backend with PM2:**
   ```bash
   cd /var/www/All4Yah/backend
   pm2 start server.js --name all4yah-api
   pm2 save
   pm2 startup  # Follow instructions to enable auto-start
   ```

5. **Update Nginx configuration:**
   ```nginx
   server {
       listen 80;
       server_name all4yah.com www.all4yah.com;

       # Frontend (React)
       location / {
           root /var/www/All4Yah/frontend/build;
           try_files $uri /index.html;
       }

       # Backend API (reverse proxy)
       location /api/ {
           proxy_pass http://localhost:3001;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
           proxy_cache_bypass $http_upgrade;
       }

       # Static asset caching
       location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$ {
           root /var/www/All4Yah/frontend/build;
           expires 1y;
           add_header Cache-Control "public, immutable";
       }
   }
   ```

6. **Reload Nginx:**
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

---

## Deployment Workflow

### Updating Your Live Site

**Automated Deployment (Recommended):**
```bash
cd /var/www/All4Yah
./scripts/deploy-vps.sh
```

This script will:
1. Pull latest code from GitHub
2. Build React frontend (`npm run build`)
3. Restart Nginx
4. Restart backend API (if Option B)

**Manual Deployment:**
```bash
cd /var/www/All4Yah

# Pull latest changes
git pull origin master

# Rebuild frontend
cd frontend
npm install
npm run build
cd ..

# Restart Nginx
sudo systemctl restart nginx

# If using Option B, restart backend
pm2 restart all4yah-api
# OR
sudo systemctl restart all4yah-api
```

---

## Troubleshooting

### Frontend Issues

**Problem:** White screen / blank page
```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Verify build exists
ls -la /var/www/All4Yah/frontend/build

# Rebuild frontend
cd /var/www/All4Yah/frontend
npm run build
```

**Problem:** 404 errors on page refresh
```bash
# Verify Nginx configuration has React Router support
sudo nano /etc/nginx/sites-available/all4yah
# Ensure: location / { try_files $uri /index.html; }

# Reload Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Backend Issues (Option B)

**Problem:** API not responding
```bash
# Check backend logs
pm2 logs all4yah-api

# Check if backend is running
pm2 status
# OR
sudo systemctl status all4yah-api

# Restart backend
pm2 restart all4yah-api
```

**Problem:** Can't connect to Supabase
```bash
# Verify environment variables
cd /var/www/All4Yah
cat .env | grep SUPABASE

# Test backend connection
curl http://localhost:3001/api/health
```

### Nginx Issues

**Problem:** Nginx won't start
```bash
# Test configuration
sudo nginx -t

# View detailed errors
sudo journalctl -u nginx -n 50
```

**Problem:** Permission denied
```bash
# Fix ownership
sudo chown -R www-data:www-data /var/www/All4Yah/frontend/build

# Fix permissions
sudo chmod -R 755 /var/www/All4Yah/frontend/build
```

---

## Advanced Configuration

### SSL/HTTPS with Let's Encrypt

**Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx
```

**Obtain SSL certificate:**
```bash
sudo certbot --nginx -d all4yah.com -d www.all4yah.com
```

**Auto-renewal test:**
```bash
sudo certbot renew --dry-run
```

Certbot will automatically update your Nginx configuration to use HTTPS.

### Domain Configuration

1. **Point your domain to VPS:**
   - Add an A record: `all4yah.com` → `your-vps-ip`
   - Add an A record: `www.all4yah.com` → `your-vps-ip`

2. **Update Nginx configuration:**
   ```bash
   sudo nano /etc/nginx/sites-available/all4yah
   ```

   Change:
   ```nginx
   server_name _;
   ```

   To:
   ```nginx
   server_name all4yah.com www.all4yah.com;
   ```

3. **Reload Nginx:**
   ```bash
   sudo systemctl reload nginx
   ```

### Performance Optimization

**Enable HTTP/2:**
```nginx
server {
    listen 443 ssl http2;
    # ... rest of config
}
```

**Enable Brotli compression** (if available):
```bash
sudo apt install nginx-module-brotli
```

```nginx
# Add to http block in /etc/nginx/nginx.conf
brotli on;
brotli_types text/plain text/css application/json application/javascript;
```

### Firewall Configuration

**Enable UFW firewall:**
```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

**Check firewall status:**
```bash
sudo ufw status
```

### Monitoring

**PM2 Monitoring (Option B):**
```bash
pm2 monit  # Live monitoring dashboard
pm2 logs all4yah-api --lines 100  # View recent logs
```

**Nginx Monitoring:**
```bash
# Access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log
```

---

## Migration Path: Option A → Option B

When you're ready to add a backend:

1. **Create backend directory and install dependencies:**
   ```bash
   mkdir -p /var/www/All4Yah/backend
   cd /var/www/All4Yah/backend
   npm init -y
   npm install express @supabase/supabase-js cors dotenv
   ```

2. **Create `server.js`** (see [Backend Example](#backend-example))

3. **Update `.env`** with `SUPABASE_SERVICE_ROLE_KEY`

4. **Start backend with PM2:**
   ```bash
   pm2 start server.js --name all4yah-api
   pm2 save
   ```

5. **Update Nginx configuration** to add `/api/` reverse proxy (see Option B above)

6. **Reload Nginx:**
   ```bash
   sudo nginx -t && sudo systemctl reload nginx
   ```

---

## Backend Example

**File: `backend/server.js`**
```javascript
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../.env' });

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Supabase client with SERVICE ROLE key (server-side only)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Example: Get popular verses with caching
const cache = new Map();
app.get('/api/verses/popular', async (req, res) => {
  try {
    if (cache.has('popular')) {
      return res.json(cache.get('popular'));
    }

    // Fetch popular verses (Psalm 23, John 3:16, etc.)
    const { data, error } = await supabase
      .from('verses')
      .select('*')
      .in('id', [
        /* specific verse IDs for popular verses */
      ]);

    if (error) throw error;

    cache.set('popular', data);
    setTimeout(() => cache.delete('popular'), 60 * 60 * 1000); // 1 hour cache

    res.json(data);
  } catch (error) {
    console.error('Error fetching popular verses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Example: Full-text search endpoint
app.get('/api/search', async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Query parameter required' });
    }

    const { data, error } = await supabase
      .rpc('search_verses_fulltext', { search_query: query });

    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error searching verses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 All4Yah API running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
});
```

---

## Summary

**Option A (Static):** Simple, fast, and sufficient for most users. Deploy with `./scripts/setup-vps.sh` and update with `./scripts/deploy-vps.sh`.

**Option B (Full-Stack):** Advanced features (caching, server-side search, AI integration). Requires backend setup and PM2 management.

For questions or issues, check the [Troubleshooting](#troubleshooting) section or review server logs.

---

**Deployment Checklist:**

- [ ] VPS provisioned with Ubuntu/Debian
- [ ] SSH access configured
- [ ] Domain DNS configured (optional)
- [ ] Repository cloned to `/var/www/All4Yah`
- [ ] Environment variables configured (`.env`)
- [ ] Frontend built (`npm run build`)
- [ ] Nginx configured and running
- [ ] SSL certificate installed (optional but recommended)
- [ ] Firewall configured (UFW)
- [ ] Backend running (Option B only)
- [ ] Deployment script tested (`./scripts/deploy-vps.sh`)

Your All4Yah manuscript viewer should now be live! 🚀
