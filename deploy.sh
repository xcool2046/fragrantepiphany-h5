#!/bin/bash

# 部署脚本
# 用法: ./deploy.sh "提交信息"

if [ -z "$1" ]; then
  echo "错误: 请提供提交信息"
  echo "用法: ./deploy.sh \"您的提交信息\""
  exit 1
fi

COMMIT_MSG="$1"

echo "🚀 开始部署流程..."

# 1. 本地提交并推送
echo "📦 正在提交代码..."
git add .
git commit -m "$COMMIT_MSG"

echo "⬆️  正在推送到 GitHub..."
git push

if [ $? -ne 0 ]; then
  echo "❌ 推送失败，请检查网络或冲突"
  exit 1
fi

# 2. 服务器更新
echo "☁️  正在连接服务器进行更新..."
ssh root@47.243.157.75 "cd /root/fragrantepiphany-h5 && \
  echo '⬇️  拉取最新代码...' && \
  git pull && \
  echo '🔄 重建并重启服务...' && \
  docker compose up -d --build && \
  echo '♻️  重启 Nginx 以确保连接...' && \
  docker compose restart nginx"

echo "✅ 部署完成！"
