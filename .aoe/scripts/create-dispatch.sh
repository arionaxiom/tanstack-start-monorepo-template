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
  .aoe/scripts/create-dispatch.sh \
    --worktree /absolute/path/to/worktree \
    --slug impl-catalog \
    --title "Impl Catalog" \
    [--task-type implementation-pr] \
    [--goal "Refactor loader modularization"] \
    [--session "Impl Catalog"] \
    [--send] \
    [--force]

Creates a worktree-local dispatch brief at:
  .aoe/dispatch/<slug>.md

By default this only scaffolds the brief file and prints the suggested
send helper command. With `--session ... --send`, it also sends the
standard short message:
  Read .aoe/dispatch/<slug>.md and execute it.
EOF
}

SCRIPT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -P "${SCRIPT_DIR}/../.." && pwd -P)"
TEMPLATE_PATH="${REPO_ROOT}/.aoe/dispatch/task-template.md"

WORKTREE=""
SLUG=""
TITLE=""
TASK_TYPE="implementation-pr"
GOAL="<what should be accomplished>"
SESSION_TITLE=""
FORCE=0
SEND=0

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree)
      WORKTREE="${2:-}"
      shift 2
      ;;
    --slug)
      SLUG="${2:-}"
      shift 2
      ;;
    --title)
      TITLE="${2:-}"
      shift 2
      ;;
    --task-type)
      TASK_TYPE="${2:-}"
      shift 2
      ;;
    --goal)
      GOAL="${2:-}"
      shift 2
      ;;
    --session)
      SESSION_TITLE="${2:-}"
      shift 2
      ;;
    --send)
      SEND=1
      shift
      ;;
    --force)
      FORCE=1
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

if [[ -z "$WORKTREE" || -z "$SLUG" || -z "$TITLE" ]]; then
  echo "Missing required arguments." >&2
  usage >&2
  exit 1
fi

case "$TASK_TYPE" in
  investigation-only|implementation-local|implementation-pr|review|fix-existing-pr)
    ;;
  *)
    echo "Invalid --task-type: $TASK_TYPE" >&2
    exit 1
    ;;
esac

if [[ "$SEND" -eq 1 && -z "$SESSION_TITLE" ]]; then
  echo "--send requires --session." >&2
  exit 1
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
DISPATCH_DIR="${WORKTREE}/.aoe/dispatch"
TARGET_PATH="${DISPATCH_DIR}/${SLUG}.md"

mkdir -p "$DISPATCH_DIR"

if [[ -f "$TARGET_PATH" && "$FORCE" -ne 1 ]]; then
  echo "Dispatch brief already exists: $TARGET_PATH" >&2
  echo "Use --force to overwrite it." >&2
  exit 1
fi

TARGET_PATH="$TARGET_PATH" \
TEMPLATE_PATH="$TEMPLATE_PATH" \
TASK_TYPE="$TASK_TYPE" \
TITLE="$TITLE" \
GOAL="$GOAL" \
BRANCH="$BRANCH" \
WORKTREE="$WORKTREE" \
"$NODE_BIN" <<'NODE'
const fs = require("fs");

const templatePath = process.env.TEMPLATE_PATH;
const targetPath = process.env.TARGET_PATH;
const taskType = process.env.TASK_TYPE;
const title = process.env.TITLE;
const goal = process.env.GOAL;
const branch = process.env.BRANCH;
const worktree = process.env.WORKTREE;

let text = fs.readFileSync(templatePath, "utf8");
text = text.replace("`implementation-pr`", `\`${taskType}\``);
text = text.replace("<short task title>", title);
text = text.replace("<what should be accomplished>", goal);
text = text.replace("`<branch>`", `\`${branch}\``);
text = text.replace("`<absolute path>`", `\`${worktree}\``);

fs.writeFileSync(targetPath, text);
NODE

RELATIVE_BRIEF=".aoe/dispatch/${SLUG}.md"
MESSAGE="Read ${RELATIVE_BRIEF} and execute it."

echo "Created dispatch brief:"
echo "  ${TARGET_PATH}"
echo ""
echo "Suggested next step:"
echo "  .aoe/scripts/send-message.sh --session \"${SESSION_TITLE:-<session title>}\" --message \"${MESSAGE}\""

if [[ -n "$SESSION_TITLE" ]]; then
  echo ""
  echo "Session:"
  echo "  ${SESSION_TITLE}"
fi

if [[ "$SEND" -eq 1 ]]; then
  sleep 5
  "${REPO_ROOT}/.aoe/scripts/send-message.sh" --session "$SESSION_TITLE" --message "$MESSAGE"
  echo ""
  echo "Sent to session:"
  echo "  ${SESSION_TITLE}"
fi
