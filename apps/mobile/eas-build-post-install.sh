#!/usr/bin/env bash

set -e

# Configure monorepo paths for React Native libraries  
echo "Configuring Android build for monorepo..."

# Add REACT_NATIVE_NODE_MODULES_DIR to gradle.properties
if [ -f "android/gradle.properties" ]; then
  echo "REACT_NATIVE_NODE_MODULES_DIR=../../node_modules/react-native" >> android/gradle.properties
  echo "✅ Added REACT_NATIVE_NODE_MODULES_DIR to gradle.properties"
fi

echo "✅ Android build configured for monorepo"
