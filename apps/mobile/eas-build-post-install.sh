#!/usr/bin/env bash

set -e

echo "🔧 Configuring monorepo build..."

# Build workspace packages FIRST
cd ../..
echo "📦 Building workspace packages..."
npm run build:shared
echo "✅ Workspace packages built"

# Go back to mobile app
cd apps/mobile

echo "✅ Monorepo configuration complete"
