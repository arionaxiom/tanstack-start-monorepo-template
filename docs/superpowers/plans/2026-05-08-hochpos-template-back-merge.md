# Hochpos → Template Back-Merge Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate proven, generic improvements from `../hochpos-ai` back into this template — Base UI primitives, theme system, AoE multi-agent tooling, doc split, ESLint enforcement, test-utils extraction, full dep bumps.

**Architecture:** Seven phases land in dependency order, each gated on green `pnpm install && pnpm check-types && pnpm lint && pnpm test`. Bulk dep bump runs immediately after foundation, so subsequent phases work on fresh package versions. UI elements rebuild via `shadcn add` against the `base-vega` registry, then diff/port from hochpos where the registry has drifted. AoE replaces DevMux. Documentation splits into `AGENTS.md` (shared) + thin `CLAUDE.md`/`CODEX.md` overlays + curated `FRONTEND_RULES.md`.

**Tech Stack:** pnpm 10 monorepo, Turborepo, TanStack Start (React 19, Vite 7, SWC), Tailwind CSS v4, Lingui, Vitest 4, Base UI, shadcn (`base-vega` style).

**Reference spec:** `docs/superpowers/specs/2026-05-08-hochpos-template-back-merge-design.md`

**Source repo:** `../hochpos-ai` (sibling checkout at `/Users/arionai/repo/hochpos-ai`)

---

## Setup — Branch & Baseline

### Task 0: Create feature branch and verify baseline

**Files:** none (git operations only)

- [ ] **Step 0.1: Verify clean working tree**

```bash
git status
```

Expected: `nothing to commit, working tree clean` (the spec commit `9a76702` is already on `main`).

- [ ] **Step 0.2: Create feature branch**

```bash
git checkout -b feat/hochpos-back-merge
```

Expected: `Switched to a new branch 'feat/hochpos-back-merge'`

- [ ] **Step 0.3: Verify baseline tests pass**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four commands exit 0. If anything fails on `main`, stop and surface the failure — the migration assumes a green starting point.

- [ ] **Step 0.4: Verify hochpos sibling is reachable**

```bash
test -d ../hochpos-ai/packages/ui/src/elements && echo "hochpos sibling OK"
```

Expected output: `hochpos sibling OK`

---

## P1 — Theme + Tooling Foundation

### Task 1.1: Copy `shared-styles.css` from hochpos

**Files:**

- Modify: `packages/tailwind-config/shared-styles.css` (full overwrite)

- [ ] **Step 1.1.1: Replace shared-styles.css with hochpos's version**

```bash
cp ../hochpos-ai/packages/tailwind-config/shared-styles.css packages/tailwind-config/shared-styles.css
```

- [ ] **Step 1.1.2: Verify line count matches expected (438 lines)**

```bash
wc -l packages/tailwind-config/shared-styles.css
```

Expected: `438 packages/tailwind-config/shared-styles.css`

- [ ] **Step 1.1.3: Commit**

```bash
git add packages/tailwind-config/shared-styles.css
git commit -m "feat(theme): adopt hochpos OKLCH 3-tier token system

Literal copy of shared-styles.css from hochpos-ai. Brings the proven
ink scale, brand teal (#006152), spotlight orange (#ff4400), state
scale, module accents, typography scale, motion tokens, and dark
mode wiring. Future projects re-skin by editing tokens."
```

### Task 1.2: Add fontsource deps to tailwind-config

**Files:**

- Modify: `packages/tailwind-config/package.json`

- [ ] **Step 1.2.1: Read current tailwind-config package.json**

```bash
cat packages/tailwind-config/package.json
```

- [ ] **Step 1.2.2: Add three fontsource deps**

Replace the `package.json` with:

```json
{
  "name": "@__APP_NAME__/tailwind-config",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "exports": {
    "./shared-styles.css": "./shared-styles.css",
    "./postcss": "./postcss.config.js"
  },
  "devDependencies": {
    "eslint": "^10.1.0",
    "postcss": "^8.5.8",
    "tailwindcss": "^4.2.2",
    "tw-animate-css": "^1.4.0"
  },
  "dependencies": {
    "@fontsource-variable/inter": "^5.2.8",
    "@fontsource-variable/jetbrains-mono": "^5.2.8",
    "@fontsource/ibm-plex-sans-thai": "^5.2.8"
  }
}
```

- [ ] **Step 1.2.3: Commit**

```bash
git add packages/tailwind-config/package.json
git commit -m "feat(theme): add fontsource font packages

shared-styles.css imports Inter Variable, JetBrains Mono Variable,
and IBM Plex Sans Thai (400/500/700). These must be declared as
deps so pnpm resolves them under tailwind-config's node_modules."
```

### Task 1.3: Update root `package.json` overrides

**Files:**

- Modify: `package.json` (root)

- [ ] **Step 1.3.1: Read current root package.json**

```bash
cat package.json
```

- [ ] **Step 1.3.2: Update `pnpm.overrides` block**

Edit `package.json` so the `pnpm` block reads:

```json
"pnpm": {
  "overrides": {
    "react": "19.2.0",
    "react-dom": "19.2.0",
    "@types/react": "~19.2.14",
    "@types/react-dom": "~19.2.3",
    "@lingui/core": "^5.9.4",
    "vitest": "4.0.18",
    "@vitest/coverage-v8": "4.0.18",
    "@vitest/runner": "4.0.18",
    "@vitest/spy": "4.0.18",
    "typescript": "~5.9.2"
  },
  "onlyBuiltDependencies": [
    "@swc/core",
    "esbuild",
    "sharp",
    "unrs-resolver",
    "workerd"
  ]
}
```

Changes vs. current: bump `@types/react` `~19.2.2` → `~19.2.14`; bump `@types/react-dom` `~19.2.2` → `~19.2.3`; bump `@lingui/core` `^5.9.3` → `^5.9.4`; add `@vitest/spy: 4.0.18`; add `typescript: ~5.9.2`.

- [ ] **Step 1.3.3: Commit**

```bash
git add package.json
git commit -m "feat(deps): expand pnpm overrides for hochpos parity

Adds @vitest/spy and typescript to overrides so the dedupe matches
hochpos's setup. Bumps @types/react/@types/react-dom and @lingui/core
to track hochpos's working pair. The typescript ~5.9.2 pin is
required for the upcoming test-utils extraction (P3) — see
PINNED_PACKAGES.md update in next task."
```

### Task 1.4: Update `PINNED_PACKAGES.md`

**Files:**

- Modify: `PINNED_PACKAGES.md`

- [ ] **Step 1.4.1: Replace `PINNED_PACKAGES.md` content with hochpos's table + rationale**

Write the file as:

```markdown
# Pinned Packages

Packages intentionally held at a specific version due to known issues with newer releases. **Check this file before upgrading any package listed here.**

| Package             | Pinned | Latest | Reason                                                                         | Enforcement    |
| ------------------- | ------ | ------ | ------------------------------------------------------------------------------ | -------------- |
| vitest              | 4.0.18 | 4.1.0  | 4.1.0 changes import.meta.glob behavior, breaks convex-test                    | pnpm.overrides |
| @vitest/coverage-v8 | 4.0.18 | 4.1.0  | Must match vitest                                                              | pnpm.overrides |
| @vitest/runner      | 4.0.18 | 4.1.0  | Must match vitest                                                              | pnpm.overrides |
| @vitest/spy         | 4.0.18 | 4.1.0  | Must match vitest                                                              | pnpm.overrides |
| react               | 19.2.0 | 19.2.4 | Pinned for future Expo / React Native compatibility                            | pnpm.overrides |
| react-dom           | 19.2.0 | 19.2.4 | Must match react                                                               | pnpm.overrides |
| typescript          | ~5.9.2 | 5.9.3  | Dedupe @lingui/react — split resolution created dual React context (see below) | pnpm.overrides |

### typescript — dedupe rationale

`packages/test-utils` peer-depends on `typescript: "^5"` while
the rest of the workspace declares `typescript: "~5.9.2"`. Without
the override, pnpm resolves two distinct versions (5.9.2 and 5.9.3),
which splits the `@lingui/react` instantiation: the shared
`TestProviders` wrapper imports the 5.9.3 `I18nProvider` while a
test's `i18n.loadAndActivate` hits the 5.9.2 `I18nProvider`. React
renders `<I18nProvider>` but the children never mount as the same
component identity, so `customRenderHook`'s `result.current` stays
`null` and every react-hooks test silently bypasses the shared
wrapper. Pinning `typescript: "~5.9.2"` in `pnpm.overrides` forces
a single resolution across the whole workspace (including transitive
peer-dep chains), which dedupes `@lingui/react` and fixes the wrapper.

## Resolved pins

| Package              | Was pinned | Resolution                                                                 |
| -------------------- | ---------- | -------------------------------------------------------------------------- |
| vite                 | 6.x        | Migrated to @vitejs/plugin-react-swc + @lingui/swc-plugin                  |
| @vitejs/plugin-react | 4.x        | Replaced with @vitejs/plugin-react-swc                                     |
| recharts             | ^2.15.3    | Upgraded to ^3.8.1 — shadcn chart component now supports Recharts v3 props |

---

**Last reviewed**: 2026-05-08 (added typescript `~5.9.2`, removed recharts pin)
```

- [ ] **Step 1.4.2: Commit**

```bash
git add PINNED_PACKAGES.md
git commit -m "docs: pin typescript ~5.9.2, remove recharts pin

Adds the typescript dedupe rationale brought from hochpos. The
recharts ^2.x pin is resolved (we already have lucide-react v1
and the @vitejs/plugin-react-swc migration; the recharts row was
the last remaining v2 pin and its rationale no longer applies)."
```

### Task 1.5: Add `@base-ui/react` dep to ui package

**Files:**

- Modify: `packages/ui/package.json`

- [ ] **Step 1.5.1: Read current ui package.json**

```bash
cat packages/ui/package.json
```

- [ ] **Step 1.5.2: Add `@base-ui/react` to `dependencies`**

In `packages/ui/package.json`, add this entry to the `dependencies` block (alphabetically just after `"@__APP_NAME__/utils"`):

```json
"@base-ui/react": "^1.3.0",
```

Do NOT remove `radix-ui` yet — that happens in P5.

- [ ] **Step 1.5.3: Commit**

```bash
git add packages/ui/package.json
git commit -m "feat(ui): add @base-ui/react dep

Required by the Base UI element rewrites in P5. Radix UI umbrella
import stays for now; removed when elements are rebuilt."
```

### Task 1.6: P1 verification gate

- [ ] **Step 1.6.1: Install + verify**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four exit 0. The fontsource imports in `shared-styles.css` should now resolve. If `pnpm install` warns about peer-dep mismatches related to `@types/react`, that's expected — the override forces resolution.

- [ ] **Step 1.6.2: Quick visual smoke test**

```bash
pnpm --filter=web dev
```

Open the running URL in a browser. Page should render. Inter font should load (Network tab shows `inter-*.woff2` from the fontsource path). Stop the dev server with Ctrl+C.

- [ ] **Step 1.6.3: Commit lockfile if changed**

```bash
git status pnpm-lock.yaml
git add pnpm-lock.yaml
git commit -m "chore: update lockfile after P1 foundation"
```

(Skip this commit if `git status` shows the lockfile already clean.)

---

## P2 — Dependency Bumps

### Task 2.1: Bulk dep bump

**Files:** all `package.json` files (modified by `pnpm update`), `pnpm-lock.yaml`

- [ ] **Step 2.1.1: List currently-outdated packages (informational)**

```bash
pnpm outdated --recursive
```

Read the output. Note any packages with major-version jumps (especially `@tanstack/*`, `vite`, `tailwindcss`, `recharts`, `lingui`) — these are highest-risk.

- [ ] **Step 2.1.2: Run bulk update**

```bash
pnpm update --latest --recursive
```

Expected: pnpm rewrites semvers in all `package.json` files; `pnpm.overrides` keeps the pinned set locked at exact versions in the lockfile regardless.

- [ ] **Step 2.1.3: Re-tighten pinned semvers in package.json files**

`pnpm update --latest` may rewrite `react: "19.2.0"` to `react: "^19.x.x"`. Loop through each package.json that declares the pinned packages and restore the exact pinned values. Affected packages typically include `apps/web/package.json`, `packages/ui/package.json`, `packages/react-hooks/package.json`, `packages/types/package.json`, root `package.json` devDependencies.

For each pinned dep, the value in `package.json` should be:

```
react           → "19.2.0"
react-dom       → "19.2.0"
@types/react    → "~19.2.14"
@types/react-dom→ "~19.2.3"
typescript      → "~5.9.2"
vitest          → "4.0.18"
@vitest/coverage-v8 → "4.0.18"
@vitest/runner  → "4.0.18"
@vitest/spy     → "4.0.18"
```

Find them with:

```bash
git diff --name-only -- '**/package.json' | xargs grep -l -E '"(react|react-dom|@types/react|@types/react-dom|typescript|vitest|@vitest/(coverage-v8|runner|spy))":'
```

Edit each manually so the pinned values match the table above.

- [ ] **Step 2.1.4: Run install and verify**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four exit 0. If something breaks:

- **`check-types` fails:** likely a TanStack Router/Query/Form major bump. Read the failing imports, update call sites, or revert the bump for that one package via package.json edit + `pnpm install`.
- **`lint` fails:** likely an `eslint-plugin-*` bump changed rule defaults. Adjust eslint config or pin the plugin.
- **`test` fails:** likely a Lingui or Vitest plugin behavior shift. Check for `lingui:extract` differences; re-run `pnpm --filter=@__APP_NAME__/locale lingui:extract` if message catalogs changed.

If a bump is too disruptive, revert that specific package's bump and add it to `PINNED_PACKAGES.md`.

- [ ] **Step 2.1.5: Re-run lingui extract (defensive)**

```bash
pnpm --filter=@__APP_NAME__/locale lingui:extract
pnpm --filter=@__APP_NAME__/locale compile
```

Commit any catalog updates separately.

- [ ] **Step 2.1.6: Commit**

```bash
git add -A
git commit -m "chore(deps): bulk bump all non-pinned dependencies to latest

pnpm.overrides protects react/react-dom/@types pair, vitest family,
typescript, and @lingui/core. All other deps move to current latest.
Lockfile updated."
```

---

## P3 — `packages/test-utils` Package Extraction

### Task 3.1: Scaffold test-utils package directory

**Files:**

- Create: `packages/test-utils/package.json`
- Create: `packages/test-utils/tsconfig.json`
- Create: `packages/test-utils/eslint.config.mjs`
- Create: `packages/test-utils/src/index.ts`
- Create: `packages/test-utils/src/react.tsx`

- [ ] **Step 3.1.1: Create `packages/test-utils/package.json`**

```json
{
  "name": "@__APP_NAME__/test-utils",
  "version": "0.0.0",
  "private": true,
  "type": "module",
  "exports": {
    ".": "./src/index.ts",
    "./*": "./src/*.tsx"
  },
  "scripts": {
    "check-types": "tsc --noEmit true",
    "lint": "eslint . --max-warnings 0 --cache --cache-location .eslintcache"
  },
  "dependencies": {
    "@lingui/core": "^5.9.4",
    "@lingui/react": "^5.9.4",
    "@testing-library/react": "^16.3.2",
    "@testing-library/user-event": "^14.6.1"
  },
  "peerDependencies": {
    "react": "^19",
    "typescript": "^5"
  },
  "devDependencies": {
    "@__APP_NAME__/eslint-config": "workspace:*",
    "@__APP_NAME__/typescript-config": "workspace:*",
    "@types/react": "~19.2.14",
    "eslint": "^10.1.0"
  }
}
```

- [ ] **Step 3.1.2: Create `packages/test-utils/tsconfig.json`**

```json
{
  "extends": "@__APP_NAME__/typescript-config/react-library.json",
  "compilerOptions": {
    "outDir": "dist",
    "tsBuildInfoFile": "tsconfig.tsbuildinfo",
    "noEmit": true,
    "incremental": true,
    "paths": {
      "@__APP_NAME__/test-utils/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3.1.3: Create `packages/test-utils/eslint.config.mjs`**

```js
import { config } from "@__APP_NAME__/eslint-config/base";

/** @type {import("eslint").Linter.Config} */
export default config;
```

- [ ] **Step 3.1.4: Create `packages/test-utils/src/index.ts`**

```ts
export { fireEvent, render, renderHook, screen, act, userEvent } from "./react";
```

- [ ] **Step 3.1.5: Create `packages/test-utils/src/react.tsx`**

```tsx
import { i18n } from "@lingui/core";
import { I18nProvider } from "@lingui/react";
import {
  type RenderHookResult,
  type RenderOptions,
  type RenderResult,
  render,
  renderHook,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

function TestProviders({ children }: { children: ReactNode }) {
  return <I18nProvider i18n={i18n}>{children}</I18nProvider>;
}

function customRender(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">
): RenderResult {
  return render(ui, { wrapper: TestProviders, ...options });
}

function customRenderHook<TProps, TResult>(
  hook: (props: TProps) => TResult,
  options?: Omit<Parameters<typeof renderHook>[1], "wrapper"> & {
    initialProps?: TProps;
  }
): RenderHookResult<TResult, TProps> {
  return renderHook(hook, { wrapper: TestProviders, ...options });
}

export { customRender as render, customRenderHook as renderHook };
export { fireEvent, screen, act } from "@testing-library/react";
export { default as userEvent } from "@testing-library/user-event";
```

- [ ] **Step 3.1.6: Commit**

```bash
git add packages/test-utils
git commit -m "feat(test-utils): extract shared TestProviders wrapper

New workspace package centralizes the Lingui I18nProvider wrapper
and customRender / customRenderHook helpers. Replaces the duplicated
test-utils.tsx files in packages/ui and packages/react-hooks. Exports
fireEvent, render, renderHook, screen, act, userEvent so consumers
have a single import for everything they need."
```

### Task 3.2: Convert ui test-utils to re-export shim

**Files:**

- Modify: `packages/ui/package.json`
- Modify: `packages/ui/src/test-utils.tsx`

- [ ] **Step 3.2.1: Add test-utils workspace dep to ui package**

In `packages/ui/package.json`, add this entry to `devDependencies`:

```json
"@__APP_NAME__/test-utils": "workspace:*",
```

- [ ] **Step 3.2.2: Replace `packages/ui/src/test-utils.tsx` with shim**

```tsx
export {
  fireEvent,
  render,
  renderHook,
  screen,
  act,
  userEvent,
} from "@__APP_NAME__/test-utils";
```

- [ ] **Step 3.2.3: Install + run ui tests**

```bash
pnpm install
pnpm --filter=@__APP_NAME__/ui test
```

Expected: all ui tests pass. The shim re-exports from the new package; consumers continue importing from `@__APP_NAME__/ui/test-utils` per AGENTS.md convention.

- [ ] **Step 3.2.4: Commit**

```bash
git add packages/ui/package.json packages/ui/src/test-utils.tsx
git commit -m "refactor(ui): convert test-utils.tsx to re-export shim

Existing imports of @__APP_NAME__/ui/test-utils continue working.
The shared TestProviders wrapper now lives in @__APP_NAME__/test-utils
and is referenced once instead of duplicated."
```

### Task 3.3: Convert react-hooks test-utils to re-export shim

**Files:**

- Modify: `packages/react-hooks/package.json`
- Modify: `packages/react-hooks/src/test-utils.tsx`

- [ ] **Step 3.3.1: Add test-utils workspace dep to react-hooks package**

In `packages/react-hooks/package.json`, add this entry to `devDependencies`:

```json
"@__APP_NAME__/test-utils": "workspace:*",
```

- [ ] **Step 3.3.2: Replace `packages/react-hooks/src/test-utils.tsx` with shim**

```tsx
export {
  fireEvent,
  render,
  renderHook,
  screen,
  act,
} from "@__APP_NAME__/test-utils";
```

(No `userEvent` — react-hooks tests don't use it.)

- [ ] **Step 3.3.3: Install + run react-hooks tests**

```bash
pnpm install
pnpm --filter=@__APP_NAME__/react-hooks test
```

Expected: all react-hooks tests pass. Critically: this is the gate that proves the typescript-pin / dedupe is working — if `result.current` returns `null` instead of the hook's value, the dedupe broke.

- [ ] **Step 3.3.4: Commit**

```bash
git add packages/react-hooks/package.json packages/react-hooks/src/test-utils.tsx
git commit -m "refactor(react-hooks): convert test-utils.tsx to re-export shim

Existing imports continue working. Same pattern as packages/ui."
```

### Task 3.4: Add shared `vitest-run.mjs` runner

**Files:**

- Create: `scripts/vitest-run.mjs`

- [ ] **Step 3.4.1: Create scripts directory and file**

```bash
mkdir -p scripts
```

- [ ] **Step 3.4.2: Write `scripts/vitest-run.mjs`**

```js
#!/usr/bin/env node
import { spawn } from "node:child_process";
import { pathToFileURL } from "node:url";

export function normalizeVitestArgs(args) {
  const separatorIndex = args.indexOf("--");
  if (separatorIndex === -1) return args;
  return [...args.slice(0, separatorIndex), ...args.slice(separatorIndex + 1)];
}

function isMain() {
  return import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isMain()) {
  const command = process.platform === "win32" ? "vitest.cmd" : "vitest";
  const child = spawn(
    command,
    ["run", ...normalizeVitestArgs(process.argv.slice(2))],
    {
      stdio: "inherit",
    }
  );

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }
    process.exit(code ?? 1);
  });

  child.on("error", (error) => {
    console.error(error);
    process.exit(1);
  });
}
```

- [ ] **Step 3.4.3: Commit**

```bash
git add scripts/vitest-run.mjs
git commit -m "chore(test): add shared vitest-run.mjs wrapper

Normalizes vitest CLI args and spawns vitest run. Used by every
package's test script so we can pass --silent, --coverage, etc.
through pnpm filter without arg-parsing weirdness."
```

### Task 3.5: Update package `test` scripts to use shared runner

**Files:**

- Modify: each package.json with a `test` script

- [ ] **Step 3.5.1: Find packages with test scripts**

```bash
grep -l '"test":' packages/*/package.json apps/*/package.json
```

- [ ] **Step 3.5.2: For each found file, update the `test` script**

Replace any line matching:

```json
"test": "vitest run --silent=true"
```

or similar (e.g., `"test": "vitest run"`) with:

```json
"test": "node ../../scripts/vitest-run.mjs --silent=true"
```

For `apps/web/package.json`, the relative path is also `../../scripts/vitest-run.mjs`.

- [ ] **Step 3.5.3: Verify**

```bash
pnpm test
```

Expected: every package that previously had a test script still runs its tests; output matches prior (silent mode).

- [ ] **Step 3.5.4: Commit**

```bash
git add packages/*/package.json apps/*/package.json
git commit -m "chore(test): route all package test scripts through vitest-run.mjs

Centralized arg normalization. No behavior change."
```

### Task 3.6: P3 verification gate

- [ ] **Step 3.6.1: Run full check**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four exit 0.

---

## P4 — ESLint Config Enhancements

### Task 4.1: Port custom ESLint rule

**Files:**

- Create: `packages/eslint-config/rules/require-testid-on-action-elements.cjs`
- Create: `packages/eslint-config/rules/require-testid-on-action-elements.test.cjs`

- [ ] **Step 4.1.1: Copy custom rule from hochpos**

```bash
mkdir -p packages/eslint-config/rules
cp ../hochpos-ai/packages/eslint-config/rules/require-testid-on-action-elements.cjs \
   packages/eslint-config/rules/require-testid-on-action-elements.cjs
cp ../hochpos-ai/packages/eslint-config/rules/require-testid-on-action-elements.test.cjs \
   packages/eslint-config/rules/require-testid-on-action-elements.test.cjs
```

- [ ] **Step 4.1.2: Verify rule file content**

```bash
head -20 packages/eslint-config/rules/require-testid-on-action-elements.cjs
```

Expected: starts with `"use strict"; const TARGET_PATH_FRAGMENT = "/packages/ui/src/components/";`. The path fragment is already template-relevant (template has `packages/ui/src/components/`).

- [ ] **Step 4.1.3: Commit**

```bash
git add packages/eslint-config/rules
git commit -m "feat(eslint): port require-testid-on-action-elements rule

Custom ESLint rule that flags <button>, <a>, and role=button JSX
elements inside packages/ui/src/components/** that lack a
data-testid (or a testid'd descendant). Enforces R8 in the
upcoming FRONTEND_RULES.md."
```

### Task 4.2: Rewrite `packages/eslint-config/base.js`

**Files:**

- Modify: `packages/eslint-config/base.js`

- [ ] **Step 4.2.1: Rewrite `base.js` with all four enforcement layers**

Replace the file contents with:

```js
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

// ── Banned imports ──────────────────────────────────────────────────────────

const bannedPackages = [
  {
    name: "redux",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "@reduxjs/toolkit",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "mobx",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "mobx-react",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "mobx-react-lite",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "framer-motion",
    message:
      "Use Tailwind transitions + tw-animate-css (FRONTEND_RULES.md animation)",
  },
  {
    name: "motion",
    message:
      "Use Tailwind transitions + tw-animate-css (FRONTEND_RULES.md animation)",
  },
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

// ── Cross-layer import restrictions ─────────────────────────────────────────
// Each package's eslint.config.mjs uses these to ban imports from higher layers.
// See AGENTS.md "Package Dependency Direction" for the full layer diagram.

const pkg = (name) => ({
  name: `@__APP_NAME__/${name}`,
  message: `Cross-layer import: @__APP_NAME__/${name} is above this package's layer (see AGENTS.md "Package Dependency Direction").`,
});

/** All @__APP_NAME__/* packages — used by L0 packages that can't import anything. */
const allPackages = [
  "types",
  "locale",
  "assets",
  "test-utils",
  "tailwind-config",
  "eslint-config",
  "typescript-config",
  "constants",
  "utils",
  "form-options",
  "react-hooks",
  "node-fn",
  "ui",
].map(pkg);

/** Packages above L1 */
const aboveL1 = ["form-options", "react-hooks", "node-fn", "ui"].map(pkg);

/** Packages above L2 */
const aboveL2 = ["react-hooks", "node-fn", "ui"].map(pkg);

/** Packages above L3 */
const aboveL3 = ["ui"].map(pkg);

export { allPackages, aboveL1, aboveL2, aboveL3, bannedRelativeParent };

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [...bannedPackages, bannedTestingLibrary],
          patterns: [bannedRelativeParent],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'][value.expression.type='TemplateLiteral']",
          message:
            "Use cn() from @__APP_NAME__/ui/utils to compose className — not template literals (FRONTEND_RULES.md theme tokens).",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.expression.type='BinaryExpression']",
          message:
            "Use cn() from @__APP_NAME__/ui/utils to compose className — not string concatenation (FRONTEND_RULES.md theme tokens).",
        },
      ],
    },
  },
  {
    // Test-utils wrapper files and vitest setup files are the ONLY places
    // allowed to import from @testing-library/react directly.
    files: [
      "src/test-utils.tsx",
      "src/test-utils.ts",
      "src/react.tsx", // packages/test-utils/src/react.tsx
      "src/index.ts", // packages/test-utils/src/index.ts
      "test-setup.ts", // vitest setup files
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [...bannedPackages],
          // @testing-library/react intentionally NOT banned here.
          patterns: [bannedRelativeParent],
        },
      ],
    },
  },
  {
    // lingui.config.ts files import the root monorepo lingui.config via
    // a relative parent path. The root config is not a package, so there
    // is no absolute import for it.
    files: ["lingui.config.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [...bannedPackages, bannedTestingLibrary],
          // ../* pattern intentionally NOT included here.
        },
      ],
    },
  },
  {
    ignores: [
      "dist/**",
      "**/_*/",
      "_*/",
      "**/.*/",
      ".*/",
      "jest.config.js",
      "coverage/",
      "**/coverage/",
      "babel.config.js",
      "worker-configuration.d.ts",
    ],
  },
];
```

- [ ] **Step 4.2.2: Verify lint still runs (it may flag new violations)**

```bash
pnpm lint
```

Expected: lint may now flag `../*` imports, className template literals, or `@testing-library/react` direct imports in non-test-utils files. Address each violation by:

- Rewriting `../*` paths to absolute `@__APP_NAME__/*` paths
- Replacing className template literals with `cn()` calls
- Replacing direct `@testing-library/react` imports with imports from the package's own `test-utils`

If the codebase is already clean (likely — it's a small template), this exits 0.

- [ ] **Step 4.2.3: Commit**

```bash
git add packages/eslint-config/base.js
git commit -m "feat(eslint): add four enforcement layers to base config

- bannedPackages: redux, mobx, framer-motion, motion families
- bannedTestingLibrary: @testing-library/react direct imports
  (allowed only in test-utils wrappers and test-setup files)
- bannedRelativeParent: ../* patterns (forces absolute imports)
- className composition: ban template literals + binary
  concatenation (forces cn())

Plus exports for cross-layer helpers (pkg, allPackages, aboveL1,
aboveL2, aboveL3) so per-package eslint.config.mjs files can opt
into layer enforcement."
```

### Task 4.3: Wire custom rule in `react-internal.js`

**Files:**

- Modify: `packages/eslint-config/react-internal.js`

- [ ] **Step 4.3.1: Update `react-internal.js` to register the custom rule**

Replace the file with:

```js
import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import { createRequire } from "node:module";
import tseslint from "typescript-eslint";

import { config as baseConfig } from "./base.js";

const require = createRequire(import.meta.url);
const requireTestidOnActionElements = require("./rules/require-testid-on-action-elements.cjs");

const templatePlugin = {
  rules: {
    "require-testid-on-action-elements": requireTestidOnActionElements,
  },
};

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "19.2.4",
      },
    },
  },
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-console": "error",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    plugins: {
      template: templatePlugin,
    },
    rules: {
      "template/require-testid-on-action-elements": "error",
    },
  },
];
```

(Note: the plugin namespace is `template` — we drop the hochpos-specific `hochpos` namespace.)

- [ ] **Step 4.3.2: Verify lint runs in ui package**

```bash
pnpm --filter=@__APP_NAME__/ui lint
```

Expected: passes. If it now flags missing `data-testid` on action elements in `packages/ui/src/components/**`, address each by adding `data-testid` (or by ensuring a descendant has one).

- [ ] **Step 4.3.3: Commit**

```bash
git add packages/eslint-config/react-internal.js
git commit -m "feat(eslint): register require-testid-on-action-elements rule

Available as 'template/require-testid-on-action-elements' in any
package extending react-internal config. Set to 'error' so action
elements in packages/ui/src/components/** must declare data-testid."
```

### Task 4.4: P4 verification gate

- [ ] **Step 4.4.1: Full verification**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four exit 0.

---

## P5 — UI Elements Rebuild (Base UI)

### Task 5.1: Add `components.json` files

**Files:**

- Create: `packages/ui/components.json`
- Create: `apps/web/components.json`

- [ ] **Step 5.1.1: Create `packages/ui/components.json`**

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

- [ ] **Step 5.1.2: Create `apps/web/components.json`**

```json
{
  "$schema": "https://ui.shadcn.com/schema.json",
  "style": "base-vega",
  "rsc": false,
  "tsx": true,
  "tailwind": {
    "config": "",
    "css": "../../packages/tailwind-config/shared-styles.css",
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

- [ ] **Step 5.1.3: Commit**

```bash
git add packages/ui/components.json apps/web/components.json
git commit -m "feat(ui): add shadcn components.json (base-vega style)

Routes shadcn add to the official Base UI registry. Aliases point
at the existing @__APP_NAME__/ui/* package paths so generated files
are placed correctly."
```

### Task 5.2: Remove existing Radix-based elements

**Files:**

- Delete: `packages/ui/src/elements/*.tsx`

- [ ] **Step 5.2.1: List elements to be removed**

```bash
ls packages/ui/src/elements/
```

Expected: 56 `.tsx` files (the current Radix-based versions). Note any test files (`*.test.tsx`) — those should NOT be deleted; preserve them.

- [ ] **Step 5.2.2: Check for element test files (preserve them)**

```bash
ls packages/ui/src/elements/*.test.tsx 2>/dev/null
```

If any test files exist, move them aside before the bulk delete:

```bash
mkdir -p /tmp/preserved-element-tests
mv packages/ui/src/elements/*.test.tsx /tmp/preserved-element-tests/ 2>/dev/null || true
```

- [ ] **Step 5.2.3: Delete element source files**

```bash
rm packages/ui/src/elements/*.tsx
```

Expected: no error. (If tests were preserved in step 5.2.2, restore them after the rebuild in Task 5.4.)

- [ ] **Step 5.2.4: Verify the elements directory is empty (apart from any subdirectories)**

```bash
ls packages/ui/src/elements/
```

Expected: empty (or only directories if any exist).

(Do NOT commit yet — the rebuild lands as a single commit at the end of P5.)

### Task 5.3: Rebuild elements via shadcn CLI

**Files:**

- Create: 50+ files in `packages/ui/src/elements/*.tsx`

- [ ] **Step 5.3.1: Run shadcn add for each element**

From the repo root, execute:

```bash
cd packages/ui

ELEMENTS=(
  accordion alert alert-dialog aspect-ratio avatar badge breadcrumb
  button button-group calendar card carousel chart checkbox collapsible
  combobox command context-menu dialog drawer dropdown-menu empty field
  hover-card input input-group input-otp item kbd label menubar
  navigation-menu pagination popover progress radio-group
  resizable scroll-area select separator sheet sidebar skeleton slider
  sonner spinner switch table tabs textarea toggle toggle-group tooltip
)

for el in "${ELEMENTS[@]}"; do
  echo "===== Adding: $el ====="
  pnpm dlx shadcn@latest add "$el" --yes || echo "FAILED: $el"
done

cd -
```

Expected: most elements add successfully. Some may fail if the `base-vega` registry doesn't have a Base UI version — those are flagged "FAILED" and handled in Task 5.5.

- [ ] **Step 5.3.2: List what was actually generated**

```bash
ls packages/ui/src/elements/
```

Note any elements from the original 56 list that are missing — those will need manual ports.

### Task 5.4: Diff & port from hochpos

**Files:**

- Modify: `packages/ui/src/elements/*.tsx` (selectively, where shadcn output diverges from hochpos)

- [ ] **Step 5.4.1: Generate diff report**

```bash
mkdir -p /tmp/element-diffs
for f in packages/ui/src/elements/*.tsx; do
  name=$(basename "$f")
  hochpos_file="../hochpos-ai/packages/ui/src/elements/$name"
  if [ -f "$hochpos_file" ]; then
    diff -u "$hochpos_file" "$f" > "/tmp/element-diffs/$name.diff" 2>&1 || true
  fi
done
ls -la /tmp/element-diffs/
```

- [ ] **Step 5.4.2: For each non-trivial diff, port hochpos's version**

For each diff file in `/tmp/element-diffs/` that shows non-trivial changes (different imports, different prop signatures, different component structure — not just whitespace), copy hochpos's version and rewrite the import scope:

```bash
# Example for one element:
cp ../hochpos-ai/packages/ui/src/elements/dialog.tsx packages/ui/src/elements/dialog.tsx
sed -i.bak 's|@hochpos-ai/|@__APP_NAME__/|g' packages/ui/src/elements/dialog.tsx
rm packages/ui/src/elements/dialog.tsx.bak
```

Repeat for each element where hochpos's version diverges materially.

**Decision rule:** If the diff is purely cosmetic (whitespace, comment-only changes, re-ordered imports the linter would normalize), keep the shadcn-generated output. If the diff shows behavior, prop, or import-structure changes, take hochpos's version. When in doubt, take hochpos's — it's the proven version.

- [ ] **Step 5.4.3: Restore preserved element tests if any**

```bash
ls /tmp/preserved-element-tests/ 2>/dev/null && \
  mv /tmp/preserved-element-tests/*.test.tsx packages/ui/src/elements/ 2>/dev/null || \
  echo "No preserved tests"
```

### Task 5.5: Manual ports for elements not in shadcn registry

**Files:**

- Create: `packages/ui/src/elements/direction.tsx`
- Create: `packages/ui/src/elements/tanstack-form.tsx`
- Create: `packages/ui/src/elements/native-select.tsx` (if `shadcn add` failed for it)
- Create: any other element flagged FAILED in Task 5.3

- [ ] **Step 5.5.1: Port direction.tsx from hochpos**

```bash
cp ../hochpos-ai/packages/ui/src/elements/direction.tsx packages/ui/src/elements/direction.tsx
sed -i.bak 's|@hochpos-ai/|@__APP_NAME__/|g' packages/ui/src/elements/direction.tsx
rm packages/ui/src/elements/direction.tsx.bak
```

- [ ] **Step 5.5.2: Port tanstack-form.tsx from hochpos**

```bash
cp ../hochpos-ai/packages/ui/src/elements/tanstack-form.tsx packages/ui/src/elements/tanstack-form.tsx
sed -i.bak 's|@hochpos-ai/|@__APP_NAME__/|g' packages/ui/src/elements/tanstack-form.tsx
rm packages/ui/src/elements/tanstack-form.tsx.bak
```

- [ ] **Step 5.5.3: Port native-select.tsx from hochpos**

`native-select` is not in the standard shadcn registry (it's a project-specific element).

```bash
cp ../hochpos-ai/packages/ui/src/elements/native-select.tsx packages/ui/src/elements/native-select.tsx
sed -i.bak 's|@hochpos-ai/|@__APP_NAME__/|g' packages/ui/src/elements/native-select.tsx
rm packages/ui/src/elements/native-select.tsx.bak
```

- [ ] **Step 5.5.4: Port any other FAILED elements identified in Task 5.3.1**

For each `el` flagged FAILED in Task 5.3 output:

```bash
cp "../hochpos-ai/packages/ui/src/elements/${el}.tsx" "packages/ui/src/elements/${el}.tsx"
sed -i.bak 's|@hochpos-ai/|@__APP_NAME__/|g' "packages/ui/src/elements/${el}.tsx"
rm "packages/ui/src/elements/${el}.tsx.bak"
```

- [ ] **Step 5.5.5: Verify all 56 elements present**

```bash
ls packages/ui/src/elements/*.tsx | grep -v test | wc -l
```

Expected: `56` (or more if hochpos added new elements since the inventory was taken).

### Task 5.6: Drop direct `radix-ui` import from ui package

**Files:**

- Modify: `packages/ui/package.json`

- [ ] **Step 5.6.1: Confirm no element file imports from `radix-ui` umbrella anymore**

```bash
grep -rn "from \"radix-ui\"" packages/ui/src/elements/ 2>/dev/null
```

Expected: no output (no matches). If matches exist, those elements still use Radix — they need to be re-ported from hochpos.

- [ ] **Step 5.6.2: Remove `radix-ui` from `dependencies`**

In `packages/ui/package.json`, delete the `"radix-ui": "..."` line from `dependencies`.

(Transitive `@radix-ui/react-*` packages from `cmdk`, `vaul`, `embla-carousel-react`, `react-day-picker` etc. stay in the lockfile — those are their own dependencies.)

- [ ] **Step 5.6.3: Reinstall**

```bash
pnpm install
```

### Task 5.7: P5 verification gate

- [ ] **Step 5.7.1: Full verification**

```bash
pnpm check-types
pnpm lint
pnpm test
```

Expected: all three exit 0. The element rebuild may surface:

- Lint warnings about template-literal classNames (port from hochpos handled most, but check). Fix by rewriting with `cn()`.
- Type errors if a generated element references a prop the consumer doesn't pass. Fix by aligning with hochpos.
- Missing-testid lint errors from the custom rule — these surface real gaps; address them.

- [ ] **Step 5.7.2: Visual smoke test**

```bash
pnpm --filter=web dev
```

In the browser:

- Page renders without console errors.
- If the existing landing page uses `<Button>` or `<Card>`, verify they render and Base UI animations behave.
- Open DevTools → Network: confirm Inter font loads.
- Stop dev server.

- [ ] **Step 5.7.3: Single big commit for the UI rebuild**

```bash
git add packages/ui
git commit -m "feat(ui): rebuild elements on Base UI (drop radix-ui umbrella)

All 56 elements now use @base-ui/react primitives. Generated via
\`shadcn add\` against the base-vega registry, then diffed against
hochpos's tested versions and ported where the registry had drifted.

Manual ports:
- direction.tsx (Base UI direction provider wrapper)
- tanstack-form.tsx (TanStack Form hook factory + field components)
- [list any other manual ports here]

Drops the direct \`radix-ui\` umbrella import. Transitive Radix
remains in lockfile via cmdk/vaul/embla-carousel-react/react-day-picker."
```

---

## P6 — `.aoe/` Directory

### Task 6.1: Copy generic AoE scripts and config

**Files:**

- Create: `.aoe/config.toml`
- Create: `.aoe/scripts/setup-worktree.sh`
- Create: `.aoe/scripts/start-session.sh`
- Create: `.aoe/scripts/send-message.sh`
- Create: `.aoe/scripts/add-worktree-session.sh`
- Create: `.aoe/scripts/cleanup-worktree.sh`
- Create: `.aoe/scripts/create-dispatch.sh`
- Create: `.aoe/dispatch/task-template.md`

- [ ] **Step 6.1.1: Create directory structure**

```bash
mkdir -p .aoe/scripts .aoe/dispatch
```

- [ ] **Step 6.1.2: Copy six generic scripts + config + dispatch template**

```bash
cp ../hochpos-ai/.aoe/config.toml .aoe/config.toml

for script in setup-worktree.sh start-session.sh send-message.sh \
              add-worktree-session.sh cleanup-worktree.sh create-dispatch.sh; do
  cp "../hochpos-ai/.aoe/scripts/$script" ".aoe/scripts/$script"
  chmod +x ".aoe/scripts/$script"
done

cp ../hochpos-ai/.aoe/dispatch/task-template.md .aoe/dispatch/task-template.md
```

- [ ] **Step 6.1.3: Generalize `setup-worktree.sh` for the template**

The hochpos `setup-worktree.sh` references `packages/constants/src/ports.ts` for port offsets, which doesn't exist in the template. Open `.aoe/scripts/setup-worktree.sh` and replace any block that reads ports from that file with a simpler default. Specifically:

- Remove any section that sources port offsets from `packages/constants/src/ports.ts`
- Default `PORT_BLOCK_START=9100` (matches hochpos)
- Default `PORT_BLOCK_SIZE=100`
- Replace any `apps/api`-specific .env handling with a comment: `# Add app-specific .env handling here as the project grows`

If the script is too entangled, rewrite the body as:

```bash
#!/usr/bin/env bash
set -euo pipefail

# Worktree setup hook — runs when AoE creates a new worktree session.
#
# Defaults: assigns a 100-port block starting at 9100, copies any
# top-level .env file from the main worktree if present, then runs
# pnpm install so the worktree is immediately usable.
#
# Customize the port logic for your project's actual port layout
# (this template assumes a single dev port for apps/web).

PORT_BLOCK_START=9100
PORT_BLOCK_SIZE=100

WORKTREE_PATH="${1:?worktree path required}"
MAIN_WORKTREE_PATH="${2:-$(git rev-parse --show-toplevel)}"

# Find next available port block by scanning sibling worktrees.
USED_PORTS=$(git worktree list --porcelain | awk '/^worktree /{print $2}' | \
  xargs -I{} sh -c 'cat "{}/.env" 2>/dev/null | grep -E "^PORT_BASE=" | cut -d= -f2' | sort -n)

PORT=$PORT_BLOCK_START
while echo "$USED_PORTS" | grep -q "^$PORT$"; do
  PORT=$((PORT + PORT_BLOCK_SIZE))
done

echo "Assigning PORT_BASE=$PORT to worktree at $WORKTREE_PATH"

# Copy .env from main worktree if it exists
if [ -f "$MAIN_WORKTREE_PATH/.env" ]; then
  cp "$MAIN_WORKTREE_PATH/.env" "$WORKTREE_PATH/.env"
  # Update PORT_BASE in the copy
  if grep -q "^PORT_BASE=" "$WORKTREE_PATH/.env"; then
    sed -i.bak "s/^PORT_BASE=.*/PORT_BASE=$PORT/" "$WORKTREE_PATH/.env"
  else
    echo "PORT_BASE=$PORT" >> "$WORKTREE_PATH/.env"
  fi
  rm -f "$WORKTREE_PATH/.env.bak"
else
  echo "PORT_BASE=$PORT" > "$WORKTREE_PATH/.env"
fi

# Install workspace deps in the worktree
cd "$WORKTREE_PATH"
pnpm install
```

- [ ] **Step 6.1.4: Review the other 5 scripts for hochpos-specific references**

```bash
grep -l "hochpos\|hochpos.app\|develop" .aoe/scripts/*.sh
```

For each match, edit the script to remove or generalize:

- `hochpos-ai` → leave as commented examples or remove
- `hochpos.app` (Cloudflare tunnel domain) → remove
- `develop` branch references → change to a generic placeholder or remove
- References to `apps/api` → comment out or remove

The `start-session.sh`, `send-message.sh`, `add-worktree-session.sh`, `cleanup-worktree.sh`, and `create-dispatch.sh` should mostly be portable, but verify each file's `usage()` examples don't name hochpos.

- [ ] **Step 6.1.5: Commit**

```bash
git add .aoe/config.toml .aoe/scripts .aoe/dispatch
git commit -m "feat(aoe): add generic AoE config and scripts

Six generic scripts: setup-worktree, start-session, send-message,
add-worktree-session, cleanup-worktree, create-dispatch. Config
and dispatch task template come from hochpos. setup-worktree.sh
generalized for templates without packages/constants/src/ports.ts.

Hochpos-specific scripts NOT brought: webhook-listener,
fast-forward-develop, init-main, install-root-dev-hooks,
trigger-root-dev-reconcile."
```

### Task 6.2: Write template-friendly `.aoe/README.md`

**Files:**

- Create: `.aoe/README.md`

- [ ] **Step 6.2.1: Write the README**

```markdown
# AoE Configuration

This directory contains [Agent of Empires (AoE)](https://github.com/your-org/aoe) configuration for multi-agent orchestration in this template.

## Directory Contents
```

.aoe/
config.toml # AoE hooks and worktree settings
dispatch/
task-template.md # Task brief template for orchestrator-created briefs
scripts/
add-worktree-session.sh # Create worktree from base branch, then attach AoE session
create-dispatch.sh # Scaffold a worktree-local dispatch brief, optionally send it
start-session.sh # Create an AoE session and dispatch the first short message reliably
send-message.sh # Reliable AoE send wrapper with Codex submit workaround
cleanup-worktree.sh # Remove AoE sessions for a worktree, then remove the worktree
setup-worktree.sh # on_create hook: assigns ports, copies .env, runs pnpm install
README.md # This file

````

## Reliable AoE Session Startup

For creating a **new worktree + session**, prefer:

```bash
.aoe/scripts/add-worktree-session.sh \
  --branch feat/my-feature \
  --title "My Feature" \
  --cmd codex \
  --model gpt-5.3-codex
````

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

````

- [ ] **Step 6.2.2: Commit**

```bash
git add .aoe/README.md
git commit -m "docs(aoe): template-friendly AoE README

Documents the six generic scripts and the typical session-start
flow without hochpos's webhook listener or develop-branch
automation. Points users at hochpos-ai for that reference."
````

### Task 6.3: Add AoE script shortcuts to root `package.json`

**Files:**

- Modify: `package.json` (root)

- [ ] **Step 6.3.1: Add three script aliases**

In root `package.json`, add these entries to `scripts` (alphabetically near top):

```json
"aoe:dispatch": ".aoe/scripts/create-dispatch.sh",
"aoe:send": ".aoe/scripts/send-message.sh",
"aoe:cleanup": ".aoe/scripts/cleanup-worktree.sh",
```

The `prepare` script stays as `husky` only (do NOT add hochpos's `init-main.sh` chain).

- [ ] **Step 6.3.2: Commit**

```bash
git add package.json
git commit -m "feat(aoe): expose AoE script shortcuts via pnpm

\`pnpm aoe:dispatch\`, \`pnpm aoe:send\`, \`pnpm aoe:cleanup\` now
proxy to the corresponding .aoe/scripts/*.sh files."
```

### Task 6.4: P6 verification gate

- [ ] **Step 6.4.1: Verify scripts run their `--help` paths without error**

```bash
.aoe/scripts/start-session.sh --help 2>&1 | head -5
.aoe/scripts/send-message.sh --help 2>&1 | head -5
.aoe/scripts/cleanup-worktree.sh --help 2>&1 | head -5
```

Expected: each prints usage info, exits 0 or 1 (acceptable — they print usage and exit). No stack traces or "command not found" errors for missing referenced scripts.

- [ ] **Step 6.4.2: Verify pnpm aliases resolve**

```bash
pnpm aoe:cleanup --help 2>&1 | head -5
```

Expected: same usage output via the pnpm alias.

---

## P7 — Docs Split

### Task 7.1: Create `AGENTS.md`

**Files:**

- Create: `AGENTS.md`

- [ ] **Step 7.1.1: Write `AGENTS.md`**

This is the longest single file in the migration. The structure is the universal-rules subset from hochpos with references to template's actual packages. Write the file with this content:

````markdown
# AGENTS.md

Shared instructions for every AI agent working in this repository.

Read this file first. Then read the agent-specific overlay if one exists:

- Claude agents: [`CLAUDE.md`](./CLAUDE.md)
- Codex agents: [`CODEX.md`](./CODEX.md)

Agent-specific overlays must stay thin. Shared project rules live here.

## Project Overview

This is a **pnpm Turborepo monorepo** with a TanStack Start application deployed to Cloudflare Workers. The project uses React 19, TypeScript, and Tailwind CSS v4 with internationalization (i18n) support via Lingui.

```
apps/
  web/              # TanStack Start app (Cloudflare Workers)

packages/
  ui/               # Shared React components (Base UI + shadcn/ui pattern)
  form-options/     # TanStack Form options (Zod schemas + default values)
  locale/           # i18n configuration and translations (Lingui)
  assets/           # Static assets (shared via Cloudflare Workers binding)
  utils/            # Shared utility functions
  constants/        # Shared constants
  react-hooks/      # Shared React hooks
  types/            # Shared TypeScript types
  test-utils/       # Shared test wrappers (Lingui I18nProvider, customRender)
  tailwind-config/  # Shared Tailwind CSS configuration
  eslint-config/    # Shared ESLint configurations
  typescript-config/# Shared TypeScript configurations
  node-fn/          # Shared TanStack server function helpers
```

## Development Commands

Root commands:

- `pnpm dev`
- `pnpm build`
- `pnpm lint`
- `pnpm check-types`
- `pnpm test`
- `pnpm format`

Filter to a workspace with `pnpm --filter <name> <cmd>`.

Useful examples:

- `pnpm --filter=web dev`
- `pnpm --filter=@__APP_NAME__/locale lingui:extract`
- `pnpm --filter=@__APP_NAME__/locale compile`
- `pnpm --filter=@__APP_NAME__/ui test`

## Tech Stack

- **Framework**: TanStack Start (SSR React framework)
- **Routing**: TanStack Router (file-based, type-safe)
- **Runtime**: Cloudflare Workers (via Wrangler)
- **Build Tool**: Vite 7 + SWC (`@vitejs/plugin-react-swc` + `@lingui/swc-plugin`)
- **Styling**: Tailwind CSS v4 with OKLCH 3-tier token system (`packages/tailwind-config/shared-styles.css`)
- **UI Components**: Base UI primitives via shadcn (`base-vega` style)
- **i18n**: Lingui (macro-based, compile-time)
- **State**: TanStack Query for server state
- **Forms**: TanStack Form (type-safe, Zod validation)
- **Testing**: Vitest 4 + React Testing Library
- **Monorepo**: Turborepo with pnpm workspaces
- **Package Manager**: pnpm (v10.32.1+)
- **Node Version**: >=22

## Core Repo Rules

### Import Rules

- **Absolute imports only** across the monorepo.
- Use `@__APP_NAME__/*` for workspace packages.
- Use `@/` only inside app code (`apps/web/src`).
- Relative imports are allowed only for files in the same directory.

Import order (enforced by Prettier):

```typescript
// 1. Workspace packages
import { Component } from "@__APP_NAME__/ui/elements/...";

// 2. @/ imports (app code only)
import { util } from "@/...";

// 3. Relative imports (same directory only)
import { local } from "./...";
```

### Package Dependency Direction

Packages follow a strict layering. **Never create circular or upward dependencies.** Lower layers must not import from higher layers.

```
Layer 0 (no internal deps):  types, locale, assets, test-utils, tailwind-config, eslint-config, typescript-config
Layer 1 (depends on L0):     utils, constants, form-options
Layer 2 (depends on L0-L1):  react-hooks, node-fn
Layer 3 (depends on L0-L2):  ui
Layer 4 (app — consumes all): apps/web
```

If a lower-layer package needs something from a higher layer, the design is wrong — extract the shared piece down.

### Code Organization

- **Route files are composition only.** Routes wire up loaders, components, and error boundaries. No inline UI beyond simple wrappers — extract components to `packages/ui` or app-level component directories.
- **Types single source of truth.** Define types once and derive everywhere. Use Zod schemas to infer TypeScript types where possible. Never maintain parallel type definitions.
- **Never re-export.** Import directly from the source package. Re-exports create indirection that breaks tree-shaking.
- **Shared hooks go in `react-hooks`.** If a hook is used by more than one app or package, it belongs in `packages/react-hooks`, not duplicated in app code.
- **No code duplication between apps.** If two apps need the same logic, extract it to a shared package.
- **No hardcoded business values.** Use constants from `packages/constants` or hooks. Magic numbers and strings in component code are not acceptable.

### Naming Conventions

- **Files**: `kebab-case.ts` / `kebab-case.tsx` — no PascalCase or camelCase filenames
- **Components**: `PascalCase` for React components (exported, not file names)
- **Test files**: `*.test.ts` or `*.test.tsx` — colocated with source, never `.spec.ts`
- **Package names**: `@__APP_NAME__/kebab-case`

### UI Package Structure (`packages/ui/src/`)

- **`elements/`**: Low-level, reusable UI primitives. Wraps Base UI or native HTML. Stateless, data-agnostic, styling-only.
- **`components/`**: Higher-level, app-aware compositions.
- **`form/`**: Form-specific abstractions built on TanStack Form.
- **`hooks/`**: React hooks scoped to UI concerns (not business logic).
- **`utils/`**: UI utilities like `cn()`.

**Rule of thumb**: If it renders UI and has no business logic, it's an element. If it composes elements into an app-level pattern, it's a component.

### Styling

- **Always use `cn()`** to merge class names — never string concatenation or template literals for Tailwind classes.
- **Use CVA (class-variance-authority)** for components with variants.
- **No inline styles**: All styling through Tailwind classes.
- **Shared design tokens** live in `packages/tailwind-config/shared-styles.css`. Never hardcode colors or spacing — use the token system.

See [`FRONTEND_RULES.md`](./FRONTEND_RULES.md) for detailed frontend conventions.

### pnpm Strict Dependency Isolation

This project uses pnpm's default strict isolation mode. **Do NOT add `nodeLinker: hoisted`** to `pnpm-workspace.yaml` or `.npmrc`.

What this means in practice:

- Every package that imports a module **must declare it** in its own `package.json`.
- If TypeScript reports `Cannot find module 'X'` or a non-portable type inference error (`TS2742`), the fix is to **add the missing dependency**, not to switch to hoisted mode.
- After adding new imports, do a clean install (`rm -rf node_modules && pnpm install`) to verify all dependencies are properly declared.

## Testing Conventions

- Tests are **colocated** with source files (`*.test.ts` next to source).
- Use **Vitest 4** as the test runner, `@testing-library/react` for component tests.
- React tests must use the package's own `test-utils` — which re-exports from `@__APP_NAME__/test-utils`.
- Do NOT import directly from `@testing-library/react` (enforced by ESLint).
- Test packages with a `test` script require `vitest.config.mts` with the appropriate environment (`jsdom` for React, default for pure logic).

```typescript
// CORRECT
import { render, screen } from "@__APP_NAME__/ui/test-utils";

// WRONG
import { render } from "@testing-library/react";
```

The shared `TestProviders` wrapper provides Lingui `I18nProvider` so translations work in tests. The custom render is mandatory.

## Quality Bar

Before claiming work is done, run:

```bash
pnpm lint
pnpm check-types
pnpm test
```

All must pass with **zero warnings** and **zero type errors**.

## Multi-Agent Workflow (AoE)

Multi-agent orchestration uses Agent of Empires (AoE). See [`.aoe/README.md`](.aoe/README.md) for setup.

Core conventions:

- All long-running services (`pnpm dev`, watchers) run in the AoE session so the orchestrator and worker share output.
- Worktree sessions get an automatic port assignment via `.aoe/scripts/setup-worktree.sh`.
- The orchestrator and workers communicate through `.aoe/scripts/send-message.sh`.

## Pinned Packages

Some packages are intentionally held at specific versions due to known issues. See [`PINNED_PACKAGES.md`](./PINNED_PACKAGES.md). **Always check this file before upgrading vitest, react/react-dom, typescript, or related test packages.** Pinned versions are enforced via `pnpm.overrides` in the root `package.json`.

## Important Notes

- **No `next` app**: This uses TanStack Start, not Next.js.
- **File-based routing**: Don't manually edit `routeTree.gen.ts`.
- **Workspace dependencies**: Use `workspace:*` protocol for internal packages.
- **Prettier + Husky**: Code is auto-formatted on commit via lint-staged.
- **Strict ESLint**: Max warnings set to 0; build fails on warnings.
- **App name placeholder**: This template uses `__APP_NAME__` everywhere — find/replace it with your actual scope when bootstrapping a new project.
````

- [ ] **Step 7.1.2: Commit**

```bash
git add AGENTS.md
git commit -m "docs: add AGENTS.md as shared agent baseline

Universal rules for every AI agent working in this repo. Imports
the proven hochpos structure but trims project-specific bits
(proposal engine, AI orchestration, OpenAPI pipeline, real-infra
QA). Points at FRONTEND_RULES.md for frontend specifics and
PINNED_PACKAGES.md for version constraints."
```

### Task 7.2: Rewrite `CLAUDE.md` as thin overlay

**Files:**

- Modify: `CLAUDE.md` (full rewrite)

- [ ] **Step 7.2.1: Replace `CLAUDE.md` with thin overlay**

```markdown
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
```

- [ ] **Step 7.2.2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: rewrite CLAUDE.md as thin overlay over AGENTS.md

Most of the previous CLAUDE.md content moved to AGENTS.md as
shared baseline. CLAUDE.md now lists only Claude-specific
affordances (superpowers skills, native MCP discovery, AoE
launch examples)."
```

### Task 7.3: Create `CODEX.md`

**Files:**

- Create: `CODEX.md`

- [ ] **Step 7.3.1: Write `CODEX.md`**

```markdown
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
```

- [ ] **Step 7.3.2: Commit**

```bash
git add CODEX.md
git commit -m "docs: add CODEX.md thin overlay

Mirrors CLAUDE.md structure for Codex agents. Same baseline
(AGENTS.md), Codex-specific notes about MCP discovery
fallbacks and AoE launch syntax."
```

### Task 7.4: Create `FRONTEND_RULES.md`

**Files:**

- Create: `FRONTEND_RULES.md`

- [ ] **Step 7.4.1: Write `FRONTEND_RULES.md` with curated subset**

This file is long (curated from hochpos's 553 lines down to ~300). Write the content as the curated subset spec calls for: theme tokens (R1–R7), test-ids + Playwright (R8–R13), color enforcement (R14–R15), loading states (R16–R18), animation (R19–R21), client state (R22), assets (R23–R24), performance (R25–R27), i18n (R28–R30), route composition (R31).

Use this template (read hochpos's `FRONTEND_RULES.md` as the source for each rule's exact text, then renumber and rewrite project-specific references to template-generic ones):

```markdown
# Frontend Rules

This document defines how frontend code must be structured in this template. **Read this before doing any frontend work.**

---

## Theme Token Rules (R1–R7)

The codebase uses a three-tier OKLCH token system defined in `packages/tailwind-config/shared-styles.css`:

| Tier                | Purpose                              | Location                      | Example                                  |
| ------------------- | ------------------------------------ | ----------------------------- | ---------------------------------------- |
| 1 — Raw palette     | Abstract OKLCH color channels        | `:root` CSS custom properties | `--ink-700: 0.28 0.018 58`               |
| 2 — Semantic tokens | Role-named aliases of tier-1         | `:root` and `.dark` selectors | `--primary`, `--foreground`              |
| 3 — Tailwind bridge | `oklch(var(--semantic))` in `@theme` | `@theme {}` block             | `--color-primary: oklch(var(--primary))` |

**R1 — Token consumption.** Components MUST use Tailwind semantic color classes (`bg-primary`, `text-muted-foreground`, etc.). Never reference CSS custom properties directly in className, never use raw color values (`#hex`, `rgb()`, `oklch()` literals), never use default Tailwind palette colors (`text-gray-900`, `bg-blue-500`).

**R2 — Color function consistency.** When arbitrary Tailwind values must reference tier-2 tokens, use `oklch(var(--token))` — never `hsl(var(--token))`. The palette is defined in OKLCH; mixing color spaces causes perceptual inconsistencies.

**R3 — Dark mode overrides.** Use `dark:` Tailwind prefix only for adjustments that can't be expressed via tier-2 token swaps alone (typically opacity modifiers like `dark:bg-destructive/60`).

**R4 — New token workflow.** To add a new design token: (1) add a tier-1 raw value if no existing palette color fits, (2) add a tier-2 semantic name in both `:root` and `.dark`, (3) promote to tier-3 in `@theme {}`, (4) consume via Tailwind class.

**R5 — Variant styling.** Components with visual variants (size, color, state) MUST use CVA (`class-variance-authority`). Variant class strings reference only semantic tokens. Define the `cva()` call in the same file as the component.

**R6 — Class composition.** Always use `cn()` (from `@__APP_NAME__/ui/utils`) to merge class names. Never use string concatenation or template literals.

**R7 — No default Tailwind palette.** Never use Tailwind's built-in color palette (`red-500`, `slate-200`, etc.) in component code. All colors flow through the semantic token system.

---

## Test-IDs and Playwright (R8–R13)

**Naming pattern: `{scope}-{element}[-{qualifier}]`**

| Scope        | Element                          | Qualifier                   | Example                                    |
| ------------ | -------------------------------- | --------------------------- | ------------------------------------------ |
| Feature area | Interactive element type or role | Optional dynamic identifier | `sign-in-email`, `nav-home`, `entity-edit` |

**R8 — Mandatory `data-testid` elements:**

| Element type                                      | Required? |
| ------------------------------------------------- | --------- |
| Form inputs (`<Input>`, `<Textarea>`, `<Select>`) | YES       |
| Submit buttons                                    | YES       |
| Navigation links/tabs                             | YES       |
| Action buttons (delete, edit, approve, toggle)    | YES       |
| Modal/dialog containers                           | YES       |
| Modal close buttons                               | YES       |
| Error message containers                          | YES       |
| Dropdown triggers                                 | YES       |
| Display-only text, structural wrappers, icons     | NO        |

This is enforced by the `template/require-testid-on-action-elements` ESLint rule (see `packages/eslint-config/rules/require-testid-on-action-elements.cjs`).

**R9 — Use `testId()` for dynamic IDs.** When the test ID includes a runtime value (slug, key), use the `testId()` utility from `@__APP_NAME__/ui/utils`. For static IDs on form fields, inline `data-testid="..."` strings are acceptable.

**R10 — Kebab-case only.** All `data-testid` values use kebab-case. No camelCase, no underscores.

**R11 — Form component passthrough.** All `packages/ui/src/form/elements/*` components MUST accept and forward `data-testid` to their underlying DOM element.

**R12 — Selector priority.** In Playwright interactions, prefer selectors in this order: (1) `[data-testid="..."]`; (2) `role=...` with `name=...`; (3) CSS class selectors (last resort).

**R13 — Playwright is mandatory for frontend PRs.** Every PR touching `apps/web/**`, `packages/ui/**`, or `packages/react-hooks/**` MUST include a golden-path Playwright verification, at least one edge case, two viewports for layout changes, and zero console errors after hydration.

---

## Color Enforcement (R14–R15)

**R14 — Lint elements.** `packages/ui/eslint.config.mjs` must NOT exempt element files. Elements must pass the same lint rules as everything else.

**R15 — Banned Tailwind color patterns.** Components must not use raw Tailwind palette color classes (`red-500`, `blue-200`, etc.) or `hsl(var(--`)) references. Optional: add a `theme-compliance.test.ts` that globs `.tsx` files and asserts compliance.

---

## Loading States (R16–R18)

**R16 — Route pending components.** Every route with a data loader MUST set `pendingMs: 200` (show loading after 200ms to avoid flicker on fast navigations). Routes should set `pendingComponent` with a skeleton that mirrors the page layout.

**R17 — Skeleton over spinner.** Use `<Skeleton>` for content areas (preserves layout shape). Use `<Spinner>` only for inline indicators (button loading state). Never show a full-page centered spinner.

**R18 — Loading state consistency.** All skeleton compositions must use the same `animate-pulse` animation from `<Skeleton>`. No custom loading animations.

---

## Animation Conventions (R19–R21)

**R19 — Animation approach.** Use Tailwind transition utilities and `tw-animate-css` keyframes only. Do not add Framer Motion or any JS animation library. (Enforced by ESLint banned-imports.)

**R20 — Base UI state transitions.** All Base UI overlay components (Dialog, Sheet, Popover, DropdownMenu, Tooltip) MUST use the standardized enter/exit pattern:
```

data-open:animate-in data-closed:animate-out
fade-in-0 fade-out-0 zoom-in-95 zoom-out-95

```

With directional slide variants for side-anchored components (`slide-in-from-top-2`, etc.).

**R21 — No page transitions.** Route changes render instantly. No enter/exit animations on route components.

---

## Client State Management (R22)

**R22 — Defaults and escalation.** Default to TanStack Query + `useState` + React Context. Reach for Zustand only when you have **client-only** state that meets at least one of:

- Frequent updates where multiple components subscribe to different slices
- State that needs to be read outside the React tree (`store.getState()`)
- Complex derived state where Context re-renders are measurably expensive

When using Zustand: one store per domain concern, never a single global app store. Zustand stores must not duplicate server state that belongs in TanStack Query.

**Banned (enforced by ESLint):** Redux, `@reduxjs/toolkit`, MobX.

---

## Asset Handling (R23–R24)

**R23 — Lazy loading for images.** All `<img>` tags MUST include `loading="lazy"` except above-the-fold content (e.g., logo).

**R24 — No image optimization pipeline.** Do not add `sharp`, `next/image`, or Vite image optimization plugins out of the box. Cloudflare Workers Image Resizing is an opt-in concern.

---

## Performance (R25–R27)

**R25 — Route-level code splitting is automatic.** TanStack Start + Vite handles this. Do not add `React.lazy` for route components.

**R26 — Lazy load heavy non-route components.** Components over ~50KB (chart libraries, rich text editors) MUST be loaded via `React.lazy` with a `<Suspense>` fallback.

**R27 — No barrel re-exports from `packages/ui`.** Each import path resolves to a single file. Never create an `index.ts` that re-exports all elements — it defeats tree-shaking.

---

## Internationalization (R28–R30)

**R28 — DirectionProvider wiring.** Wire `DirectionProvider` (from `@__APP_NAME__/ui/elements/direction`) in the root layout before adding any RTL locale. Set `<html dir={...}>` based on the active locale.

**R29 — Plural form configuration.** Update each locale's `messages.po` header with the appropriate `Plural-Forms` value. Without this header, Lingui's plural extraction is undefined.

**R30 — Dynamic locale loading.** The dynamic import pattern for locale messages must be guarded against arbitrary locale injection. Validate the locale against the `LOCALES` constant before dynamic import.

---

## Route Composition (R31)

**R31 — Route files are composition only.** Route files in `apps/web/src/routes/` wire up loaders, components, and error boundaries. They are the place where components from `packages/ui`, logic from `packages/react-hooks`, and utilities from other packages come together. No logic lives in route files.

**ALLOWED in route files:**

- `createFileRoute()` with `loader`, `component`, `errorComponent`, `pendingComponent`, `beforeLoad`
- A component function that imports and composes from `@__APP_NAME__/*` packages
- Simple destructuring of loader data
- Short inline callbacks (< 3 lines)

**NOT ALLOWED in route files:**

- Inline component definitions beyond simple wrappers
- Direct API calls (use TanStack Query)
- Business logic
- More than ~50 lines per route file
```

- [ ] **Step 7.4.2: Commit**

```bash
git add FRONTEND_RULES.md
git commit -m "docs: add curated FRONTEND_RULES.md

31 template-relevant rules ported from hochpos's 553-line file.
Drops widget architecture (R8-R11), specific error boundary
mechanics (R20-R22), drawer state (R30), Thai font loading (R36
— already handled), and module split (R40). Renumbered for
template; references @__APP_NAME__ paths."
```

### Task 7.5: Update `README.md` to point at the new docs

**Files:**

- Modify: `README.md`

- [ ] **Step 7.5.1: Read current README.md**

```bash
cat README.md
```

- [ ] **Step 7.5.2: Add agent-docs and AoE pointers**

Add a new section near the top (after the project description) that references:

```markdown
## AI Agent Guidance

This template is designed to be worked on collaboratively with AI agents. Agent guidance is split into:

- [`AGENTS.md`](./AGENTS.md) — shared baseline for every agent
- [`CLAUDE.md`](./CLAUDE.md) — Claude-specific additions
- [`CODEX.md`](./CODEX.md) — Codex-specific additions
- [`FRONTEND_RULES.md`](./FRONTEND_RULES.md) — frontend conventions
- [`PINNED_PACKAGES.md`](./PINNED_PACKAGES.md) — version constraints

Multi-agent orchestration uses [Agent of Empires (AoE)](.aoe/README.md). See `.aoe/README.md` for setup and conventions.
```

- [ ] **Step 7.5.3: Commit**

```bash
git add README.md
git commit -m "docs: link README to new agent-doc + AoE structure"
```

### Task 7.6: P7 verification gate

- [ ] **Step 7.6.1: Verify all docs cross-references resolve**

```bash
# Confirm files exist
test -f AGENTS.md && echo "AGENTS.md OK"
test -f CLAUDE.md && echo "CLAUDE.md OK"
test -f CODEX.md && echo "CODEX.md OK"
test -f FRONTEND_RULES.md && echo "FRONTEND_RULES.md OK"
test -f PINNED_PACKAGES.md && echo "PINNED_PACKAGES.md OK"
test -f .aoe/README.md && echo ".aoe/README.md OK"
```

Expected: each prints `OK`.

- [ ] **Step 7.6.2: Confirm no `@hochpos-ai/` references remain in source**

```bash
grep -rn "@hochpos-ai" --include="*.ts" --include="*.tsx" --include="*.js" --include="*.mjs" --include="*.json" --include="*.md" .
```

Expected: only references inside `docs/superpowers/specs/` (acceptable — the spec describes hochpos as the source) and possibly inside `.aoe/scripts/*.sh` example comments. Address any source-code or config-file references.

- [ ] **Step 7.6.3: Final full verification**

```bash
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four exit 0.

---

## Final — Wrap-up

### Task F.1: End-to-end smoke test

- [ ] **Step F.1.1: Clean install from scratch**

```bash
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install
pnpm check-types
pnpm lint
pnpm test
```

Expected: all four exit 0 from a fresh install.

- [ ] **Step F.1.2: Build succeeds**

```bash
pnpm build
```

Expected: turbo builds all packages and the app without errors.

- [ ] **Step F.1.3: Dev server starts**

```bash
pnpm dev
```

Open browser to the dev URL. Verify:

- Page renders
- No console errors
- Inter font loaded (Network tab)
- Theme tokens apply (inspect any element — `bg-primary`, `text-foreground` should resolve to OKLCH values)

Stop dev server.

### Task F.2: Push branch and open PR

- [ ] **Step F.2.1: Push the feature branch**

```bash
git push -u origin feat/hochpos-back-merge
```

- [ ] **Step F.2.2: Open a PR**

```bash
gh pr create --title "Back-merge proven improvements from hochpos-ai" --body "$(cat <<'EOF'
## Summary

Migrates seven concerns from the downstream `hochpos-ai` project back into the template:

- Theme: OKLCH 3-tier token system (literal copy)
- Pinned packages: typescript dedupe, vitest 4.0.18, react/react-dom 19.2.0, @types/react alignment
- AoE replaces DevMux for multi-agent orchestration
- Doc split: AGENTS.md (shared) + thin CLAUDE.md / CODEX.md overlays
- FRONTEND_RULES.md: 31 template-relevant rules
- UI primitives: Radix → Base UI via shadcn `base-vega` registry
- ESLint: banned packages, testing-library ban, `../*` ban, className composition ban
- Bulk dep bump: all non-pinned packages to latest
- New `packages/test-utils` workspace package
- New `scripts/vitest-run.mjs` shared runner

Reference: [`docs/superpowers/specs/2026-05-08-hochpos-template-back-merge-design.md`](docs/superpowers/specs/2026-05-08-hochpos-template-back-merge-design.md)

## Test plan

- [x] `pnpm install && pnpm check-types && pnpm lint && pnpm test` green from fresh install
- [x] `pnpm build` succeeds
- [x] `pnpm dev` starts; browser smoke test passes (page renders, no console errors, theme tokens resolve)
- [x] No `@hochpos-ai/` references remain outside spec docs
- [x] All 56 UI elements present and lint-clean
- [x] Custom ESLint rule `template/require-testid-on-action-elements` enforced

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review Checklist (for plan author)

After implementation begins, the executing agent should:

1. **Spec coverage** — every spec section maps to at least one task above. Cross-reference: P1 → Tasks 1.1–1.6; P2 → Task 2.1; P3 → Tasks 3.1–3.6; P4 → Tasks 4.1–4.4; P5 → Tasks 5.1–5.7; P6 → Tasks 6.1–6.4; P7 → Tasks 7.1–7.6.
2. **Placeholder scan** — search the plan for "TBD", "TODO", "fill in" — none should remain.
3. **Type consistency** — function names, signatures, and import paths used in later tasks match earlier task definitions.
4. **Verification gates** — every phase ends with `pnpm install && pnpm check-types && pnpm lint && pnpm test` green.
