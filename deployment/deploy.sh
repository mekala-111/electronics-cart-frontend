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

echo "[health] waiting for Next on :3050..."
ok=0
for i in 1 2 3 4 5 6 7 8 9 10; do
  sleep 2
  if curl -sf -o /dev/null -w "" http://127.0.0.1:3050/; then
    echo "[health] HTTP 200 (attempt $i)"
    ok=1
    break
  fi
  echo "[health] not ready yet (attempt $i)..."
done

if [[ "$ok" -ne 1 ]]; then
  echo "[health] FAILED — last logs:" >&2
  pm2 logs ec-web --lines 40 --nostream >&2 || true
  exit 1
fi

echo "[deploy] success — aaPanel: reverse proxy → http://127.0.0.1:3050 (not PHP)"
