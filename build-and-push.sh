#!/bin/bash
set -e

# Configuration - CHANGE THESE
DOCKER_USERNAME="your-dockerhub-username"  # Change this!
VERSION="latest"  # or use git tag: $(git describe --tags --always)

# Image names
FRONTEND_IMAGE="$DOCKER_USERNAME/insurai-frontend:$VERSION"
BACKEND_IMAGE="$DOCKER_USERNAME/insurai-backend:$VERSION"

echo "🚀 Building and pushing InsurAI Docker images for amd64 architecture..."
echo "Images will be pushed to Docker Hub as:"
echo "  - $FRONTEND_IMAGE"
echo "  - $BACKEND_IMAGE"
echo ""

# Login to Docker Hub (will prompt for password)
echo "📝 Logging into Docker Hub..."
docker login

# Build and push backend (Python service)
echo ""
echo "🐍 Building backend (Python service) for amd64..."
docker buildx build \
  --platform linux/amd64 \
  --file python-service/Dockerfile \
  --tag $BACKEND_IMAGE \
  --push \
  python-service/

echo "✅ Backend pushed successfully!"

# Build and push frontend (Next.js)
echo ""
echo "⚛️  Building frontend (Next.js) for amd64..."
docker buildx build \
  --platform linux/amd64 \
  --file Dockerfile \
  --tag $FRONTEND_IMAGE \
  --build-arg GROQ_API_KEY="${GROQ_API_KEY:-placeholder}" \
  --build-arg DATABASE_URL="${DATABASE_URL:-placeholder}" \
  --build-arg GROQ_API_BASE="${GROQ_API_BASE:-https://api.groq.com/openai/v1}" \
  --build-arg GROQ_MODEL="${GROQ_MODEL:-llama-3.3-70b-versatile}" \
  --build-arg VECTOR_SERVICE_URL="http://backend:8001" \
  --push \
  .

echo "✅ Frontend pushed successfully!"

echo ""
echo "🎉 All images built and pushed successfully!"
echo ""
echo "Next steps on your VPS:"
echo "1. Update docker-compose.yml to use these images"
echo "2. Run: docker-compose pull"
echo "3. Run: docker-compose up -d"
echo ""
echo "Or use the provided docker-compose.prod.yml"
