#!/usr/bin/env bash
set -euo pipefail

APP_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BREW_PREFIX="${HOMEBREW_PREFIX:-/opt/homebrew}"
export PATH="${BREW_PREFIX}/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:$PATH"

cd "$APP_ROOT"
exec pnpm start
