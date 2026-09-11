---
name: template-baseline
description: Use for every coding task in this TanStack Start monorepo to apply package boundaries, import conventions, test requirements and completion gates.
---

# Template Baseline

Use this skill for every repository coding task. Read manifests and checked-in
configuration for current versions and commands. Load only the relevant scoped
skill as work reaches that area:

- [template-setup](../template-setup/SKILL.md): initialization, development, deployment and troubleshooting.
- [template-frontend](../template-frontend/SKILL.md): UI, routes, styling and browser verification.
- [template-backend](../template-backend/SKILL.md): server functions and domain ownership.
- [template-toolchain](../template-toolchain/SKILL.md): dependency upgrades, TypeScript and lint configuration.

Canonical project guidance lives under `skills/*/SKILL.md`. Codex discovers
the same files through `.agents/skills`; Claude discovers them through
`.claude/skills`. Both are relative directory symlinks to `skills/`; edit the
canonical files once. Do not recreate standalone Markdown guides or duplicate
provider-specific instructions. New sessions discover new skills; an existing
session can read their files explicitly.

Use available workflow skills when relevant, and follow their intent manually
when unavailable. Discover the actual available tools; do not infer MCP tools
from a configuration filename. Use shell and browser tools as appropriate.

Use Context7 for current external-library APIs, configuration and migrations:
resolve the library ID, then query documentation for the concrete task.
Refactoring, business-logic debugging and general programming do not require
a documentation lookup.

## Project Overview

This is a **pnpm Turborepo monorepo** with a TanStack Start application deployed to Cloudflare Workers. The project uses React 19, TypeScript, and Tailwind CSS v4 with internationalization (i18n) support via Lingui.

```text
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

```text
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
- **Unit test files**: `*.test.ts` or `*.test.tsx` — colocated with source, never `.spec.ts`
- **End-to-end test files**: `*.e2e.ts` — isolated in `apps/e2e/tests`
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

Load [template-frontend](../template-frontend/SKILL.md) for detailed frontend conventions.

### pnpm Strict Dependency Isolation

This project uses pnpm's default strict isolation mode. **Do NOT add `nodeLinker: hoisted`** to `pnpm-workspace.yaml` or `.npmrc`.

What this means in practice:

- Every package that imports a module **must declare it** in its own `package.json`.
- If TypeScript reports `Cannot find module 'X'` or a non-portable type inference error (`TS2742`), the fix is to **add the missing dependency**, not to switch to hoisted mode.
- After adding new imports, run `pnpm clean:node-modules` followed by
  `pnpm install --frozen-lockfile` to verify strict dependency isolation from a
  clean install.

## Testing Conventions

- Tests are **colocated** with source files (`*.test.ts` next to source).
- Use **Vitest** as the test runner, Vitest Browser Mode for component tests.
- React tests use the package's own `test-utils`, backed by the shared `vitest-browser-react` renderer and Lingui provider.
- Await `render()` and `renderHook()`. Import `page` and `userEvent` from `vitest/browser`, interact with locators and await `expect.element(...)` assertions.
- Do not add Jest DOM matcher registration, global Jest type declarations, React Testing Library or JSDOM. The lint rules enforce the Browser Mode pattern.
- Test packages with a `test` script require `vitest.config.mts` with the appropriate environment (headless Chromium for React, Node for pure logic and SSR).

```typescript
import { expect, test } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

// Inside an async test, await render(<Component />), then assert on locators:
await expect.element(page.getByRole("button", { name: "Save" })).toBeVisible();
```

The shared `TestProviders` wrapper provides Lingui `I18nProvider` so translations work in tests. The custom render is mandatory.

## Quality Bar

Before claiming work is done, run:

```bash
pnpm verify:all
```

Formatting, lint, TypeScript, unit tests, the production build, and Playwright
must pass with **zero warnings**, **zero type errors**, and **zero browser
console errors**.

## Important Notes

- **No `next` app**: This uses TanStack Start, not Next.js.
- **File-based routing**: Don't manually edit `routeTree.gen.ts`.
- **Workspace dependencies**: Use `workspace:*` protocol for internal packages.
- **Prettier + Husky**: Code is auto-formatted on commit via lint-staged.
- **Strict ESLint**: Max warnings set to 0; build fails on warnings.
- **Template identity placeholders**: `__APP_NAME__` is the package/Worker slug and `__APP_DISPLAY_NAME__` is the human-readable product name. Use the tested initializer rather than manual replacement.

Component tests use colocated `*.test.tsx` files. Keep server-rendering tests in
`*.ssr.test.tsx`; the UI Vitest config routes those and `*.test.ts` source checks
to Node. Chromium is installed with `pnpm e2e:install` before `pnpm verify:all`.
Use actual browser APIs and viewports instead of global DOM mocks.
