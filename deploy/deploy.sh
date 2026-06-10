#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LABEL="${ARCADE_LAUNCHD_LABEL:-com.appleleaf.arcade}"
PLIST_PATH="${HOME}/Library/LaunchAgents/${LABEL}.plist"
BREW_PREFIX="${HOMEBREW_PREFIX:-/opt/homebrew}"
export PATH="${BREW_PREFIX}/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

cd "$APP_ROOT"
mkdir -p logs

echo "==> Deploying apple_leaf from $(pwd)"
echo "==> Git status before deploy"
git status --short

echo "==> Fetching latest main"
git fetch origin main
git reset --hard origin/main

echo "==> Installing dependencies"
pnpm install --frozen-lockfile
pnpm --dir server install --frozen-lockfile

echo "==> Building frontend"
pnpm build

if [[ -f "$PLIST_PATH" ]]; then
  echo "==> Restarting launchd service $LABEL"
  if launchctl print "gui/$(id -u)/$LABEL" >/dev/null 2>&1; then
    launchctl kickstart -k "gui/$(id -u)/$LABEL"
  else
    launchctl bootstrap "gui/$(id -u)" "$PLIST_PATH"
    launchctl kickstart -k "gui/$(id -u)/$LABEL"
  fi
else
  echo "==> No launchd plist found at $PLIST_PATH"
  echo "==> Build completed, but service was not restarted"
fi

echo "==> Deploy complete"
