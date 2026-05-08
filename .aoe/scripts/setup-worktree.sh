#!/usr/bin/env bash
set -euo pipefail

# Worktree setup hook — runs when AoE creates a new worktree session.
#
# What it does:
#   1. Assigns a unique 100-port block (9100, 9200, ..., 9900), persisted in
#      the git common dir so sibling worktrees don't collide.
#   2. Copies any top-level .env / .env.local / .dev.vars files from the main
#      worktree into the new worktree, then updates PORT_BASE in each.
#   3. Runs pnpm install so the worktree is immediately usable.
#
# Customize the port logic for your project's actual port layout
# (this template assumes a single dev port for apps/web).

PORT_BLOCK_START=9100
PORT_BLOCK_SIZE=100
PORT_BLOCK_MAX=9900

# --- Resolve paths ---
GIT_COMMON_DIR="$(git rev-parse --git-common-dir)"
REGISTRY="$GIT_COMMON_DIR/aoe-port-registry"
MAIN_REPO="$(git worktree list --porcelain | head -1 | sed 's/worktree //')"
CURRENT_DIR="$(pwd -P)"

# Root-lane sessions reuse the existing checkout — skip setup.
if [[ "$CURRENT_DIR" == "$MAIN_REPO" ]]; then
  echo "Skipping worktree setup in root checkout: $CURRENT_DIR"
  exit 0
fi

# --- Prune stale registry entries (worktrees that no longer exist) ---
if [[ -f "$REGISTRY" ]]; then
  TEMP=$(mktemp)
  while IFS='=' read -r path range; do
    [[ -z "$path" ]] && continue
    if [[ -d "$path" ]]; then
      echo "$path=$range" >> "$TEMP"
    else
      echo "Pruned stale entry: $path"
    fi
  done < "$REGISTRY"
  mv "$TEMP" "$REGISTRY"
fi

# --- Check if this worktree already has a port assigned ---
NEXT_PORT=""
if [[ -f "$REGISTRY" ]]; then
  EXISTING=$(grep "^${CURRENT_DIR}=" "$REGISTRY" 2>/dev/null | tail -1 | cut -d= -f2 || true)
  if [[ -n "$EXISTING" ]]; then
    NEXT_PORT=$EXISTING
    echo "Reusing existing port block: ${NEXT_PORT}–$((NEXT_PORT + PORT_BLOCK_SIZE - 1))"
  fi
fi

# --- Find next available port block if not already assigned ---
if [[ -z "$NEXT_PORT" ]]; then
  for (( base=PORT_BLOCK_START; base<=PORT_BLOCK_MAX; base+=PORT_BLOCK_SIZE )); do
    if [[ ! -f "$REGISTRY" ]] || ! grep -q "=$base$" "$REGISTRY"; then
      NEXT_PORT=$base
      break
    fi
  done

  if [[ -z "$NEXT_PORT" ]]; then
    echo "ERROR: No available port blocks (all slots used)" >&2
    exit 1
  fi

  # Register this worktree
  echo "$CURRENT_DIR=$NEXT_PORT" >> "$REGISTRY"
  echo "Assigned port block: ${NEXT_PORT}–$((NEXT_PORT + PORT_BLOCK_SIZE - 1))"
fi

# --- Copy .env files from main worktree ---
while IFS= read -r -d '' envfile; do
  REL="${envfile#"$MAIN_REPO"/}"
  TARGET_DIR="$(dirname "$REL")"
  mkdir -p "$TARGET_DIR"
  cp "$envfile" "$REL"
  echo "Copied $REL"
done < <(find "$MAIN_REPO" \( -name ".env" -o -name ".env.local" -o -name ".dev.vars" \) -not -path "*/node_modules/*" -print0)

# --- Helper: set PORT_BASE in an .env file ---
set_port_vars() {
  local file="$1"
  if [[ -f "$file" ]]; then
    if grep -q "^PORT_BASE=" "$file"; then
      sed -i '' "s/^PORT_BASE=.*/PORT_BASE=$NEXT_PORT/" "$file"
    else
      echo "PORT_BASE=$NEXT_PORT" >> "$file"
    fi
  fi
}

# Ensure at least a root .env exists
if [[ ! -f ".env" ]]; then
  echo "PORT_BASE=$NEXT_PORT" > ".env"
fi
set_port_vars ".env"

# Update all .env files found in the worktree
while IFS= read -r -d '' envfile; do
  set_port_vars "$envfile"
done < <(find . -name ".env" -not -path "*/node_modules/*" -print0)

echo "PORT_BASE set to $NEXT_PORT"

# --- Install dependencies ---
echo "Running pnpm install..."
pnpm install

echo ""
echo "Worktree setup complete."
echo "  Port block: ${NEXT_PORT}–$((NEXT_PORT + PORT_BLOCK_SIZE - 1))"
echo "  Dev server: http://localhost:${NEXT_PORT}"
