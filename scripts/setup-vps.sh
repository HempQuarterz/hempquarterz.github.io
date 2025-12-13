#!/bin/bash
# ============================================================================
# All4Yah VPS Initial Setup Script
# ============================================================================
# One-time setup script for configuring All4Yah on a fresh Ubuntu/Debian VPS
#
# Usage: ./scripts/setup-vps.sh [--with-backend]
#
# Options:
#   --with-backend    Also set up the Node.js backend API (Option B)
#   (default)         Static frontend only (Option A)
# ============================================================================

set -e  # Exit immediately on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_DIR="/var/www/All4Yah"
REPO_URL="https://github.com/HempQuarterz/hempquarterz.github.io.git"
NODE_VERSION="20"  # LTS version
BACKEND_PORT="3001"

# Parse arguments
WITH_BACKEND=false
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --with-backend) WITH_BACKEND=true ;;
    -h|--help)
      echo "Usage: $0 [--with-backend]"
      echo "  --with-backend  Set up backend API server (Option B)"
      exit 0
      ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}🚀 All4Yah VPS Initial Setup${NC}"
if [ "$WITH_BACKEND" = true ]; then
  echo -e "${CYAN}   Mode: Full Stack (Frontend + Backend API)${NC}"
else
  echo -e "${CYAN}   Mode: Static Frontend Only${NC}"
fi
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Check if running on Ubuntu/Debian
if ! command -v apt &> /dev/null; then
  echo -e "${YELLOW}⚠️  This script is designed for Ubuntu/Debian. Adjust for your OS.${NC}"
  echo -e "${YELLOW}   Continue anyway? (y/n)${NC}"
  read -r response
  if [ "$response" != "y" ]; then
    exit 1
  fi
fi

# Update system packages
echo -e "${YELLOW}📦 Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y
echo -e "${GREEN}✅ System updated${NC}"
echo ""

# Install essential tools
echo -e "${YELLOW}📦 Installing essential tools...${NC}"
sudo apt install -y curl git build-essential
echo -e "${GREEN}✅ Essential tools installed${NC}"
echo ""

# Install Node.js (LTS)
echo -e "${YELLOW}📦 Installing Node.js ${NODE_VERSION}.x LTS...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_${NODE_VERSION}.x | sudo -E bash -
  sudo apt install -y nodejs
fi
echo -e "${GREEN}✅ Node.js installed: $(node -v)${NC}"
echo -e "${GREEN}✅ NPM installed: $(npm -v)${NC}"
echo ""

# Install Nginx
echo -e "${YELLOW}📦 Installing Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
  sudo apt install -y nginx
fi
echo -e "${GREEN}✅ Nginx installed${NC}"
echo ""

# Install PM2 (process manager)
echo -e "${YELLOW}📦 Installing PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 installed${NC}"
echo ""

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
if [ ! -d "$PROJECT_DIR" ]; then
  sudo mkdir -p "$PROJECT_DIR"
  sudo chown -R $USER:$USER "$PROJECT_DIR"
  echo -e "${GREEN}✅ Created $PROJECT_DIR${NC}"
else
  echo -e "${BLUE}ℹ️  Project directory already exists${NC}"
fi
echo ""

# Clone repository (if not already done)
echo -e "${YELLOW}📥 Cloning All4Yah repository...${NC}"
if [ ! -d "$PROJECT_DIR/.git" ]; then
  git clone "$REPO_URL" "$PROJECT_DIR"
  echo -e "${GREEN}✅ Repository cloned${NC}"
else
  echo -e "${BLUE}ℹ️  Repository already cloned, pulling latest...${NC}"
  cd "$PROJECT_DIR" && git pull origin master
fi
echo ""

# Navigate to project directory
cd "$PROJECT_DIR"

# Install frontend dependencies and build
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd frontend
npm install --legacy-peer-deps
npm run build:production
cd ..
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Setup backend if requested
if [ "$WITH_BACKEND" = true ]; then
  echo -e "${YELLOW}🔧 Setting up backend API...${NC}"
  cd backend
  npm install
  cd ..
  echo -e "${GREEN}✅ Backend dependencies installed${NC}"
  echo ""
fi

# Configure Nginx
echo -e "${YELLOW}⚙️  Configuring Nginx for All4Yah...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/all4yah"

if [ "$WITH_BACKEND" = true ]; then
  # Option B: Full stack with API proxy
  sudo tee "$NGINX_CONFIG" > /dev/null <<EOF
# All4Yah - Full Stack Configuration
# Frontend + Backend API Proxy

server {
    listen 80;
    server_name _;  # Replace with your domain: all4yah.com www.all4yah.com

    root /var/www/All4Yah/frontend/build;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # API Proxy to Node.js backend
    location /api/ {
        proxy_pass http://127.0.0.1:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Health check endpoint
    location /health {
        proxy_pass http://127.0.0.1:${BACKEND_PORT}/health;
        proxy_http_version 1.1;
        proxy_set_header Host \$host;
    }

    # React Router support (SPA) - must be after /api
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss image/svg+xml;

    # Cache static assets (1 year)
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # WebP support with PNG/JPG fallback
    location ~* ^(.+)\.(png|jpg|jpeg)$ {
        add_header Vary Accept;
        try_files \$1.webp \$uri =404;
    }
}
EOF
else
  # Option A: Static frontend only
  sudo tee "$NGINX_CONFIG" > /dev/null <<'EOF'
# All4Yah - Static Frontend Configuration

server {
    listen 80;
    server_name _;  # Replace with your domain: all4yah.com www.all4yah.com

    root /var/www/All4Yah/frontend/build;
    index index.html;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # React Router support (SPA)
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Enable gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json application/xml+rss image/svg+xml;

    # Cache static assets (1 year)
    location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|webp)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        access_log off;
    }

    # WebP support with PNG/JPG fallback
    location ~* ^(.+)\.(png|jpg|jpeg)$ {
        add_header Vary Accept;
        try_files $1.webp $uri =404;
    }
}
EOF
fi

# Remove default Nginx site if exists
sudo rm -f /etc/nginx/sites-enabled/default

# Enable site
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/all4yah

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

echo -e "${GREEN}✅ Nginx configured and reloaded${NC}"
echo ""

# Create environment files
echo -e "${YELLOW}📝 Creating environment templates...${NC}"

# Frontend .env
cat > "$PROJECT_DIR/frontend/.env" <<'EOF'
# All4Yah Frontend Environment Variables
# Fill in your Supabase credentials

REACT_APP_SUPABASE_URL=your-supabase-url-here
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Backend API URL (if using Option B)
REACT_APP_PROXY_URL=http://localhost:3001

# WSL File Watching (only for development)
# CHOKIDAR_USEPOLLING=true
# WATCHPACK_POLLING=true
EOF

if [ "$WITH_BACKEND" = true ]; then
  # Backend .env
  cat > "$PROJECT_DIR/backend/.env" <<'EOF'
# All4Yah Backend Environment Variables

# Server Configuration
PORT=3001
FRONTEND_URL=http://localhost:3000
NODE_ENV=production

# AI API Keys (for LSI features)
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
DEEPGRAM_API_KEY=...
EOF
  echo -e "${GREEN}✅ Backend .env template created${NC}"
fi

echo -e "${GREEN}✅ Frontend .env template created${NC}"
echo ""

# Start backend with PM2 if Option B
if [ "$WITH_BACKEND" = true ]; then
  echo -e "${YELLOW}🚀 Starting backend API with PM2...${NC}"
  cd "$PROJECT_DIR/backend"
  pm2 start server.js --name all4yah-api
  pm2 save
  pm2 startup | tail -1 | sudo bash
  cd ..
  echo -e "${GREEN}✅ Backend API running on port ${BACKEND_PORT}${NC}"
  echo ""
fi

# Get server IP
SERVER_IP=$(hostname -I | awk '{print $1}')

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "   • Frontend: ${GREEN}Deployed${NC} at /var/www/All4Yah/frontend/build"
if [ "$WITH_BACKEND" = true ]; then
  echo -e "   • Backend:  ${GREEN}Running${NC} on port ${BACKEND_PORT} (PM2)"
fi
echo -e "   • Nginx:    ${GREEN}Configured${NC} and serving"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure environment variables:${NC}"
echo -e "   nano $PROJECT_DIR/frontend/.env"
if [ "$WITH_BACKEND" = true ]; then
  echo -e "   nano $PROJECT_DIR/backend/.env"
fi
echo ""
echo -e "${YELLOW}2. Rebuild frontend after .env changes:${NC}"
echo -e "   cd $PROJECT_DIR/frontend && npm run build:production"
echo ""
echo -e "${YELLOW}3. Set up SSL with Let's Encrypt:${NC}"
echo -e "   sudo apt install certbot python3-certbot-nginx"
echo -e "   sudo certbot --nginx -d your-domain.com"
echo ""
echo -e "${YELLOW}4. Configure your domain:${NC}"
echo -e "   Edit /etc/nginx/sites-available/all4yah"
echo -e "   Replace 'server_name _;' with 'server_name your-domain.com;'"
echo -e "   sudo systemctl reload nginx"
echo ""
echo -e "${YELLOW}5. For future deployments:${NC}"
echo -e "   cd $PROJECT_DIR && ./scripts/deploy-vps.sh"
echo ""
if [ "$WITH_BACKEND" = true ]; then
  echo -e "${YELLOW}6. Monitor backend logs:${NC}"
  echo -e "   pm2 logs all4yah-api"
  echo -e "   pm2 monit"
  echo ""
fi
echo -e "${CYAN}🌐 Your site is now accessible at: http://${SERVER_IP}${NC}"
echo ""
