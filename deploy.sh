#!/usr/bin/env bash

# Fast Deployment Script (Local Build -> Upload -> Fast Restart)
# Usage: ./deploy.sh [optional note]

set -euo pipefail

SERVER=${SERVER:-root@47.243.157.75}
REMOTE_DIR=${REMOTE_DIR:-/root/fragrantepiphany-h5}
NOTE=${1:-"fast deploy"}

echo "🚀 Fast Deployment Started: $NOTE"

# 1. Build Frontend Locally
echo "🏗️  Building Frontend (VITE_API_BASE_URL=/api)..."
pushd frontend >/dev/null
VITE_API_BASE_URL= npm run build
popd >/dev/null

# 2. Build Backend Locally
echo "🏗️  Building Backend..."
pushd backend >/dev/null
npm run build
popd >/dev/null

# 3. Create Deployment Dockerfile
echo "📝 Creating Deployment Dockerfile..."
cat > backend/Dockerfile.deploy <<EOF
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY ormconfig.ts ./ormconfig.ts
COPY ormconfig.cjs ./ormconfig.cjs
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
EOF

# 4. Upload Files
echo "📤 Uploading Frontend Assets..."
rsync -av --delete frontend/dist/ "${SERVER}:${REMOTE_DIR}/frontend/dist/"

echo "📤 Uploading Backend Artifacts..."
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'uploads' \
  backend/dist backend/package*.json backend/ormconfig.* backend/Dockerfile.deploy \
  nginx.conf docker-compose*.yml \
  "${SERVER}:${REMOTE_DIR}/backend/"

# Also upload the Dockerfile.deploy to the correct location on server
rsync -av backend/Dockerfile.deploy "${SERVER}:${REMOTE_DIR}/backend/Dockerfile"

# 5. Remote Restart
echo "🔄 Executing Remote Restart..."
ssh -o ConnectTimeout=10 "${SERVER}" "cd ${REMOTE_DIR} && \
  docker compose up -d --build backend nginx && \
  docker compose exec backend npm run typeorm -- -d dist/ormconfig.js migration:run && \
  docker compose restart nginx"

echo "✅ Deployment Complete!"
