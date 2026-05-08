#!/usr/bin/env bash
set -euo pipefail

resolve_node_bin() {
  local candidate=""

  if command -v node >/dev/null 2>&1; then
    command -v node
    return 0
  fi

  for candidate in \
    /opt/homebrew/bin/node \
    /usr/local/bin/node \
    "$HOME"/.nvm/versions/node/*/bin/node
  do
    if [[ -x "$candidate" ]]; then
      printf '%s\n' "$candidate"
      return 0
    fi
  done

  echo "node executable not found. Set NODE_BIN or ensure node is installed." >&2
  return 1
}

NODE_BIN="${NODE_BIN:-$(resolve_node_bin)}"
usage() {
  cat <<'EOF'
Usage:
  .aoe/scripts/cleanup-worktree.sh \
    (--worktree /absolute/path/to/worktree | --branch feature/name) \
    [--delete-branch] \
    [--force] \
    [--dry-run]

Removes every AoE session attached to the target worktree, then removes the
git worktree itself. Optionally deletes the local branch after the worktree
has been removed.
EOF
}

WORKTREE=""
BRANCH_ARG=""
DELETE_BRANCH=0
FORCE=0
DRY_RUN=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree)
      WORKTREE="${2:-}"
      shift 2
      ;;
    --branch)
      BRANCH_ARG="${2:-}"
      shift 2
      ;;
    --delete-branch)
      DELETE_BRANCH=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
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

if [[ -n "$WORKTREE" && -n "$BRANCH_ARG" ]]; then
  echo "Use either --worktree or --branch, not both." >&2
  usage >&2
  exit 1
fi

if [[ -z "$WORKTREE" && -z "$BRANCH_ARG" ]]; then
  echo "Missing required argument: --worktree or --branch" >&2
  usage >&2
  exit 1
fi

REPO_ROOT="$(cd -P "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd -P)"

if [[ -n "$BRANCH_ARG" ]]; then
  case "$BRANCH_ARG" in
    main)
      echo "Refusing to clean up protected branch: $BRANCH_ARG" >&2
      exit 1
      ;;
  esac

  WORKTREE_LIST="$(git -C "$REPO_ROOT" worktree list --porcelain)"
  WORKTREE="$(
    BRANCH="$BRANCH_ARG" WORKTREE_LIST="$WORKTREE_LIST" "$NODE_BIN" <<'NODE'
const branch = process.env.BRANCH;
const lines = (process.env.WORKTREE_LIST || "").split("\n");
let currentWorktree = "";
let currentBranch = "";
let foundWorktree = "";

for (const line of lines) {
  if (line.startsWith("worktree ")) {
    currentWorktree = line.slice("worktree ".length);
    currentBranch = "";
    continue;
  }
  if (line.startsWith("branch refs/heads/")) {
    currentBranch = line.slice("branch refs/heads/".length);
    if (currentBranch === branch) {
      foundWorktree = currentWorktree;
    }
  }
}

if (foundWorktree) {
  console.log(foundWorktree);
}
NODE
  )"

  if [[ -z "$WORKTREE" ]]; then
    echo "No local worktree found for branch: $BRANCH_ARG" >&2
    exit 1
  fi
fi

if [[ ! -d "$WORKTREE" ]]; then
  echo "Worktree does not exist: $WORKTREE" >&2
  exit 1
fi

WORKTREE="$(cd -P "$WORKTREE" && pwd -P)"
if ! git -C "$WORKTREE" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git worktree: $WORKTREE" >&2
  exit 1
fi

BRANCH="$(git -C "$WORKTREE" rev-parse --abbrev-ref HEAD)"
AOE_LIST_JSON="$(aoe list --json)"

MATCHED_SESSIONS=()
while IFS= read -r row; do
  [[ -z "$row" ]] && continue
  MATCHED_SESSIONS+=("$row")
done < <(
  WORKTREE="$WORKTREE" AOE_LIST_JSON="$AOE_LIST_JSON" "$NODE_BIN" <<'NODE'
const path = require("path");

const target = process.env.WORKTREE;
const sessions = JSON.parse(process.env.AOE_LIST_JSON || "[]");
const normalizedTarget = path.resolve(target);

for (const session of sessions) {
  if (path.resolve(session.path) === normalizedTarget) {
    console.log(`${session.id}\t${session.title}`);
  }
}
NODE
)

echo "Worktree:"
echo "  ${WORKTREE}"
echo "Branch:"
echo "  ${BRANCH}"

if [[ "${#MATCHED_SESSIONS[@]}" -eq 0 ]]; then
  echo "AoE sessions:"
  echo "  none"
else
  echo "AoE sessions:"
  for row in "${MATCHED_SESSIONS[@]}"; do
    session_id="${row%%$'\t'*}"
    session_title="${row#*$'\t'}"
    echo "  ${session_title} (${session_id})"
  done
fi

if [[ "$DRY_RUN" -eq 1 ]]; then
  echo ""
  echo "Dry run only. No sessions or worktrees were removed."
  exit 0
fi

if [[ "${#MATCHED_SESSIONS[@]}" -gt 0 ]]; then
  for row in "${MATCHED_SESSIONS[@]}"; do
    session_id="${row%%$'\t'*}"
    aoe remove "$session_id"
  done
fi

if [[ "$FORCE" -eq 1 ]]; then
  git -C "$REPO_ROOT" worktree remove --force "$WORKTREE"
else
  git -C "$REPO_ROOT" worktree remove "$WORKTREE"
fi

if [[ "$DELETE_BRANCH" -eq 1 ]]; then
  case "$BRANCH" in
    main)
      echo "Refusing to delete protected branch: $BRANCH" >&2
      exit 1
      ;;
  esac

  if [[ "$FORCE" -eq 1 ]]; then
    git -C "$REPO_ROOT" branch -D "$BRANCH"
  else
    git -C "$REPO_ROOT" branch -d "$BRANCH"
  fi
fi

echo ""
echo "Cleanup complete."
