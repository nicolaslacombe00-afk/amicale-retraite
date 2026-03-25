#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$APP_ROOT"

echo "Installing dependencies..."
npm ci

echo "Generating Prisma client..."
npm run db:generate

echo "Building Next.js app..."
npm run build

echo "Deployment build complete."
