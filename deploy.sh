#!/bin/bash
set -e

echo "========================================="
echo "   EPC6 Production Deploy Script"
echo "========================================="
echo ""

# Navigate to project directory
cd "$(dirname "$0")"

echo "📥 Pulling latest code from GitHub..."
git pull origin main

echo ""
echo "🔨 Building and restarting containers..."
docker compose down
docker compose up --build -d

echo ""
echo "⏳ Waiting for services to start..."
sleep 5

echo ""
echo "🔍 Checking container status..."
docker compose ps

echo ""
echo "✅ Deploy complete!"
echo "   Frontend → http://13.60.94.157"
echo "   Admin    → http://13.60.94.157/admin/"
echo "   API      → http://13.60.94.157/api/categories"
echo ""
echo "📋 View logs: docker compose logs -f"
echo "========================================="
