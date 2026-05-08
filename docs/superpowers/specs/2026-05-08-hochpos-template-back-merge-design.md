# Hochpos → Template Back-Merge

**Date:** 2026-05-08
**Status:** Spec — awaiting implementation plan

---

## Goal

Bring proven, generic improvements from `../hochpos-ai` (a downstream project bootstrapped from this template) back into `tanstack-start-monorepo-template`. Specifically:

1. Migrate UI primitives from Radix UI to Base UI
2. Pull in hochpos's pinned-package decisions (TypeScript dedupe, vitest 4.0.18, react/react-dom 19.2.0, etc.)
3. Replace DevMux with AoE for multi-agent orchestration
4. Split `CLAUDE.md` into `AGENTS.md` (shared) + `CLAUDE.md` / `CODEX.md` overlays
5. Adopt a curated subset of `FRONTEND_RULES.md`
6. Copy hochpos's OKLCH 3-tier theme/design system literally
7. Bump all non-pinned dependencies to latest

The template's existing app-name placeholder (`__APP_NAME__`) is preserved everywhere.

## Non-goals

- No `apps/api` backend (NestJS, Drizzle, MeiliSearch) — hochpos-specific
- No proposal-engine / AI orchestration concepts
- No project-specific modules (stock, leadgen, jobs)
- No Cloudflare-tunnel / GitHub-webhook automation
- No `develop` branch model or hochpos-flavoured AoE branch hooks
- No `BACKEND_RULES.md`, `WORKFLOW.md`, `QA_TESTING.md` — too project-specific

## Phase order & dependency graph

```
P1 Theme + tooling foundation        ← unblocks everything below
P2 Dependency bumps                   ← bulk update except pinned set
P3 test-utils package extraction      ← required before ESLint testing-library ban
P4 ESLint config enhancements         ← lands before UI rebuild so new files lint clean
P5 UI elements rebuild (Base UI)      ← consumes P1 theme + P4 lint rules
P6 .aoe/ directory                    ← independent
P7 Docs split                          ← lands last; references everything above
```

**Hard constraints:**

- P1 before P5 (UI elements consume new theme tokens)
- P2 right after P1 so all subsequent phases run on fresh deps
- P3 before P4 (testing-library ban requires the test-utils package to exist)
- P4 before P5 (UI files lint under new rules)
- P6 and P7 can run any time after P5

**Each phase ends with green:**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

A phase is "done" only when all four commands pass with zero warnings and zero errors.

---

## P1 — Theme + tooling foundation

### Files written

- **`packages/tailwind-config/shared-styles.css`** — overwrite with hochpos's 438-line OKLCH 3-tier system, literal copy. Keeps brand teal (`#006152`), spotlight orange (`#ff4400`), and module accents (`--accent-stock`, `--accent-leadgen`, `--accent-jobs`). Future projects re-skin by editing tokens.
- **`packages/tailwind-config/package.json`** — add deps:
  - `@fontsource-variable/inter`
  - `@fontsource/ibm-plex-sans-thai`
  - `@fontsource-variable/jetbrains-mono`
- **Root `package.json`** — `pnpm.overrides` adds:
  - `@types/react: ~19.2.14`
  - `@types/react-dom: ~19.2.3`
  - `@vitest/spy: 4.0.18`
  - `typescript: ~5.9.2`
  - `@lingui/core: ^5.9.4`
- **Root `package.json`** — `pnpm.onlyBuiltDependencies` extended only as needed (no NestJS-specific entries; existing template values stay).
- **`PINNED_PACKAGES.md`** — add `typescript ~5.9.2` row with the dedupe rationale block (see hochpos `PINNED_PACKAGES.md` for the verbatim text); remove the `recharts ^2.15.3` row (no longer pinned, hochpos resolved it via Recharts v3 + shadcn chart props).
- **`packages/ui/package.json`** — add `@base-ui/react: ^1.3.0` dep. Do NOT remove `radix-ui` umbrella import yet — that happens in P5 when elements get rewritten.

### Verification

`pnpm install && pnpm check-types && pnpm lint && pnpm test` — all green.

---

## P2 — Dependency bumps

### Mechanics

```bash
pnpm update --latest --recursive
```

`pnpm.overrides` (set in P1) protects the pinned set regardless of how `pnpm update` rewrites individual `package.json` ranges. Pinned set:

- `react`, `react-dom` → `19.2.0`
- `@types/react` → `~19.2.14`, `@types/react-dom` → `~19.2.3`
- `typescript` → `~5.9.2`
- `vitest`, `@vitest/coverage-v8`, `@vitest/runner`, `@vitest/spy` → `4.0.18`

### Post-bump cleanup

- Re-tighten the pinned semvers in each `package.json` so they read as exact (`react: "19.2.0"`, not `^19.x`). Keeps the source of truth visible.
- Run the verification gate.

### Likely-breaking culprits to watch

- `recharts` (already on v3, but minor bumps can ripple)
- `@tanstack/react-router`, `@tanstack/react-query`, `@tanstack/react-form` family
- `tailwindcss` (already 4.2.x — minor bumps usually safe, but Tailwind v4 still moves)
- `vite`, `@vitejs/plugin-react-swc`
- `@lingui/swc-plugin` (5.9.3 → 5.11.0 already planned)
- `lucide-react` (already on v1.7.0; bumps may rename some icons)

### Escape hatch

If a single bump is too disruptive to absorb in this migration, revert that one package's bump and document the new pin in `PINNED_PACKAGES.md` with the reason. Do not block the migration on edge-case bumps.

### Verification

Full check-types/lint/test cycle. Commit lockfile.

---

## P3 — `packages/test-utils` extraction

### New package: `packages/test-utils/`

```
packages/test-utils/
  package.json        # mirrors hochpos: deps on @lingui/core, @lingui/react, @testing-library/react
  tsconfig.json       # extends @__APP_NAME__/typescript-config/react-library.json
  eslint.config.js    # extends base config
  src/
    index.ts          # named exports
    react.tsx         # TestProviders + customRender + customRenderHook
```

Copy `src/index.ts` and `src/react.tsx` from hochpos, then sed `@hochpos-ai/*` → `@__APP_NAME__/*` and any project-specific provider wiring out (e.g., if hochpos's `TestProviders` references hooks the template doesn't have).

### Existing test-utils files become re-export shims

- `packages/ui/src/test-utils.tsx` → re-exports everything from `@__APP_NAME__/test-utils/react`
- `packages/react-hooks/src/test-utils.tsx` → same

Both consuming packages add `@__APP_NAME__/test-utils: workspace:*` to their `package.json`.

### Shared vitest runner

- **`scripts/vitest-run.mjs`** — copy hochpos's wrapper verbatim (CLI arg normalizer that strips `--` separators and runs `vitest run`).
- Each package's `test` script changes from direct `vitest run --silent=true` to `node ../../scripts/vitest-run.mjs --silent=true`.

### Verification

`pnpm test` — all React + react-hooks tests pass. Critically, this is the gate that proves the typescript-pin / test-utils dedupe works (per the rationale in `PINNED_PACKAGES.md`).

---

## P4 — ESLint config enhancements

### Edits to `packages/eslint-config/base.js`

Adopt hochpos's structure with the project-specific bits stripped:

**Bring (template-worthy):**

```js
const bannedPackages = [
  {
    name: "redux",
    message: "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md)",
  },
  {
    name: "@reduxjs/toolkit",
    message: "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md)",
  },
  {
    name: "mobx",
    message: "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md)",
  },
  { name: "mobx-react", message: "..." },
  { name: "mobx-react-lite", message: "..." },
  {
    name: "framer-motion",
    message: "Use Tailwind transitions + tw-animate-css (FRONTEND_RULES.md)",
  },
  { name: "motion", message: "..." },
];

const bannedTestingLibrary = {
  name: "@testing-library/react",
  message:
    "Import from the package's own test-utils instead (see AGENTS.md testing conventions)",
};

const bannedRelativeParent = {
  group: ["../*"],
  message:
    "Relative parent imports (../) are banned. Use absolute imports (@__APP_NAME__/* or @/) instead. Same-directory (./) imports are allowed.",
};
```

Plus `no-restricted-syntax`:

- Ban `JSXAttribute[name.name='className'][value.expression.type='TemplateLiteral']` → "Use cn() to compose className"
- Ban `JSXAttribute[name.name='className'][value.expression.type='BinaryExpression']` → "Use cn() to compose className"

Plus the file-pattern override that re-allows `@testing-library/react` only in:

- `src/test-utils.tsx`, `src/test-utils.ts`
- `src/react.tsx`, `src/index.ts` (under `packages/test-utils/`)
- `test-setup.ts` (vitest setup files)

### Cross-layer import helpers

Keep the structural pattern (`pkg`, `aboveL1`, `aboveL2`, etc.) but rebuild the package list to match the template's actual layers:

```
L0: types, locale, assets, test-utils, tailwind-config, eslint-config, typescript-config
L1: utils, constants, form-options
L2: react-hooks, node-fn
L3: ui
L4: apps/web
```

(Adjust this layer diagram if it differs from the template's current `CLAUDE.md` — same source of truth.)

### Drop from hochpos

- Proposal action regex (`noInlineTypedStrings`)
- Scope string regex
- Source-of-truth file overrides for `packages/db`, `packages/domain`, `apps/api/src/database/migrations`
- Reference to `apps/api` and `packages/db` / `packages/domain` / `packages/agent` / `packages/meilisearch` in the cross-layer lists

### `react-internal.js` — wire custom rule

Hochpos adds a custom ESLint plugin namespace that exposes `require-testid-on-action-elements`. Port this with a generic namespace:

- Copy `packages/eslint-config/rules/require-testid-on-action-elements.cjs` from hochpos
- Copy `packages/eslint-config/rules/require-testid-on-action-elements.test.cjs` from hochpos (if relevant for template)
- In `react-internal.js`, register the rule under a generic namespace (e.g., `template/require-testid-on-action-elements` or `app/require-testid-on-action-elements`) — drop the `hochpos/` prefix

This rule directly enforces FRONTEND_RULES.md R8/R9 (in the renumbered template, R8 is "data-testid mandatory on form inputs, submit buttons, etc.").

### `packages/eslint-config/rules/` directory

New in template: copy the `require-testid-on-action-elements.cjs` (and test) from hochpos. No other rule files in hochpos's `rules/` directory.

### Verification

`pnpm lint` — zero warnings across all packages.

---

## P5 — UI elements rebuild (Base UI)

### Setup

- **`packages/ui/components.json`** — copy hochpos's, change aliases to `@__APP_NAME__/ui/*`
- **`apps/web/components.json`** — same

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-vega",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../tailwind-config/shared-styles.css",
    "baseColor": "neutral",
    "cssVariables": true,
    "prefix": ""
  },
  "aliases": {
    "components": "@__APP_NAME__/ui/elements",
    "utils": "@__APP_NAME__/ui/utils",
    "ui": "@__APP_NAME__/ui/elements",
    "lib": "@__APP_NAME__/ui/lib",
    "hooks": "@__APP_NAME__/ui/hooks"
  },
  "iconLibrary": "lucide"
}
```

- **`packages/ui/package.json`** — drop direct `radix-ui` umbrella import (the elements no longer use it after rewrite). Transitive Radix from `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker`, etc. stays in lockfile — that's expected.

### Rebuild loop

```bash
cd packages/ui
rm src/elements/*.tsx

ELEMENTS=(
  accordion alert alert-dialog aspect-ratio avatar badge breadcrumb
  button button-group calendar card carousel chart checkbox collapsible
  combobox command context-menu dialog drawer dropdown-menu empty field
  hover-card input input-group input-otp item kbd label menubar
  native-select navigation-menu pagination popover progress radio-group
  resizable scroll-area select separator sheet sidebar skeleton slider
  sonner spinner switch table tabs textarea toggle toggle-group tooltip
)

for el in "${ELEMENTS[@]}"; do
  pnpm dlx shadcn@latest add "$el" --yes
done
```

### Diff & port from hochpos

For each generated file, compare against hochpos's tested version:

```bash
for el in "${ELEMENTS[@]}"; do
  diff "src/elements/${el}.tsx" \
       "../../../hochpos-ai/packages/ui/src/elements/${el}.tsx"
done
```

When they differ:

- Trivial diffs (whitespace, current shadcn registry refresh) → keep generated
- Behavior or import-path diffs → take hochpos's version, sed `@hochpos-ai/*` → `@__APP_NAME__/*`

### Manual ports (not in shadcn registry as Base UI)

- `direction.tsx` — port from hochpos
- `tanstack-form.tsx` — port from hochpos (TanStack Form integration)
- Any element shadcn CLI cannot fetch under `base-vega` style → port from hochpos and note in commit message

### Path alignment

The template already has `packages/ui/src/utils/cn.ts` (with `index.ts` re-exporting from it). Hochpos's `@__APP_NAME__/ui/utils/cn` import path resolves cleanly. No additional files needed.

### Verification

- `pnpm check-types && pnpm lint && pnpm test`
- Visual smoke test: `pnpm dev`, verify the existing app pages render without console errors. Open at least one dialog/popover/select to confirm Base UI animation behaves.

---

## P6 — `.aoe/` directory

### Files brought (verbatim copy from hochpos)

- `.aoe/config.toml`
- `.aoe/scripts/setup-worktree.sh` — `on_create` hook: port assignment + `.env` copy + `pnpm install`
- `.aoe/scripts/start-session.sh` — reliable AoE session startup
- `.aoe/scripts/send-message.sh` — message wrapper with Codex submit workaround
- `.aoe/scripts/add-worktree-session.sh` — create worktree from base branch + attach session
- `.aoe/scripts/cleanup-worktree.sh` — remove session + worktree
- `.aoe/scripts/create-dispatch.sh` — scaffold dispatch brief
- `.aoe/dispatch/task-template.md` — orchestrator brief template

### File rewritten for template

- **`.aoe/README.md`** — keep "Reliable AoE Session Startup", "Useful AoE Commands", scripts directory listing. Drop everything tunnel/webhook/develop-merge-related (cloudflare tunnel, hochpos.app domain, fast-forward-develop, root-dev-hooks, init-main, webhook-listener, GitHub event handling, develop branch model). Reference the orchestrator pattern generically without naming hochpos's specific session names.

### Files NOT brought

- `webhook-listener.mjs` — Cloudflare tunnel + hochpos.app + develop-branch automation
- `fast-forward-develop.sh` — develop-branch specific
- `init-main.sh` — creates `develop` branch on prepare
- `install-root-dev-hooks.sh` — hochpos-specific git hooks
- `trigger-root-dev-reconcile.sh` — develop-branch reconcile

### Root `package.json` updates

- Add scripts: `aoe:dispatch`, `aoe:send`, `aoe:cleanup` pointing at the corresponding `.aoe/scripts/*.sh` files.
- `prepare` stays as `husky` (no `init-main.sh` chain).

### Verification

`bash .aoe/scripts/start-session.sh --help` (or equivalent) runs without sourcing missing scripts. No `pnpm install` impact expected — these are shell scripts, not workspace packages.

---

## P7 — Docs split

### `AGENTS.md` (new — shared)

Universal-rules subset, structured as:

- Agent Roles
- Project Overview (TanStack Start + Cloudflare Workers monorepo description; mention `apps/web` and `packages/*`)
- Development Commands (root + filtered)
- Architecture Snapshot (template's actual packages only — no `db`/`domain`/`agent`/`meilisearch`/`api`)
- Core Repo Rules
  - Import Rules (absolute imports, `@__APP_NAME__/*`, import order)
  - Package Dependency Direction (template's actual layers)
  - Code Organization
  - Naming Conventions
- Testing Conventions (custom render mandatory, vitest, colocated tests, `@__APP_NAME__/test-utils`)
- Quality Bar (`pnpm lint && pnpm check-types && pnpm test`)
- Frontend rules pointer → `FRONTEND_RULES.md`

**Drops:** Proposal Engine rule, AI-Orchestrated System Design, OpenAPI/API Client Generation, Real-Infra QA, Multi-Agent Workflow, Data and Schema Conventions (db-specific), Search and Data Access (MeiliSearch).

### `CLAUDE.md` (rewritten — thin overlay)

```
# CLAUDE.md

Claude agents must read [`AGENTS.md`](./AGENTS.md) first.

This file contains only Claude-specific additions. Shared repo rules
live in `AGENTS.md`.

## Claude-Specific Additions

- Use the `superpowers:*` skills when available and relevant: ...
- AoE launch examples for Claude use `-c claude`.

## Legacy Note

This repo previously stored shared project rules in `CLAUDE.md`.
Those shared rules now live in `AGENTS.md`.
```

### `CODEX.md` (new — thin overlay)

```
# CODEX.md

Codex agents must read [`AGENTS.md`](./AGENTS.md) first.

This file contains only Codex-specific additions.

## Codex-Specific Additions

- If `superpowers:*` skills are available, use them; otherwise create
  the equivalent plan/TDD/debug/verify steps manually.
- Do not assume native MCP discovery from `.mcp.json`. Use shell
  tooling and Playwright as the default fallback path.
- AoE launch examples for Codex use `-c "codex --model gpt-5.3-codex"`.
```

### `FRONTEND_RULES.md` (new — curated subset)

Keep these hochpos rules (renumbered R1–RN for the template):

| Hochpos | Template | Topic                                      |
| ------- | -------- | ------------------------------------------ |
| R1–R7   | R1–R7    | Theme tokens (3-tier OKLCH)                |
| R12–R17 | R8–R13   | `data-testid` + Playwright MCP             |
| R18–R19 | R14–R15  | Color enforcement                          |
| R23–R25 | R16–R18  | Loading states                             |
| R26–R28 | R19–R21  | Animation conventions (Base UI overlays)   |
| R29     | R22      | Client state defaults (Zustand discipline) |
| R31–R32 | R23–R24  | Asset handling                             |
| R33–R35 | R25–R27  | Performance budget                         |
| R37–R39 | R28–R30  | Internationalization                       |
| R41     | R31      | Route composition                          |

Drop these:

- R8–R11 (widget architecture — hochpos-specific)
- R20–R22 (specific error boundary names tied to chat/timeline/dashboard)
- R30 (drawer state — hochpos-specific PlatformShell)
- R36 (Thai font loading — already handled by `@fontsource/ibm-plex-sans-thai` in P1)
- R40 (module split — hochpos modules don't exist in template)

References to hochpos modules/widgets/proposals get rewritten or removed. Examples use `@__APP_NAME__/*` paths.

### `README.md` (existing — light update)

- Add: "See [AGENTS.md](./AGENTS.md), [CLAUDE.md](./CLAUDE.md), and [CODEX.md](./CODEX.md) for AI agent guidance"
- Add: brief AoE setup pointer → `.aoe/README.md`

### Old `CLAUDE.md` content disposition

The current monolithic `CLAUDE.md` content gets distributed:

- Most rules → `AGENTS.md`
- Claude-specific bits (superpowers, MCP discovery notes) → `CLAUDE.md` overlay
- "Running Services" DevMux rule → updated to AoE in either AGENTS.md or `.aoe/README.md`
- App-name placeholder note (already removed in commit `0a1712a`) — stays removed

### Verification

- All three files render correctly on GitHub
- Cross-references resolve (relative links work)
- No mention of `@hochpos-ai`, `proposal`, `widget`, `module-accent` (other than the theme tokens), `develop` branch, NestJS, MeiliSearch

---

## Risks summary

| Risk                                                                 | Phase | Mitigation                                                                                  |
| -------------------------------------------------------------------- | ----- | ------------------------------------------------------------------------------------------- |
| Bulk dep bump introduces breaking change                             | P2    | Per-package revert with PINNED_PACKAGES.md entry; full verification gate before P3          |
| shadcn registry drift between hochpos snapshot and current           | P5    | Diff-and-port pattern; prefer hochpos when generated regression is real                     |
| Transitive Radix from cmdk/vaul/embla still in lockfile              | P5    | Expected; we drop direct `radix-ui` import only                                             |
| Lingui SWC plugin minor bump (5.9.3 → 5.11.0) silent behaviour shift | P2    | `pnpm test` + `lingui:extract` re-run                                                       |
| Template UI lacks real consumers to exercise new Base UI primitives  | P5    | Visual smoke test in `apps/web` dev server; accept that bugs surface in downstream projects |
| Breaking shadcn output uses `@/components/ui/*` not template alias   | P5    | sed pass during diff/port                                                                   |
| AoE README rewrite strips useful operational content                 | P6    | Keep core sections; drop only tunnel/webhook/develop-specific                               |

## Open questions resolved during brainstorming

- **Theme:** literal 100% copy of hochpos's `shared-styles.css`
- **Frontend rules:** curated subset (theme tokens, test-ids, color enforcement, loading, animation, client state, assets, perf, i18n, route composition)
- **Agent docs:** universal-rules-only AGENTS.md + thin CLAUDE.md/CODEX.md overlays
- **AoE scope:** 6 generic scripts + config.toml + dispatch template + rewritten README; no webhook/develop automation
- **test-utils:** extract as workspace package; required for the typescript dedupe pin to apply
- **ESLint:** all four template-worthy enhancements (banned packages, testing-library ban, `../*` ban, className composition ban)
- **vitest-run.mjs:** yes; husky AoE init: no
- **Babel/SWC:** already on SWC; no migration needed (only minor `@lingui/swc-plugin` version bump 5.9.3 → 5.11.0)

## Acceptance criteria

The migration is complete when:

1. All seven phases land in order with green verification at each gate
2. `pnpm install && pnpm check-types && pnpm lint && pnpm test` succeeds from a clean clone
3. `apps/web` dev server starts and renders the existing landing page using Base UI primitives + new theme
4. No imports from `@hochpos-ai/*` remain in any source file
5. No references to `apps/api`, `proposal`, `MeiliSearch`, `develop` branch, hochpos webhook in committed files (other than commit history)
6. `__APP_NAME__` placeholder remains intact wherever it was before
7. `PINNED_PACKAGES.md` reflects the post-migration state with the typescript pin documented
8. AGENTS.md, CLAUDE.md, CODEX.md exist; `FRONTEND_RULES.md` exists with renumbered template-relevant rules; README.md points at all three agent files
