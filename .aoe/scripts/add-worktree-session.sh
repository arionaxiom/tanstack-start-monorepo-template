#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .aoe/scripts/add-worktree-session.sh \
    --branch feat/my-feature \
    --title "My Feature" \
    [--cmd codex] \
    [--model gpt-5.3-codex] \
    [--base main] \
    [--profile default]

Creates a git worktree from the requested base branch, then attaches an AoE
session to that worktree.

Why this helper exists:
- `aoe add . -w <branch> -b` may create from a stale local base branch.
- This helper pins worktree creation to `main` by default.
EOF
}

SCRIPT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -P "${SCRIPT_DIR}/../.." && pwd -P)"

BRANCH=""
TITLE=""
CMD="codex"
MODEL="gpt-5.3-codex"
MODEL_SET=0
BASE_BRANCH="main"
PROFILE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --branch)
      BRANCH="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --cmd)
      CMD="${2:-}"
      shift 2
      ;;
    --model)
      MODEL="${2:-}"
      MODEL_SET=1
      shift 2
      ;;
    --base)
      BASE_BRANCH="${2:-}"
      shift 2
      ;;
    --profile)
      PROFILE="${2:-}"
      shift 2
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown argument: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

if [[ -z "$BRANCH" || -z "$TITLE" ]]; then
  echo "Missing required arguments: --branch and --title" >&2
  usage >&2
  exit 1
fi

if [[ "$CMD" != "codex" && "$MODEL_SET" -eq 1 ]]; then
  echo "--model is only supported with --cmd codex." >&2
  exit 1
fi

if git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$BRANCH"; then
  echo "Branch already exists locally: $BRANCH" >&2
  exit 1
fi

if ! git -C "$REPO_ROOT" show-ref --verify --quiet "refs/heads/$BASE_BRANCH"; then
  echo "Base branch not found locally: $BASE_BRANCH" >&2
  exit 1
fi

REPO_NAME="$(basename "$REPO_ROOT")"
WORKTREE_ROOT="$(cd -P "${REPO_ROOT}/.." && pwd -P)/${REPO_NAME}-worktrees"
WORKTREE_PATH="${WORKTREE_ROOT}/${BRANCH}"

if [[ -e "$WORKTREE_PATH" ]]; then
  echo "Worktree path already exists: $WORKTREE_PATH" >&2
  exit 1
fi

mkdir -p "$WORKTREE_ROOT"

git -C "$REPO_ROOT" worktree add "$WORKTREE_PATH" -b "$BRANCH" "$BASE_BRANCH"

SESSION_CMD="$CMD"
if [[ "$CMD" == "codex" ]]; then
  SESSION_CMD="codex --model ${MODEL}"
fi

AOE_ARGS=(add "$WORKTREE_PATH" -c "$SESSION_CMD" -l -y --trust-hooks -t "$TITLE")
if [[ -n "$PROFILE" ]]; then
  AOE_ARGS=(-p "$PROFILE" "${AOE_ARGS[@]}")
fi

aoe "${AOE_ARGS[@]}"

echo ""
echo "Created worktree session:"
echo "  Title:    $TITLE"
echo "  Branch:   $BRANCH"
echo "  Base:     $BASE_BRANCH"
echo "  Worktree: $WORKTREE_PATH"
