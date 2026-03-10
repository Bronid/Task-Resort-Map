#!/bin/bash
set -e

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$SCRIPT_DIR"

echo "Installing dependencies..."
cd server && npm install --silent && cd ..
cd client && npm install --silent && cd ..

echo "Building frontend..."
cd client && npm run build && cd ..

echo "Building backend..."
cd server && npm run build && cd ..

echo "Starting server..."
node server/dist/index.js "$@"
