#!/usr/bin/env bash
# Production deploy: load .env → pull → npm ci → next build → PM2 reload
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [[ -f "$ROOT/.env" ]]; then
  set -a
  # shellcheck disable=SC1091
  source "$ROOT/.env"
  set +a
  echo "[deploy] loaded $ROOT/.env"
else
  echo "[deploy] ERROR: $ROOT/.env missing (NEXT_PUBLIC_* required at build time)" >&2
  exit 1
fi

if git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git checkout -B main origin/main 2>/dev/null || git checkout main
  echo "[deploy] pulling..."
  git pull --ff-only
fi

mkdir -p logs

echo "[deploy] install..."
if [[ -f package-lock.json ]]; then
  npm ci
else
  npm install
fi

echo "[deploy] build..."
npm run build

echo "[deploy] PM2..."
pm2 startOrReload deployment/ecosystem.config.js --env production --update-env
pm2 save

echo "[health] GET http://127.0.0.1:3050/"
curl -sf -o /dev/null -w "[health] HTTP %{http_code}\n" http://127.0.0.1:3050/ || {
  echo "[health] FAILED" >&2
  exit 1
}

echo "[deploy] success — proxy your site to 127.0.0.1:3050"
