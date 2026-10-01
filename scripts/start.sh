#!/usr/bin/env bash
# One command from a clean checkout to a running app:
#   ./scripts/start.sh            install deps, import data/lenders.csv, start the dev server
#   ./scripts/start.sh --reset    same, but wipe data/app.db first (drops users' sessions and the traction log)
# Migrations and the CSV → SQLite import run when the server boots (src/instrumentation.ts);
# logins are seeded by the migrations (sdr1…sdr8, manager1, manager2; password "password").
set -euo pipefail
cd "$(dirname "$0")/.."

[ -f data/lenders.csv ] || { echo "missing data/lenders.csv" >&2; exit 1; }
[ -d node_modules ] || npm install

if [ "${1:-}" = "--reset" ]; then
  rm -f data/app.db data/app.db-shm data/app.db-wal
  echo "[start] database reset"
fi

echo "[start] importing data/lenders.csv and starting on http://localhost:3000"
exec npm run dev
