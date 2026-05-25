# CODEX.md

Codex agents must read [`AGENTS.md`](./AGENTS.md) first.

This file contains only Codex-specific additions. Shared repo rules
live in `AGENTS.md`.

## Codex-Specific Additions

- If `superpowers:*` skills are available in your Codex session, use them. Do not assume availability; create the equivalent plan, TDD loop, debugging flow, and verification steps manually when they are not available.
- Do not assume native MCP discovery from `.mcp.json`. Use shell tooling, curl, and Playwright as the default fallback path.
- AoE launch examples for Codex use `-c "codex --model gpt-5.3-codex"`.

## Working Model

- Codex follows the same repo quality bar as every other agent.
- Run `pnpm lint && pnpm check-types && pnpm test` before claiming work is done.
- For frontend changes, do a live-browser smoke test before reporting completion.
