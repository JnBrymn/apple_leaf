#!/usr/bin/env bash
# Install deps, start Vite + auth server, open Chrome.
#
# Usage: bash scripts/dev.sh [game-id]
#   game-id   Optional. Opens /games/<game-id> (e.g. bomb-simulator, snake).
#             With no argument, opens the lobby (/).
#   OPEN_URL  Env override for the full URL to open.
#
# Examples:
#   bash scripts/dev.sh
#   bash scripts/dev.sh bomb-simulator
#   pnpm dev:go -- snake
set -euo pipefail
export CI="${CI:-true}"

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

# Common Windows / Cursor Node locations (Git Bash)
export PATH="$PATH:/c/Program Files/nodejs:/c/Program Files (x86)/nodejs:${APPDATA:-}/npm:${LOCALAPPDATA:-}/Programs/nodejs"
if [[ -x "/c/Program Files/cursor/resources/app/resources/helpers/node.exe" ]]; then
  export PATH="/c/Program Files/cursor/resources/app/resources/helpers:$PATH"
fi

export ARCADE_DEV_PORT="${ARCADE_DEV_PORT:-18081}"
export ARCADE_PORT="${ARCADE_PORT:-18080}"

PORT="$ARCADE_DEV_PORT"
GAME_ID="${1:-}"

if [[ -z "${OPEN_URL:-}" ]]; then
  if [[ -n "$GAME_ID" ]]; then
    OPEN_URL="http://localhost:${PORT}/games/${GAME_ID}"
  else
    OPEN_URL="http://localhost:${PORT}/"
  fi
fi

VITE_PID=""
SERVER_PID=""
PNPM_MODE="system"

cleanup() {
  if [[ -n "$VITE_PID" ]] && kill -0 "$VITE_PID" 2>/dev/null; then
    kill "$VITE_PID" 2>/dev/null || true
  fi
  if [[ -n "$SERVER_PID" ]] && kill -0 "$SERVER_PID" 2>/dev/null; then
    kill "$SERVER_PID" 2>/dev/null || true
  fi
}
trap cleanup EXIT INT TERM

run_pnpm() {
  case "$PNPM_MODE" in
    system) pnpm "$@" ;;
    local) node "$ROOT/node_modules/pnpm/bin/pnpm.cjs" "$@" ;;
    standalone) "$ROOT/.tools/pnpm.exe" "$@" ;;
    *) echo "Error: pnpm not configured." >&2; exit 1 ;;
  esac
}

ensure_node() {
  if command -v node >/dev/null 2>&1; then
    return 0
  fi
  echo "Error: Node.js not found." >&2
  echo "Install from https://nodejs.org/ or run this from Cursor's terminal." >&2
  exit 1
}

bootstrap_pnpm() {
  if command -v pnpm >/dev/null 2>&1; then
    PNPM_MODE=system
    return 0
  fi

  if command -v corepack >/dev/null 2>&1; then
    corepack enable >/dev/null 2>&1 || true
    if command -v pnpm >/dev/null 2>&1; then
      PNPM_MODE=system
      return 0
    fi
  fi

  if [[ -f "$ROOT/node_modules/pnpm/bin/pnpm.cjs" ]]; then
    PNPM_MODE=local
    return 0
  fi

  if command -v npm >/dev/null 2>&1; then
    echo "==> Bootstrapping pnpm via npm..."
    npm install
    if [[ -f "$ROOT/node_modules/pnpm/bin/pnpm.cjs" ]]; then
      PNPM_MODE=local
      return 0
    fi
  fi

  local tools="$ROOT/.tools"
  local pnpm_exe="$tools/pnpm.exe"
  mkdir -p "$tools"
  if [[ ! -f "$pnpm_exe" ]]; then
    if ! command -v curl >/dev/null 2>&1; then
      echo "Error: need pnpm, npm, or curl to install dependencies." >&2
      exit 1
    fi
    echo "==> Downloading pnpm (standalone)..."
    curl -fsSL -o "$pnpm_exe" "https://github.com/pnpm/pnpm/releases/download/v10.12.1/pnpm-win-x64.exe"
    chmod +x "$pnpm_exe"
  fi
  PNPM_MODE=standalone
}

wait_for_url() {
  local url="$1"
  local tries="${2:-60}"
  for ((i = 1; i <= tries; i++)); do
    if command -v curl >/dev/null 2>&1; then
      curl -fsS "$url" >/dev/null 2>&1 && return 0
    elif command -v wget >/dev/null 2>&1; then
      wget -q -O /dev/null "$url" 2>/dev/null && return 0
    else
      sleep 2
      return 0
    fi
    sleep 1
  done
  return 1
}

open_chrome() {
  local url="$1"
  if [[ -f "/c/Program Files/Google/Chrome/Application/chrome.exe" ]]; then
    "/c/Program Files/Google/Chrome/Application/chrome.exe" "$url" >/dev/null 2>&1 &
  elif [[ -f "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" ]]; then
    "/c/Program Files (x86)/Google/Chrome/Application/chrome.exe" "$url" >/dev/null 2>&1 &
  elif command -v google-chrome >/dev/null 2>&1; then
    google-chrome "$url" >/dev/null 2>&1 &
  elif command -v chrome >/dev/null 2>&1; then
    chrome "$url" >/dev/null 2>&1 &
  else
    cmd.exe /c start chrome "$url" >/dev/null 2>&1 || cmd.exe /c start "$url" >/dev/null 2>&1 || true
  fi
}

ensure_node
bootstrap_pnpm

if [[ -d "$ROOT/node_modules/vite" && -d "$ROOT/server/node_modules/hono" ]]; then
  echo "==> Dependencies already installed."
else
  echo "==> Installing frontend dependencies..."
  run_pnpm install

  echo "==> Installing server dependencies..."
  run_pnpm --dir server install
fi

if wait_for_url "$OPEN_URL" 3; then
  echo "==> Dev server already running."
  open_chrome "$OPEN_URL"
  echo ""
  echo "Arcade running at ${OPEN_URL}"
  exit 0
fi

echo "==> Starting auth server (port ${ARCADE_PORT})..."
run_pnpm --dir server dev &
SERVER_PID=$!

echo "==> Starting Vite (port ${PORT})..."
run_pnpm dev &
VITE_PID=$!

echo "==> Waiting for ${OPEN_URL}..."
if wait_for_url "$OPEN_URL"; then
  echo "==> Opening Chrome..."
  open_chrome "$OPEN_URL"
else
  echo "Warning: server did not respond in time; opening Chrome anyway." >&2
  open_chrome "$OPEN_URL"
fi

echo ""
echo "Arcade running at ${OPEN_URL}"
echo "Press Ctrl+C to stop both servers."
wait "$VITE_PID"
