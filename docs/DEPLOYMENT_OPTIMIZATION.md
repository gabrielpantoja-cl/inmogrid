# Deployment Optimization Guide

## Problem Solved
Previously, Docker image caching caused deployments to show stale code even after successful GitHub Actions runs. This guide explains the optimized deployment flow.

## Solution Overview
1. **GitHub Actions**: Always rebuild with `--no-cache` flag
2. **Container Management**: Properly stop and remove old containers before starting new ones
3. **Image Cleanup**: Remove unused Docker images to save space
4. **Quick Deploy Script**: Manual deployment option for urgent changes

## Deployment Methods

### Method 1: Automatic Deployment (GitHub Actions)
**Best for**: Regular development workflow

1. Make your changes locally
2. Commit and push to `main` branch:
   ```bash
   git add .
   git commit -m "Your descriptive message"
   git push origin main
   ```
3. GitHub Actions automatically:
   - Runs tests
   - Builds the application
   - Deploys to VPS with `--no-cache` flag
   - Verifies deployment health
4. Check deployment status at: https://github.com/yourusername/degux.cl/actions

**Deployment time**: ~5-7 minutes

### Method 2: Quick Manual Deployment
**Best for**: Urgent fixes, cache issues, or when GitHub Actions is slow

Run the quick deploy script:
```bash
cd /home/gabriel/Documentos/degux.cl
./scripts/quick-deploy.sh
```

The script will:
1. Optionally commit and push changes
2. SSH to VPS and pull latest code
3. Rebuild Docker image without cache
4. Restart the container
5. Verify health endpoint

**Deployment time**: ~3-4 minutes

### Method 3: Manual SSH Deployment
**Best for**: Debugging or custom deployment needs

```bash
# SSH to VPS
ssh gabriel@VPS_IP_REDACTED

# Pull latest code
cd ~/degux.cl
git pull origin main

# Navigate to Docker directory
cd ~/vps-do

# Stop and remove old container
docker stop degux-web
docker rm degux-web

# Rebuild without cache
docker compose -f docker-compose.yml -f docker-compose.degux.yml build --no-cache degux-web

# Start new container
docker compose -f docker-compose.yml -f docker-compose.degux.yml up -d degux-web

# Verify
docker ps | grep degux-web
docker logs degux-web --tail 30

# Test health
curl -s https://degux.cl/api/health
```

## Key Improvements

### 1. No-Cache Builds
The `--no-cache` flag ensures Docker rebuilds all layers from scratch, preventing stale code issues:
```bash
docker compose build --no-cache degux-web
```

### 2. Proper Container Cleanup
Before starting new containers, we now:
```bash
docker stop degux-web 2>/dev/null || true
docker rm degux-web 2>/dev/null || true
```

This prevents "container name in use" errors.

### 3. Image Pruning
After deployment, clean up old images:
```bash
docker image prune -f
```

This frees disk space and removes dangling images.

### 4. Health Verification
All deployment methods verify the deployment:
```bash
curl -s https://degux.cl/api/health | grep '"status":"ok"'
```

## Troubleshooting

### Issue: Changes not visible after deployment
**Solution**: Use quick deploy script with `--no-cache`:
```bash
./scripts/quick-deploy.sh
```

### Issue: Container name conflict
**Solution**: Remove old container first:
```bash
ssh gabriel@VPS_IP_REDACTED "docker stop degux-web && docker rm degux-web"
```

### Issue: Out of disk space
**Solution**: Clean up Docker resources:
```bash
ssh gabriel@VPS_IP_REDACTED "docker system prune -a -f"
```

### Issue: Build failures
**Solution**: Check logs and rebuild:
```bash
ssh gabriel@VPS_IP_REDACTED "cd ~/vps-do && docker compose logs degux-web --tail 100"
```

## Performance Comparison

| Method | Time | Cache | Best For |
|--------|------|-------|----------|
| GitHub Actions (old) | 5-7 min | ✅ Cached | Regular deploys |
| GitHub Actions (new) | 5-7 min | ❌ No cache | All deploys |
| Quick Deploy Script | 3-4 min | ❌ No cache | Urgent fixes |
| Manual SSH | 3-4 min | ❌ No cache | Debugging |

## Best Practices

1. **Use GitHub Actions for regular workflow**: Keeps deployment history and runs tests
2. **Use Quick Deploy for urgent fixes**: Faster feedback loop during development
3. **Always verify deployment**: Check health endpoint after deploy
4. **Monitor Docker resources**: Run `docker system df` periodically
5. **Keep containers lightweight**: Remove unused dependencies

## Related Documentation
- [Deployment Guide](./06-deployment/DEPLOYMENT_GUIDE.md)
- [VPS Architecture](./06-deployment/PUERTOS_VPS.md)
- [GitHub Actions Workflow](../.github/workflows/deploy-production.yml)

## Changelog

### 2025-11-22
- Added `--no-cache` flag to GitHub Actions
- Created quick deploy script
- Improved container cleanup process
- Added image pruning step
- Increased health check wait time to 15s
