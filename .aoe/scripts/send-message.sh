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
  .aoe/scripts/send-message.sh \
    --session "Session Title" \
    --message "Message text"

Reliable wrapper around `aoe send`.

- Always delivers the message through `aoe send`
- For Codex AoE sessions, also sends an extra tmux `C-m` submit key
  because AoE 1.3.0 can leave Codex messages inserted but unsubmitted
EOF
}

SESSION_REF=""
MESSAGE=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --session)
      SESSION_REF="${2:-}"
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

if [[ -z "$SESSION_REF" || -z "$MESSAGE" ]]; then
  echo "Missing required arguments." >&2
  usage >&2
  exit 1
fi

AOE_LIST_JSON="$(aoe list --json)"
SESSION_JSON="$(
  SESSION_REF="$SESSION_REF" AOE_LIST_JSON="$AOE_LIST_JSON" "$NODE_BIN" <<'NODE'
const sessions = JSON.parse(process.env.AOE_LIST_JSON || "[]");
const ref = process.env.SESSION_REF;

const idMatches = sessions.filter((session) => session.id === ref);
if (idMatches.length === 1) {
  process.stdout.write(JSON.stringify(idMatches[0]));
  process.exit(0);
}

const titleMatches = sessions.filter((session) => session.title === ref);
if (titleMatches.length === 1) {
  process.stdout.write(JSON.stringify(titleMatches[0]));
  process.exit(0);
}

if (idMatches.length > 1 || titleMatches.length > 1) {
  console.error(`Multiple AoE sessions matched: ${ref}`);
  process.exit(2);
}

console.error(`No AoE session matched: ${ref}`);
process.exit(2);
NODE
)"

SESSION_ID="$(
  SESSION_JSON="$SESSION_JSON" "$NODE_BIN" -p 'JSON.parse(process.env.SESSION_JSON).id'
)"
SESSION_TITLE="$(
  SESSION_JSON="$SESSION_JSON" "$NODE_BIN" -p 'JSON.parse(process.env.SESSION_JSON).title'
)"
SESSION_TOOL="$(
  SESSION_JSON="$SESSION_JSON" "$NODE_BIN" -p 'JSON.parse(process.env.SESSION_JSON).tool'
)"

aoe send "$SESSION_TITLE" "$MESSAGE"

if [[ "$SESSION_TOOL" != "codex" ]]; then
  exit 0
fi

sleep 0.2

ID_PREFIX="${SESSION_ID:0:8}"
TMUX_TARGET="$(
  tmux list-panes -a -F '#{session_name}|#{window_index}.#{pane_index}' \
    | awk -F '|' -v suffix="_${ID_PREFIX}" '$1 ~ /^aoe_/ && $1 ~ suffix "$" { print $1 ":" $2; exit }'
)" || true

if [[ -z "$TMUX_TARGET" ]]; then
  echo "Codex submit workaround failed: could not resolve tmux target for ${SESSION_TITLE} (${SESSION_ID})." >&2
  echo "The message was inserted via aoe send but may still require a manual Enter in the AoE TUI." >&2
  exit 1
fi

tmux send-keys -t "$TMUX_TARGET" C-m
