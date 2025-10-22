# Docker Hub Deployment Guide

This guide explains how to build Docker images locally on your Mac and deploy them to your VPS using Docker Hub.

## Why This Approach?

- ✅ **Faster builds**: Use your powerful local Mac instead of slow VPS
- ✅ **ARM to amd64**: Build amd64 images from your ARM Mac using buildx
- ✅ **CI/CD ready**: Easy to integrate with GitHub Actions later
- ✅ **Version control**: Tag and rollback specific versions
- ✅ **Pre-generate vector DB**: Include it in the image for instant startup

## Prerequisites

1. **Docker Hub Account**: https://hub.docker.com/
2. **Docker Buildx**: Included with Docker Desktop
3. **Multi-arch support**: Enable in Docker Desktop settings

## Setup (One-Time)

### 1. Enable Docker Buildx

```bash
# On your local Mac
docker buildx create --name multiarch --driver docker-container --bootstrap
docker buildx use multiarch

# Verify
docker buildx inspect --bootstrap
# Should show: Platforms: linux/arm64, linux/amd64, ...
```

### 2. Create Docker Hub Repositories

Go to https://hub.docker.com/ and create:
- `your-username/insurai-frontend`
- `your-username/insurai-backend`

### 3. Update Configuration Files

Edit `build-and-push.sh`:
```bash
DOCKER_USERNAME="your-dockerhub-username"  # Change this!
```

Edit `docker-compose.prod.yml`:
```yaml
frontend:
  image: your-dockerhub-username/insurai-frontend:latest

backend:
  image: your-dockerhub-username/insurai-backend:latest
```

## Local Build & Push

### Option A: With Vector Database Pre-Generated (Recommended)

```bash
# 1. Generate vector database locally (fast on your Mac)
cd python-service
source venv/bin/activate
python pdf_processor.py
cd ..

# 2. Modify Dockerfile to include vector_db
# Add before ENTRYPOINT in python-service/Dockerfile:
# COPY vector_db ./vector_db

# 3. Make build script executable
chmod +x build-and-push.sh

# 4. Build and push (will prompt for Docker Hub password)
./build-and-push.sh
```

### Option B: Vector DB Generated on First Run

```bash
# Just build and push (vector DB will be generated on VPS first run)
chmod +x build-and-push.sh
./build-and-push.sh
```

**Build time comparison:**
- Mac M1/M2: ~2-5 minutes
- VPS (1-2 vCPU): ~15-30 minutes

## VPS Deployment

### 1. Upload Configuration Files

```bash
# From your local machine
scp docker-compose.prod.yml your_user@your_vps:/path/to/project/
scp .env your_user@your_vps:/path/to/project/
```

### 2. Deploy on VPS

```bash
# SSH into VPS
ssh your_user@your_vps
cd /path/to/project

# Pull pre-built images from Docker Hub
docker-compose -f docker-compose.prod.yml pull

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check logs
docker-compose -f docker-compose.prod.yml logs -f

# Check health
docker ps
curl http://localhost:8001/health
```

### 3. Copy Vector Database (If Pre-Generated)

If you pre-generated the vector DB and included it in the image, skip this.

Otherwise, copy it manually:

```bash
# From your local machine
cd python-service
tar -czf vector_db.tar.gz vector_db/
scp vector_db.tar.gz your_user@your_vps:/tmp/

# On VPS
ssh your_user@your_vps
cd /tmp
tar -xzf vector_db.tar.gz
docker cp vector_db insurance-backend:/app/
docker restart insurance-backend
```

## Update Workflow

When you make changes:

```bash
# 1. On your Mac - rebuild and push
./build-and-push.sh

# 2. On VPS - pull and restart
ssh your_user@your_vps
cd /path/to/project
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## Versioning

Use git tags for versions:

```bash
# Tag a release
git tag v1.0.0
git push origin v1.0.0

# Build with version tag
VERSION=v1.0.0 ./build-and-push.sh

# On VPS, pull specific version
docker-compose -f docker-compose.prod.yml pull
```

## Troubleshooting

### "no matching manifest for linux/arm64"
You built for ARM but VPS is amd64. Rebuild with:
```bash
docker buildx build --platform linux/amd64 ...
```

### Backend unhealthy after 240s
```bash
# Check logs
docker logs insurance-backend

# Common issues:
# 1. Vector DB generation taking too long -> Pre-generate it
# 2. Missing dependencies -> Rebuild with --no-cache
# 3. PDF files not mounted -> Check volume mounts
```

### Images too large
```bash
# Check image sizes
docker images | grep insurai

# Optimize:
# 1. Use .dockerignore
# 2. Multi-stage builds (already done)
# 3. Remove dev dependencies
```

## Cost Optimization

**Push once, deploy many times:**
- Build on fast Mac: ~3 min
- Push to Docker Hub: ~2 min (depends on internet)
- Pull on VPS: ~1 min
- **Total deployment: ~6 minutes vs 30+ minutes building on VPS**

## Future: GitHub Actions

Automate with GitHub Actions (optional):

```yaml
# .github/workflows/deploy.yml
name: Build and Push Docker Images
on:
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/setup-buildx-action@v2
      - uses: docker/login-action@v2
        with:
          username: ${{ secrets.DOCKERHUB_USERNAME }}
          password: ${{ secrets.DOCKERHUB_TOKEN }}
      - run: ./build-and-push.sh
```

This will automatically build and push on every commit to main!
