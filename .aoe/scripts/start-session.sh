#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'EOF'
Usage:
  .aoe/scripts/start-session.sh \
    --worktree /absolute/path/to/worktree \
    --title "My Agent" \
    [--cmd codex] \
    [--model gpt-5.3-codex] \
    [--profile default] \
    [--brief .aoe/dispatch/task.md | --message "Short message"]

Create an AoE session using the repo-standard defaults, wait for the agent
to initialize, then dispatch a short message through the reliable send wrapper.

Defaults applied:
- `aoe add ... -l -y --trust-hooks`
- Codex sessions launch with `--model gpt-5.3-codex` by default
- 5 second delay before first message
- `.aoe/scripts/send-message.sh` for Codex-safe delivery

Examples:
  .aoe/scripts/start-session.sh \
    --worktree /abs/worktree \
    --title "Impl Catalog" \
    --brief .aoe/dispatch/impl-catalog.md

  .aoe/scripts/start-session.sh \
    --worktree /abs/worktree \
    --title "Smoke Session" \
    --message "Say ACK and wait."
EOF
}

SCRIPT_DIR="$(cd -P "$(dirname "${BASH_SOURCE[0]}")" && pwd -P)"
REPO_ROOT="$(cd -P "${SCRIPT_DIR}/../.." && pwd -P)"

WORKTREE=""
TITLE=""
CMD="codex"
MODEL="gpt-5.3-codex"
MODEL_SET=0
PROFILE=""
BRIEF=""
MESSAGE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --worktree)
      WORKTREE="${2:-}"
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
    --profile)
      PROFILE="${2:-}"
      shift 2
      ;;
    --brief)
      BRIEF="${2:-}"
      shift 2
      ;;
    --message)
      MESSAGE="${2:-}"
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

if [[ -z "$WORKTREE" || -z "$TITLE" ]]; then
  echo "Missing required arguments." >&2
  usage >&2
  exit 1
fi

if [[ "$CMD" != "codex" && "$MODEL_SET" -eq 1 ]]; then
  echo "--model is only supported when --cmd codex is used." >&2
  exit 1
fi

if [[ -n "$BRIEF" && -n "$MESSAGE" ]]; then
  echo "Use either --brief or --message, not both." >&2
  exit 1
fi

if [[ -z "$BRIEF" && -z "$MESSAGE" ]]; then
  echo "Either --brief or --message is required." >&2
  exit 1
fi

WORKTREE="$(cd -P "$WORKTREE" && pwd -P)"
if [[ ! -d "$WORKTREE" ]]; then
  echo "Worktree does not exist: $WORKTREE" >&2
  exit 1
fi

if ! git -C "$WORKTREE" rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  echo "Not a git worktree: $WORKTREE" >&2
  exit 1
fi

if aoe list --json | jq -e --arg title "$TITLE" '.[] | select(.title == $title)' >/dev/null; then
  echo "An AoE session already exists with title: $TITLE" >&2
  exit 1
fi

if [[ -n "$BRIEF" ]]; then
  if [[ "$BRIEF" != /* ]]; then
    BRIEF="${WORKTREE}/${BRIEF}"
  fi
  if [[ ! -f "$BRIEF" ]]; then
    echo "Brief file does not exist: $BRIEF" >&2
    exit 1
  fi

  BRIEF_REAL="$(cd -P "$(dirname "$BRIEF")" && pwd -P)/$(basename "$BRIEF")"
  case "$BRIEF_REAL" in
    "${WORKTREE}"/*)
      MESSAGE="Read ${BRIEF_REAL#${WORKTREE}/} and execute it now."
      ;;
    *)
      echo "Brief file must be inside the target worktree: $BRIEF_REAL" >&2
      exit 1
      ;;
  esac
fi

SESSION_CMD="$CMD"
if [[ "$CMD" == "codex" ]]; then
  SESSION_CMD="codex --model ${MODEL}"
fi

AOE_ARGS=(add "$WORKTREE" -c "$SESSION_CMD" -l -y --trust-hooks -t "$TITLE")
if [[ -n "$PROFILE" ]]; then
  AOE_ARGS=(-p "$PROFILE" "${AOE_ARGS[@]}")
fi

aoe "${AOE_ARGS[@]}"

sleep 5
"${REPO_ROOT}/.aoe/scripts/send-message.sh" --session "$TITLE" --message "$MESSAGE"

echo ""
echo "Started session:"
echo "  ${TITLE}"
echo "Message:"
echo "  ${MESSAGE}"
