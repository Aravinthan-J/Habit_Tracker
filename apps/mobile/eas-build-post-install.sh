#!/usr/bin/env bash

set -e

echo "🔧 Configuring monorepo build..."

# Build workspace packages
cd ../..
echo "📦 Building workspace packages..."
npm run build:shared
echo "✅ Workspace packages built"

# Go back to mobile app
cd apps/mobile

# Configure Android build for monorepo
echo "🔧 Configuring Android for monorepo..."
if [ -f "android/gradle.properties" ]; then
  # Add React Native node_modules path if not already present
  if ! grep -q "REACT_NATIVE_NODE_MODULES_DIR" android/gradle.properties; then
    echo "" >> android/gradle.properties
    echo "# Monorepo configuration" >> android/gradle.properties
    echo "REACT_NATIVE_NODE_MODULES_DIR=../../node_modules/react-native" >> android/gradle.properties
    echo "✅ Added REACT_NATIVE_NODE_MODULES_DIR to gradle.properties"
  fi
fi

echo "✅ Monorepo configuration complete"
