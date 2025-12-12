#!/bin/bash
# ============================================================================
# All4Yah VPS Deployment Script
# ============================================================================
# Automates deployment of All4Yah monorepo to VPS
# Usage: ./scripts/deploy-vps.sh

set -e  # Exit immediately on any error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}🚀 All4Yah VPS Deployment Script${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Pull latest code from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git pull origin master
echo -e "${GREEN}✅ Code updated${NC}"
echo ""

# Build React frontend
echo -e "${YELLOW}🏗️  Building React frontend...${NC}"
cd frontend
npm install
npm run build
cd ..
echo -e "${GREEN}✅ Frontend build complete${NC}"
echo ""

# Restart Nginx to serve updated build
echo -e "${YELLOW}🔄 Restarting Nginx...${NC}"
sudo systemctl restart nginx
echo -e "${GREEN}✅ Nginx restarted${NC}"
echo ""

# If backend exists (Option B), restart it
if [ -d "backend" ]; then
  echo -e "${YELLOW}⚙️  Restarting backend API...${NC}"
  cd backend
  npm install

  # Check if using PM2
  if command -v pm2 &> /dev/null; then
    pm2 restart all4yah-api || pm2 start server.js --name all4yah-api
    echo -e "${GREEN}✅ Backend API restarted (PM2)${NC}"
  # Check if using systemd
  elif sudo systemctl is-active --quiet all4yah-api; then
    sudo systemctl restart all4yah-api
    echo -e "${GREEN}✅ Backend API restarted (systemd)${NC}"
  else
    echo -e "${YELLOW}⚠️  No process manager found. Backend must be started manually.${NC}"
  fi

  cd ..
else
  echo -e "${BLUE}ℹ️  No backend directory found (Option A deployment)${NC}"
fi

echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "  • Frontend built and deployed to: frontend/build/"
echo -e "  • Nginx restarted to serve new build"
if [ -d "backend" ]; then
  echo -e "  • Backend API restarted"
fi
echo ""
echo -e "${BLUE}🌐 Visit your site at: http://your-domain.com${NC}"
echo ""
