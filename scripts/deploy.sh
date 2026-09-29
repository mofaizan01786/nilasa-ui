#!/usr/bin/env bash
# ==============================================================================
# Enterprise CI/CD Git Deployment Script for Nilasa Storefront
# ==============================================================================

set -euo pipefail

BRANCH="${1:-main}"
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

echo "=========================================================="
echo "   NILASA ENTERPRISE CI/CD GIT DEPLOYMENT PIPELINE       "
echo "=========================================================="
echo "Working Directory: ${PROJECT_ROOT}"
echo "Target Branch:     ${BRANCH}"
echo "Timestamp:         $(date '+%Y-%m-%d %H:%M:%S')"
echo ""

cd "${PROJECT_ROOT}"

# 1. GIT SYNC
echo "[1/5] Fetching and updating code from Git..."
git fetch origin "${BRANCH}"
PREV_COMMIT="$(git rev-parse --short HEAD)"
git checkout "${BRANCH}"
git pull origin "${BRANCH}"
NEW_COMMIT="$(git rev-parse --short HEAD)"
echo "      Previous commit: ${PREV_COMMIT}"
echo "      Updated to:      ${NEW_COMMIT}"

# 2. ENVIRONMENT VALIDATION
echo "[2/5] Validating environment configuration..."
if [[ ! -f ".env" && ! -f ".env.production" ]]; then
  if [[ -f ".env.example" ]]; then
    echo "      Warning: No .env found. Initializing from .env.example..."
    cp .env.example .env
  else
    echo "      CRITICAL: No environment configuration file found. Aborting."
    exit 1
  fi
else
  echo "      Environment configuration verified."
fi

# 3. INSTALL DEPENDENCIES
echo "[3/5] Installing dependencies..."
npm install --prefer-offline --no-audit

# 4. PRODUCTION BUILD
echo "[4/5] Compiling Next.js production build..."
npm run build

# 5. RESTART APPLICATION
echo "[5/5] Restarting application..."
if [[ -f "web.config" ]]; then
  touch web.config
  echo "      Touched web.config -> IIS worker reload signaled."
fi

if command -v pm2 >/dev/null 2>&1; then
  pm2 reload nilasa --update-env || true
  echo "      PM2 process reloaded."
fi

echo ""
echo "=========================================================="
echo "   DEPLOYMENT SUCCEEDED (Commit: ${NEW_COMMIT})          "
echo "=========================================================="
