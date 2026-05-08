# AoE Configuration

This directory contains [Agent of Empires (AoE)](https://github.com/njbrake/agent-of-empires) configuration for multi-agent orchestration in this template.

## Directory Contents

```
.aoe/
  config.toml              # AoE hooks and worktree settings
  dispatch/
    task-template.md       # Task brief template for orchestrator-created briefs
  scripts/
    add-worktree-session.sh # Create worktree from base branch, then attach AoE session
    create-dispatch.sh     # Scaffold a worktree-local dispatch brief, optionally send it
    start-session.sh       # Create an AoE session and dispatch the first short message reliably
    send-message.sh        # Reliable AoE send wrapper with Codex submit workaround
    cleanup-worktree.sh    # Remove AoE sessions for a worktree, then remove the worktree
    setup-worktree.sh      # on_create hook: assigns ports, copies .env, runs pnpm install
  README.md                # This file
```

## Reliable AoE Session Startup

For creating a **new worktree + session**, prefer:

```bash
.aoe/scripts/add-worktree-session.sh \
  --branch feat/my-feature \
  --title "My Feature" \
  --cmd codex \
  --model gpt-5.3-codex
```

This helper avoids `aoe add . -w ... -b`, which may create a branch from a stale local base branch on some setups.

For new repo sessions, prefer `.aoe/scripts/start-session.sh` over manually running `aoe add` + `sleep 5` + send-message:

```bash
.aoe/scripts/start-session.sh \
  --worktree /absolute/path/to/worktree \
  --title "Implement Feature X" \
  --brief .aoe/dispatch/feature-x.md
```

This bakes in repo-standard launch defaults:

- `-l -y --trust-hooks`
- Codex model default: `gpt-5.3-codex`
- 5 second initialization delay
- short first-message delivery via `.aoe/scripts/send-message.sh`

Claude sessions use `-c claude`. Codex sessions use `-c "codex --model gpt-5.3-codex"`.

## Useful AoE Commands

| Action                                  | Command                                                        |
| --------------------------------------- | -------------------------------------------------------------- |
| Create worktree + session in one go     | `.aoe/scripts/add-worktree-session.sh ...`                     |
| Start a session in an existing worktree | `.aoe/scripts/start-session.sh ...`                            |
| Send a follow-up message reliably       | `.aoe/scripts/send-message.sh --session "..." --message "..."` |
| Scaffold a dispatch brief               | `.aoe/scripts/create-dispatch.sh ...`                          |
| Clean up a finished worktree + sessions | `.aoe/scripts/cleanup-worktree.sh ...`                         |

Root `package.json` exposes shortcuts:

- `pnpm aoe:dispatch` → `create-dispatch.sh`
- `pnpm aoe:send` → `send-message.sh`
- `pnpm aoe:cleanup` → `cleanup-worktree.sh`

## Customizing for Your Project

- **Port assignment.** `setup-worktree.sh` defaults to a 100-port block starting at 9100. If your project has multiple services with port offsets, edit the script to match your layout.
- **Branch model.** This template ships without a develop-branch model or any GitHub webhook automation. If you need PR-merge auto-cleanup or CI-event notifications, look at hochpos-ai's `.aoe/webhook-listener.mjs` and `fast-forward-develop.sh` for a reference implementation tied to its branch model.
