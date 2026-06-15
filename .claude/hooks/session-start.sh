#!/bin/bash
set -euo pipefail

# CE Empire — SessionStart hook for Claude Code on the web.
# Installs Node dependencies so build / lint / tests work in remote sessions.

# Only run in remote (Claude Code on the web) environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

echo "[session-start] Installing Node dependencies (npm install)..."
npm install --no-audit --no-fund

echo "[session-start] Dependencies ready."
