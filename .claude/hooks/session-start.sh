#!/bin/bash
set -euo pipefail

# CE Empire — SessionStart hook for Claude Code on the web.
# Installs Node dependencies so build / lint / tests work in remote sessions.

# Only run in remote (Claude Code on the web) environments.
if [ "${CLAUDE_CODE_REMOTE:-}" != "true" ]; then
  exit 0
fi

cd "$CLAUDE_PROJECT_DIR"

# This is a pnpm project (pnpm-lock.yaml + pnpm-workspace.yaml; Vercel installs
# with pnpm). Use pnpm here too so session deps match CI exactly and we don't
# churn package-lock.json by running npm.
echo "[session-start] Installing Node dependencies (pnpm install)..."
pnpm install

echo "[session-start] Dependencies ready."
