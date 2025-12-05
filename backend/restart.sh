#!/bin/bash

# 1. Stop existing backend
cd "$(dirname "$0")"

echo "🛑 Stopping existing backend..."
pkill -f "nest start" || echo "No running backend found."

# Wait a moment for port to free up
sleep 2

# 2. Start new backend
echo "🚀 Starting backend..."
# Ensure we use localhost DB connection
export DATABASE_URL=postgres://tarot:tarot@localhost:5432/tarot

# Run in background
nohup npm run start:dev > backend.log 2>&1 &

echo "✅ Backend started! Logs are being written to backend.log"
echo "You can check logs with: tail -f backend.log"
