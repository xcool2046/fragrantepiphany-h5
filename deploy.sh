#!/usr/bin/env bash

# 手动部署辅助脚本（本地执行）
# 作用：本地构建前端 -> 同步必要文件到服务器 -> 服务器重建 backend + 迁移 + 重启 nginx
# 前置：已配置免密 ssh 到 root@47.243.157.75，服务器已有 .env

set -euo pipefail

SERVER=${SERVER:-root@47.243.157.75}
REMOTE_DIR=${REMOTE_DIR:-/root/fragrantepiphany-h5}
NOTE=${1:-"manual deploy"}

echo "🚀 部署开始: $NOTE"

echo "🏗️  构建前端 (VITE_API_BASE_URL=/api)..."
pushd frontend >/dev/null
VITE_API_BASE_URL=${VITE_API_BASE_URL:-/api} npm run build
popd >/dev/null

echo "📤 上传前端 dist..."
rsync -av --delete frontend/dist/ "${SERVER}:${REMOTE_DIR}/frontend/dist/"

echo "📤 同步后端与配置（不含 node_modules/.git/.env/uploads）..."
rsync -av --delete \
  --exclude 'node_modules' \
  --exclude '.git' \
  --exclude '.env' \
  --exclude 'uploads' \
  backend nginx.conf docker-compose*.yml "${SERVER}:${REMOTE_DIR}/"

echo "☁️  远程构建/迁移/重启..."
ssh "${SERVER}" "cd ${REMOTE_DIR} && \
  docker compose up -d --build backend nginx && \
  docker compose exec backend npm run typeorm -- -d dist/ormconfig.js migration:run && \
  docker compose restart nginx"

echo "✅ 部署完成"
