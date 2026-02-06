#!/bin/bash
set -e

echo "Building workspace packages..."
cd "$(dirname "$0")/../../.."
pwd
echo "Running turbo build..."
npx turbo run build --filter='@habit-tracker/*' --force
echo "Workspace packages built successfully"
