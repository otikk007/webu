#!/usr/bin/env bash
# Builds the site and restarts it; started from the admin panel (Deploy tab).
# Usage: scripts/deploy.sh <server-pid>
#
# The live server keeps serving its build folder while the new build goes into
# the other one (.next-a / .next-b). Only a successful build is switched in:
# .next-slot names the folder `next start` uses (see next.config.ts), then the
# server process is stopped and systemd (Restart=always) starts it on the new build.
set -uo pipefail
cd "$(dirname "$0")/.."

SERVER_PID=${1:?server pid}
STATUS=data/deploy.json
mkdir -p data

exec 9>data/deploy.lock
flock -n 9 || { echo "Deploy is already running"; exit 1; }

status() { # state [slot]
  printf '{"state":"%s","pid":%s,"startedAt":"%s","finishedAt":"%s","slot":"%s"}\n' \
    "$1" "$$" "$STARTED" "${3:-}" "${2:-}" > "$STATUS.tmp" && mv "$STATUS.tmp" "$STATUS"
}

STARTED=$(date -u +%FT%TZ)
CURRENT=$(cat .next-slot 2>/dev/null || echo .next)
NEXT=.next-a; [ "$CURRENT" = .next-a ] && NEXT=.next-b
status running "$NEXT"

echo "== $(date '+%F %T')  build into $NEXT (live: $CURRENT)"
# next build rewrites tsconfig.json for a custom distDir; keep the committed one.
cp tsconfig.json data/tsconfig.json.bak
rm -rf "$NEXT"
NEXT_DIST_DIR=$NEXT ./node_modules/.bin/next build
CODE=$?
cp data/tsconfig.json.bak tsconfig.json

if [ $CODE -ne 0 ]; then
  echo "== build failed (exit $CODE); the live site was not changed"
  status failed "$NEXT" "$(date -u +%FT%TZ)"
  exit $CODE
fi

echo "$NEXT" > .next-slot
echo "== build ok, restarting the server on $NEXT"
status ok "$NEXT" "$(date -u +%FT%TZ)"
kill "$SERVER_PID"
