#!/usr/bin/env bash

# Fast Deployment Script (Local Build -> Upload -> Fast Restart)
# Usage: ./deploy.sh [optional note]

set -euo pipefail

SERVER=${SERVER:-root@47.243.157.75}
REMOTE_DIR=${REMOTE_DIR:-/root/fragrantepiphany-h5}

# Parse args: optional note + --fast flag
NOTE="fast deploy"
FAST_MODE=false
for arg in "$@"; do
    if [[ "$arg" == "--fast" ]]; then
        FAST_MODE=true
    elif [[ -z "${NOTE_SET:-}" ]]; then
        NOTE="$arg"
        NOTE_SET=1
    fi
done

echo "🚀 Fast Deployment Started: $NOTE"

# 1. Build Frontend Locally
echo "🏗️  Building Frontend (VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api})..."
rm -rf frontend/dist
pushd frontend >/dev/null
VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api} npm run build
popd >/dev/null

# 2. Build Backend Locally
echo "🏗️  Building Backend..."
rm -rf backend/dist backend/assets
pushd backend >/dev/null
npm run build

# 2.1 Compile Seed Script (Directly to JS for production)
echo "📜 Compiling Seed Script..."
# Compile the TS script to JS so it can run in the production node:alpine image without ts-node
npx tsc scripts/seed_tarot_direct.ts --outDir dist/scripts \
  --target ES2019 --module commonjs --esModuleInterop --skipLibCheck --experimentalDecorators --emitDecoratorMetadata
npx tsc scripts/fix_tarot_data_v2.ts --outDir dist/scripts \
  --target ES2019 --module commonjs --esModuleInterop --skipLibCheck --experimentalDecorators --emitDecoratorMetadata
npx tsc scripts/seed_perfume_ranges.ts --outDir dist/scripts \
  --target ES2019 --module commonjs --esModuleInterop --skipLibCheck --experimentalDecorators --emitDecoratorMetadata

# 2.2 Prepare Assets for Docker
echo "📂 Copying assets for deployment..."
mkdir -p assets
# Copy from project root assets to backend/assets so Docker can access them
cp -r ../assets/excel_files assets/
# Include legacy perfume mapping for Q4/Q2 logic
cp -f ../legacy/data/perfume.xlsx assets/

popd >/dev/null

# 2.3 Git Backup (post-build to ensure builds passed; still skips in --fast)
if [[ "$FAST_MODE" == true ]]; then
    echo "⏩ Skipping Git backup (--fast mode)"
else
    echo "💾 Backing up code to GitHub..."
    git add .
    if ! git diff-index --quiet HEAD --; then
        git commit -m "Deploy: $NOTE"
        echo "✅ Changes committed."
    else
        echo "✨ No local changes to commit."
    fi
fi

# 3. Create Deployment Dockerfile
echo "📝 Creating Deployment Dockerfile..."
cat > backend/Dockerfile.deploy <<EOF
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev
COPY dist ./dist
COPY assets ./assets
COPY ormconfig.ts ./ormconfig.ts
COPY ormconfig.cjs ./ormconfig.cjs
EXPOSE 3000
CMD ["node", "dist/src/main.js"]
EOF

# 4. Upload Files
echo "📤 Uploading Frontend Assets..."
rsync -av --delete frontend/dist/ "${SERVER}:${REMOTE_DIR}/frontend/dist/"
# Crucial: Upload the Dockerfile so the remote build uses the new configuration (dist -> /var/www/html)
rsync -av frontend/Dockerfile "${SERVER}:${REMOTE_DIR}/frontend/Dockerfile"

echo "📤 Uploading Backend Artifacts..."
# Note: Added backend/assets to the list to sync the Excel files
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'uploads' \
  backend/dist backend/assets backend/package*.json backend/ormconfig.* backend/Dockerfile.deploy \
  "${SERVER}:${REMOTE_DIR}/backend/"

# Upload Config files to Root (to ensure docker compose uses latest)
echo "📤 Uploading Configs..."
rsync -av nginx.conf docker-compose*.yml "${SERVER}:${REMOTE_DIR}/"

# Also upload the Dockerfile.deploy to the correct location on server
rsync -av backend/Dockerfile.deploy "${SERVER}:${REMOTE_DIR}/backend/Dockerfile"

# 5. Remote Restart
echo "🔄 Executing Remote Restart..."
ssh -o ConnectTimeout=10 "${SERVER}" "cd ${REMOTE_DIR} && \
  docker compose up -d --build backend nginx && \
  echo '⏳ Waiting for backend to start...' && sleep 5 && \
  docker compose exec backend npx typeorm -d ormconfig.cjs migration:run && \
  echo '🌱 Seeding Tarot Data...' && \
  docker compose exec backend node dist/scripts/seed_tarot_direct.js && \
  echo '🔧 Fixing Tarot Data (ID Mismatch & Content)...' && \
  docker compose exec backend node dist/scripts/fix_tarot_data_v2.js && \
  echo '🌸 Seeding Perfume Data (Ranges)...' && \
  docker compose exec backend node dist/scripts/seed_perfume_ranges.js && \
  docker compose restart nginx"

# 6. Push to GitHub only after successful deployment (unless --fast)
if [[ "$FAST_MODE" == false ]]; then
    echo "⬆️  Pushing to remote..."
    git push
fi

echo "✅ Deployment Complete!"
