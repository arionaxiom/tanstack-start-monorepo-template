# CLAUDE.md

Claude agents must read [`AGENTS.md`](./AGENTS.md) first.

This file contains only Claude-specific additions. Shared repo rules,
architecture rules, and quality expectations live in `AGENTS.md`.

## Claude-Specific Additions

- Use the `superpowers:*` skills when they are available and relevant:
  - `superpowers:writing-plans`
  - `superpowers:brainstorming`
  - `superpowers:test-driven-development`
  - `superpowers:executing-plans`
  - `superpowers:systematic-debugging`
  - `superpowers:verification-before-completion`
- Native MCP discovery from `.mcp.json` is supported. Use `mcp__*` tool prefixes when relevant.
- AoE launch examples for Claude use `-c claude`.

## Legacy Note

This repo previously stored shared project rules in `CLAUDE.md`. Those shared rules now live in `AGENTS.md`. Existing references to `CLAUDE.md` should redirect to `AGENTS.md`.
