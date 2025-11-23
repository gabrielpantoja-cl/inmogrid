#!/bin/bash

# Quick Deploy Script for degux.cl
# This script allows fast deployment to VPS without waiting for GitHub Actions
# Usage: ./scripts/quick-deploy.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# VPS connection details
VPS_HOST="gabriel@VPS_IP_REDACTED"
VPS_DIR_APP="/home/gabriel/degux.cl"
VPS_DIR_DOCKER="/home/gabriel/vps-do"

echo -e "${BLUE}🚀 Quick Deploy Script for degux.cl${NC}"
echo -e "${BLUE}=====================================${NC}\n"

# Step 1: Push to GitHub
echo -e "${YELLOW}📤 Step 1: Pushing to GitHub...${NC}"
git status
read -p "Do you want to commit and push changes? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    read -p "Enter commit message: " commit_msg
    git add .
    git commit -m "$commit_msg" || echo "No changes to commit"
    git push origin main
    echo -e "${GREEN}✅ Pushed to GitHub${NC}\n"
else
    echo -e "${YELLOW}⏩ Skipping git push${NC}\n"
fi

# Step 2: Deploy to VPS
echo -e "${YELLOW}🔧 Step 2: Deploying to VPS...${NC}"
ssh $VPS_HOST << 'ENDSSH'
set -e

echo "📥 Pulling latest code..."
cd /home/gabriel/degux.cl
git pull origin main

echo "🐳 Navigating to Docker directory..."
cd /home/gabriel/vps-do

echo "🛑 Stopping and removing old container..."
docker stop degux-web 2>/dev/null || true
docker rm degux-web 2>/dev/null || true

echo "🏗️  Building Docker image (no cache)..."
docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache degux-web

echo "▶️  Starting new container..."
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web

echo "🧹 Cleaning up old images..."
docker image prune -f

echo "⏳ Waiting for container to be ready..."
sleep 15

echo "🔍 Checking container status..."
docker ps | grep degux-web

echo "📋 Recent logs:"
docker logs degux-web --tail 20
ENDSSH

echo -e "${GREEN}✅ Deployment completed!${NC}\n"

# Step 3: Verify deployment
echo -e "${YELLOW}🔍 Step 3: Verifying deployment...${NC}"
echo "Testing health endpoint..."
HEALTH_RESPONSE=$(curl -s https://degux.cl/api/health)
if echo "$HEALTH_RESPONSE" | grep -q '"status":"ok"'; then
    echo -e "${GREEN}✅ Health check passed${NC}"
    echo -e "${GREEN}🎉 Deployment successful!${NC}"
    echo -e "${BLUE}🌐 Visit: https://degux.cl${NC}"
else
    echo -e "${RED}❌ Health check failed${NC}"
    echo "Response: $HEALTH_RESPONSE"
    exit 1
fi
