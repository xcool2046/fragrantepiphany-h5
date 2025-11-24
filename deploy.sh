#!/bin/bash

# 部署脚本：本地校验 -> 上传前端 dist -> 远程重建 backend + 重启 nginx
# 用法: ./deploy.sh "备注信息"（备注仅用于日志提示，可选）

set -e

NOTE=${1:-"manual deploy"}

echo "🚀 开始部署流程: $NOTE"

echo "🏗️  前端 lint & build..."
pushd frontend >/dev/null
npm run lint
npm run build
popd >/dev/null

echo "📤 上传前端静态资源..."
scp -r frontend/dist/* root@47.243.157.75:/root/fragrantepiphany-h5/frontend/dist/

echo "☁️  远程更新 backend & nginx..."
ssh root@47.243.157.75 "cd /root/fragrantepiphany-h5 && \
  echo '⬇️  拉取最新代码...' && git pull && \
  echo '🔄 重建 backend...' && docker compose up -d --build backend && \
  echo '♻️  重启 nginx...' && docker compose restart nginx"

echo "✅ 部署完成"
