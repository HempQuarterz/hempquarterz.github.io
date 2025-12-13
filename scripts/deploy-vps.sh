#!/bin/bash
# ============================================================================
# All4Yah VPS Deployment Script
# ============================================================================
# Automates deployment updates to VPS
#
# Usage: ./scripts/deploy-vps.sh [--skip-build] [--backend-only]
#
# Options:
#   --skip-build      Skip frontend rebuild (faster for backend-only changes)
#   --backend-only    Only restart the backend, skip frontend entirely
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

# Parse arguments
SKIP_BUILD=false
BACKEND_ONLY=false
while [[ "$#" -gt 0 ]]; do
  case $1 in
    --skip-build) SKIP_BUILD=true ;;
    --backend-only) BACKEND_ONLY=true; SKIP_BUILD=true ;;
    -h|--help)
      echo "Usage: $0 [--skip-build] [--backend-only]"
      echo "  --skip-build    Skip frontend rebuild"
      echo "  --backend-only  Only restart backend API"
      exit 0
      ;;
    *) echo "Unknown parameter: $1"; exit 1 ;;
  esac
  shift
done

# Record start time
START_TIME=$(date +%s)

echo -e "${BLUE}============================================================================${NC}"
echo -e "${BLUE}🚀 All4Yah VPS Deployment${NC}"
echo -e "${BLUE}   $(date '+%Y-%m-%d %H:%M:%S')${NC}"
echo -e "${BLUE}============================================================================${NC}"
echo ""

# Change to project directory
cd "$PROJECT_DIR"

# Pull latest code from GitHub
echo -e "${YELLOW}📥 Pulling latest changes from GitHub...${NC}"
git fetch origin
git pull origin master
COMMIT_HASH=$(git rev-parse --short HEAD)
echo -e "${GREEN}✅ Updated to commit: ${COMMIT_HASH}${NC}"
echo ""

# Frontend deployment
if [ "$BACKEND_ONLY" = false ]; then
  if [ "$SKIP_BUILD" = false ]; then
    echo -e "${YELLOW}🏗️  Building React frontend...${NC}"
    cd frontend

    # Install dependencies if package-lock.json changed
    if git diff HEAD~1 --name-only | grep -q "frontend/package-lock.json"; then
      echo -e "${CYAN}   Installing new dependencies...${NC}"
      npm install --legacy-peer-deps
    fi

    # Build with production settings
    npm run build:production
    cd ..
    echo -e "${GREEN}✅ Frontend build complete${NC}"
  else
    echo -e "${BLUE}ℹ️  Skipping frontend build (--skip-build)${NC}"
  fi
  echo ""

  # Reload Nginx to serve updated build
  echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
  sudo nginx -t && sudo systemctl reload nginx
  echo -e "${GREEN}✅ Nginx reloaded${NC}"
  echo ""
fi

# Backend deployment (if exists)
if [ -d "backend" ]; then
  echo -e "${YELLOW}⚙️  Updating backend API...${NC}"
  cd backend

  # Install dependencies if package-lock.json changed
  if git diff HEAD~1 --name-only | grep -q "backend/package-lock.json"; then
    echo -e "${CYAN}   Installing new dependencies...${NC}"
    npm install
  fi

  # Restart with PM2
  if command -v pm2 &> /dev/null; then
    if pm2 list | grep -q "all4yah-api"; then
      pm2 restart all4yah-api
      echo -e "${GREEN}✅ Backend API restarted (PM2)${NC}"
    else
      pm2 start server.js --name all4yah-api
      pm2 save
      echo -e "${GREEN}✅ Backend API started (PM2)${NC}"
    fi
  # Check if using systemd
  elif sudo systemctl is-active --quiet all4yah-api 2>/dev/null; then
    sudo systemctl restart all4yah-api
    echo -e "${GREEN}✅ Backend API restarted (systemd)${NC}"
  else
    echo -e "${YELLOW}⚠️  No process manager found. Start backend manually:${NC}"
    echo -e "     cd $PROJECT_DIR/backend && node server.js"
  fi
  cd ..
else
  echo -e "${BLUE}ℹ️  No backend directory (Option A deployment)${NC}"
fi

# Calculate deployment time
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo -e "${GREEN}============================================================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}============================================================================${NC}"
echo ""
echo -e "${BLUE}📊 Deployment Summary:${NC}"
echo -e "   • Commit:   ${CYAN}${COMMIT_HASH}${NC}"
echo -e "   • Duration: ${CYAN}${DURATION}s${NC}"
if [ "$BACKEND_ONLY" = false ]; then
  if [ "$SKIP_BUILD" = false ]; then
    echo -e "   • Frontend: ${GREEN}Rebuilt${NC}"
  else
    echo -e "   • Frontend: ${YELLOW}Skipped${NC}"
  fi
fi
if [ -d "backend" ]; then
  echo -e "   • Backend:  ${GREEN}Restarted${NC}"
fi
echo ""

# Show PM2 status if available
if command -v pm2 &> /dev/null && pm2 list | grep -q "all4yah"; then
  echo -e "${BLUE}📈 PM2 Status:${NC}"
  pm2 list | grep -E "Name|all4yah"
  echo ""
fi

echo -e "${CYAN}🌐 Deployment live at: http://$(hostname -I | awk '{print $1}')${NC}"
echo ""
