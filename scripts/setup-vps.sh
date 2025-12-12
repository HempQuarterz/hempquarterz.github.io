#!/bin/bash
# ============================================================================
# All4Yah VPS Initial Setup Script
# ============================================================================
# One-time setup script for configuring All4Yah on a fresh Ubuntu/Debian VPS
# Usage: ./scripts/setup-vps.sh

set -e  # Exit immediately on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}🚀 All4Yah VPS Initial Setup${NC}"
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

# Install Node.js (18.x LTS)
echo -e "${YELLOW}📦 Installing Node.js 18.x...${NC}"
if ! command -v node &> /dev/null; then
  curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
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

# Install PM2 (for backend Option B)
echo -e "${YELLOW}📦 Installing PM2 process manager...${NC}"
if ! command -v pm2 &> /dev/null; then
  sudo npm install -g pm2
fi
echo -e "${GREEN}✅ PM2 installed${NC}"
echo ""

# Create project directory
echo -e "${YELLOW}📁 Creating project directory...${NC}"
PROJECT_DIR="/var/www/All4Yah"
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
  git clone https://github.com/HempQuarterz/hempquarterz.github.io.git "$PROJECT_DIR"
  echo -e "${GREEN}✅ Repository cloned${NC}"
else
  echo -e "${BLUE}ℹ️  Repository already cloned${NC}"
fi
echo ""

# Navigate to project directory
cd "$PROJECT_DIR"

# Install frontend dependencies and build
echo -e "${YELLOW}🏗️  Building frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✅ Frontend built${NC}"
echo ""

# Configure Nginx (Option A - static React only)
echo -e "${YELLOW}⚙️  Configuring Nginx for All4Yah...${NC}"
NGINX_CONFIG="/etc/nginx/sites-available/all4yah"

# Create Nginx configuration
sudo tee "$NGINX_CONFIG" > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;  # Replace with your domain: all4yah.com www.all4yah.com

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
EOF

# Enable site
sudo ln -sf "$NGINX_CONFIG" /etc/nginx/sites-enabled/all4yah

# Test and reload Nginx
sudo nginx -t
sudo systemctl reload nginx
sudo systemctl enable nginx

echo -e "${GREEN}✅ Nginx configured and reloaded${NC}"
echo ""

# Create environment variables file template
echo -e "${YELLOW}📝 Creating .env template...${NC}"
cat > "$PROJECT_DIR/.env.example" <<'EOF'
# All4Yah Environment Variables
# Copy this file to .env and fill in your actual values

# Supabase Configuration
REACT_APP_SUPABASE_URL=your-supabase-url-here
REACT_APP_SUPABASE_ANON_KEY=your-anon-key-here

# Backend Configuration (if using Option B)
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
# PORT=3001
EOF

echo -e "${GREEN}✅ Environment template created at .env.example${NC}"
echo ""

echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}✅ VPS Setup Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}📊 Next Steps:${NC}"
echo ""
echo -e "${YELLOW}1. Configure environment variables:${NC}"
echo -e "   cd $PROJECT_DIR"
echo -e "   cp .env.example .env"
echo -e "   nano .env  # Fill in your Supabase credentials"
echo ""
echo -e "${YELLOW}2. (Optional) Set up SSL with Let's Encrypt:${NC}"
echo -e "   sudo apt install certbot python3-certbot-nginx"
echo -e "   sudo certbot --nginx -d your-domain.com"
echo ""
echo -e "${YELLOW}3. (Optional) Configure domain:${NC}"
echo -e "   Edit /etc/nginx/sites-available/all4yah"
echo -e "   Replace 'server_name _;' with 'server_name your-domain.com;'"
echo -e "   sudo systemctl reload nginx"
echo ""
echo -e "${YELLOW}4. For future deployments, run:${NC}"
echo -e "   cd $PROJECT_DIR && ./scripts/deploy-vps.sh"
echo ""
echo -e "${BLUE}🌐 Your site should now be accessible at: http://$(hostname -I | awk '{print $1}')${NC}"
echo ""
