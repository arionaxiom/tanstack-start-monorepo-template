# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **pnpm Turborepo monorepo** with a TanStack Start application deployed to Cloudflare Workers. The project uses React 19, TypeScript, and Tailwind CSS v4 with internationalization (i18n) support via Lingui.

**Note**: `__APP_NAME__` is a placeholder that appears throughout the codebase and should be replaced with the actual application name.

## Development Commands

### Root Commands

```bash
# Start development servers for all apps
pnpm dev

# Start dev server for specific app
pnpm dev --filter=web

# Build all apps and packages
pnpm build

# Lint all code
pnpm lint

# Type check all packages
pnpm check-types

# Format code
pnpm format

# Format staged files (runs via husky pre-commit)
pnpm format:staged
```

### Web App Commands (apps/web)

```bash
# Run development server on port 3000
pnpm dev

# Build for production
pnpm build

# Run tests with Vitest
pnpm test

# Deploy to Cloudflare
pnpm deploy

# Generate Cloudflare Worker types
pnpm cf-typegen
```

### Internationalization (i18n)

```bash
# Extract translatable strings from code
pnpm --filter=@__APP_NAME__/locale lingui:extract

# Compile translations
pnpm --filter=@__APP_NAME__/locale compile
```

Translation files are in `packages/locale/locales/` with support for English (en), Thai (th), and pseudo locales.

## Architecture

### Monorepo Structure

```
apps/
  web/              # TanStack Start app (Cloudflare Workers)
    src/
      routes/       # File-based routing (TanStack Router)
      i18n/         # i18n router integration & middleware
      nav/          # Navigation configuration

packages/
  ui/               # Shared React components (Radix UI + shadcn/ui pattern)
    src/
      components/   # App-level components (layouts, boundaries)
      elements/     # Reusable UI elements
      hooks/        # React hooks
      utils/        # UI utilities

  form-options/     # TanStack Form options (Zod schemas + default values)
  locale/           # i18n configuration and translations (Lingui)
  assets/           # Static assets (shared via Cloudflare Workers binding)
  utils/            # Shared utility functions
  constants/        # Shared constants
  react-hooks/      # Shared React hooks
  types/            # Shared TypeScript types
  tailwind-config/  # Shared Tailwind CSS configuration
  eslint-config/    # Shared ESLint configurations
  typescript-config/# Shared TypeScript configurations
```

### Tech Stack

- **Framework**: TanStack Start (SSR React framework)
- **Routing**: TanStack Router (file-based, type-safe)
- **Runtime**: Cloudflare Workers (via Wrangler)
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives
- **i18n**: Lingui (macro-based, compile-time)
- **State**: TanStack Query for server state
- **Forms**: TanStack Form (type-safe, Zod validation)
- **Testing**: Vitest + React Testing Library
- **Monorepo**: Turborepo with pnpm workspaces
- **Package Manager**: pnpm (v10.32.1+)
- **Node Version**: >=22

### Key Patterns

#### Path Aliases

- `@/` - Resolves to `apps/web/src/`
- `@__APP_NAME__/*` - Workspace packages (e.g., `@__APP_NAME__/ui`)

#### Import Order (enforced by Prettier)

```typescript
// 1. Workspace packages
import { Component } from "@__APP_NAME__/ui/...";

// 2. @/lib
import { lib } from "@/lib/...";

// 3. @/modules
import { module } from "@/modules/...";

// 4. @/components
import { Component } from "@/components/...";

// 5. Other @/ imports
import { util } from "@/...";

// 6. Relative imports
import { local } from "./...";
```

#### Routing Architecture

- **File-based routing**: Routes defined in `apps/web/src/routes/`
- **Auto-generated route tree**: `routeTree.gen.ts` (don't edit manually)
- **Type-safe routing**: Router types auto-generated via TanStack Router plugin
- **i18n integration**: Router wrapped with `routerWithLingui()` for locale support
- **Root route**: `__root.tsx` provides app layout and global error boundaries

#### i18n Architecture

- **Translation extraction**: Scans `packages/ui/src/` and `apps/web/src/`
- **Macro-based**: Use `<Trans>` macro for translations
- **Router integration**: Locale state managed at router level via custom plugin
- **Server-side**: i18n setup in loader functions with locale context

#### Component Library Pattern (`packages/ui`)

- **Radix UI primitives**: Unstyled accessible components
- **shadcn/ui pattern**: Customizable components via Tailwind
- **Barrel exports**: Components exported via package.json `exports` field
  - `@__APP_NAME__/ui/components/*` - App components
  - `@__APP_NAME__/ui/elements/*` - UI elements
  - `@__APP_NAME__/ui/utils/*` - Utilities
  - `@__APP_NAME__/ui/hooks/*` - React hooks
  - `@__APP_NAME__/ui/form/*` - Form hook & field components

#### Form Architecture (TanStack Form)

Forms follow a three-layer pattern:

1. **Zod schemas** (`packages/types/src/forms.ts`): Define validation rules and infer TypeScript types. Single source of truth for form data shapes.
2. **Form options** (`packages/form-options/src/*.ts`): Pair default values with Zod validators using `formOptions()` from `@tanstack/form-core`. Platform-agnostic — shared between web and potential mobile apps.
3. **Form hook + field components** (`packages/ui/src/form/`): `useAppForm` (created via `createFormHook`) wires options to the UI. Field components (`FormInput`, etc.) consume field context and render with validation state.

**Usage pattern:**

```typescript
import { useAppForm } from "@__APP_NAME__/ui/form/form";
import { signInFormOpts } from "@__APP_NAME__/form-options/sign-in";

function SignInForm() {
  const form = useAppForm({
    ...signInFormOpts,
    onSubmit: async ({ value }) => { /* value is typed */ },
  });

  return (
    <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }}>
      <form.AppField name="email">
        {(field) => <field.FormInput label="Email" type="email" />}
      </form.AppField>
      <form.AppForm>
        <form.SubmitButton>Sign in</form.SubmitButton>
      </form.AppForm>
    </form>
  );
}
```

**Adding a new form field component:** Create in `packages/ui/src/form/elements/`, use `useFieldContext<T>()` for state, and register it in the `createFormHook` call in `packages/ui/src/form/form.ts`.

#### Cloudflare Workers Integration

- **Configuration**: `apps/web/wrangler.jsonc`
- **Assets binding**: Static assets from `packages/assets/src/` bound as `ASSETS`
- **Server entry**: `@tanstack/react-start/server-entry`
- **Type generation**: Run `pnpm cf-typegen` after changing wrangler config

### ESLint Configuration

- **Base config** (`packages/eslint-config/base.js`): TypeScript + Turbo plugin
- **React config** (`packages/eslint-config/react-internal.js`): Adds React + React Hooks rules
- **Key rules**:
  - `no-console: error` (use logging utilities instead)
  - `@typescript-eslint/no-explicit-any: error` (no `any` types)
  - `turbo/no-undeclared-env-vars: warn`
  - Unused vars prefixed with `_` are ignored

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext with bundler module resolution
- **Strict mode**: Enabled with `noUncheckedIndexedAccess`
- **Path aliases**: Configured per package via tsconfig.json `paths`

## Architecture Rules

These rules apply across the entire codebase to maintain consistency and prevent common pitfalls.

### Code Organization

- **Route files are composition only**: Route files wire up loaders, components, and error boundaries. No inline UI beyond simple wrappers — extract components to `packages/ui` or app-level component directories.
- **Types single source of truth**: Define types once, derive everywhere. Use Zod schemas to infer TypeScript types where possible. Never maintain parallel type definitions.
- **Never re-export**: Import directly from the source package. Re-exports create indirection that breaks tree-shaking and makes dependency graphs harder to trace.
- **Shared hooks go in `react-hooks`**: If a hook is used by more than one app or package, it belongs in `packages/react-hooks`, not duplicated in app code.
- **No code duplication between apps**: If two apps need the same logic, extract it to a shared package (`utils`, `react-hooks`, `constants`, `types`).
- **No hardcoded business values**: Use constants from `packages/constants` or hooks. Magic numbers and strings in component code are not acceptable.
- **Shared utility functions over inline patterns**: If you find yourself writing the same logic in multiple places, extract it to `packages/utils`.

### Package Dependency Direction

Packages follow a strict layering. **Never create circular dependencies.** Lower layers must not import from higher layers.

```
Layer 0 (no internal deps):  types, locale, assets, tailwind-config, eslint-config, typescript-config
Layer 1 (depends on L0):     utils, constants, form-options
Layer 2 (depends on L0-L1):  react-hooks, node-fn
Layer 3 (depends on L0-L2):  ui
Layer 4 (app — consumes all): apps/web
```

If you need to add a dependency between packages, verify it respects this direction. If a lower-layer package needs something from a higher layer, the design is wrong — extract the shared piece down.

### Naming Conventions

- **Files**: `kebab-case.ts` / `kebab-case.tsx` — no PascalCase or camelCase filenames
- **Components**: `PascalCase` for React components (exported, not file names)
- **Test files**: `*.test.ts` or `*.test.tsx` — colocated with source, never `.spec.ts`
- **Package names**: `@__APP_NAME__/kebab-case`

### UI Package Structure (`packages/ui/src/`)

- **`elements/`**: Low-level, reusable UI primitives. Wraps Radix UI or native HTML. Stateless, data-agnostic, styling-only. Example: `button.tsx`, `card.tsx`, `dialog.tsx`.
- **`components/`**: Higher-level, app-aware compositions. Composes elements into layouts or patterns with props for customization. Example: `app-layout.tsx`, `default-catch-boundary.tsx`.
- **`form/`**: Form-specific abstractions built on TanStack Form. Field components (`elements/`), form-level components (`components/`), and the `useAppForm` hook factory.
- **`hooks/`**: React hooks scoped to UI concerns (not business logic — those go in `packages/react-hooks`).
- **`utils/`**: UI utilities like `cn()`.

**Rule of thumb**: If it renders UI and has no business logic, it's an element. If it composes elements into an app-level pattern, it's a component.

### Styling

- **Always use `cn()`** to merge class names — never string concatenation or template literals for Tailwind classes.
- **Use CVA (class-variance-authority)** for components with variants (size, color, state). Define variants in the same file as the component.
- **No inline styles**: All styling through Tailwind classes.
- **Shared design tokens** live in `packages/tailwind-config/shared-styles.css` and `tokens.css`. Never hardcode colors or spacing — use the token system.

### Creating a New Package

Every workspace package needs these files:

```
packages/my-package/
  package.json        # name, exports, scripts (check-types, lint), deps
  tsconfig.json       # extends @__APP_NAME__/typescript-config/react-library.json
  eslint.config.js    # imports from @__APP_NAME__/eslint-config/base (or react-internal)
  src/                # source code
```

**Exports pattern**: Source packages use `"./*": "./src/*.ts"`. Config packages use named exports.

After creating the package, add it as a dependency in consuming packages using `"workspace:*"` protocol, then run `pnpm install`.

### Testing Conventions

- Tests are **colocated** with source files (e.g., `utils.test.ts` next to `utils.ts`)
- Use **Vitest** as the test runner, `@testing-library/react` for component tests
- Test packages that have a `test` script require a `vitest.config.mts` with the appropriate environment (`jsdom` for React, default for pure logic)
- Coverage runs via `vitest run --coverage --silent=true`

#### Custom render is mandatory for React tests

**Every test that renders React components or hooks must use the custom `render` / `renderHook` from the package's `test-utils.tsx` — never import directly from `@testing-library/react`.** The custom render wraps components with required providers (Lingui `I18nProvider`, etc.) so translations and context work correctly in tests.

```typescript
// CORRECT — always use test-utils
import { render, screen } from "../test-utils";

// WRONG — never import render directly from testing-library
import { render } from "@testing-library/react";
```

Each package with React tests has its own `test-utils.tsx`:

- `packages/ui/src/test-utils.tsx` — exports `render`, `renderHook`, `screen`, `fireEvent`, `userEvent`
- `packages/react-hooks/src/test-utils.tsx` — exports `render`, `renderHook`, `screen`, `fireEvent`, `act`

The `test-setup.ts` in each package loads the English locale via `i18n.loadAndActivate()` and extends Vitest's `expect` with jest-dom matchers. The UI package also mocks JSDOM globals that Radix UI depends on (`ResizeObserver`, `IntersectionObserver`, `visualViewport`, etc.).

### Backend Architecture

**Before doing any backend work, read [`BACKEND_RULES.md`](./BACKEND_RULES.md).** It defines how domain services are structured, data ownership boundaries, and cross-service communication rules. Even though this project is a monolith, backend logic must be organized into domain-owned services where each service is the sole authority over its data — no direct cross-domain database access.

### Pinned Packages

Some packages are intentionally held at specific versions due to known issues. See `PINNED_PACKAGES.md` for details. **Always check this file before upgrading vitest or related test packages.** Pinned versions are enforced via `pnpm.overrides` in the root `package.json`.

### React & Expo Compatibility

React and React DOM versions are pinned via `pnpm.overrides` in the root `package.json` to ensure compatibility across all packages and potential Expo integration. Do not change these overrides without verifying compatibility.

## Code Quality Requirements

**All code changes must pass the following checks before being committed:**

```bash
# Run all quality checks
pnpm run lint          # ESLint - must pass with 0 warnings
pnpm run check-types   # TypeScript type checking - must pass with no errors
pnpm run test          # Vitest tests - all tests must pass
```

These checks ensure code quality and prevent broken code from being merged. The lint-staged hook will automatically format code on commit, but you must ensure lint, type checks, and tests pass before committing.

## Development Workflow

1. **Adding a new route**: Create a file in `apps/web/src/routes/`. The route tree regenerates automatically.

2. **Adding a new UI component**: Add to `packages/ui/src/elements/` or `packages/ui/src/components/` depending on scope.

3. **Adding translations**: Use `<Trans>` macro in code, then run `pnpm --filter=@__APP_NAME__/locale lingui:extract`.

4. **Sharing code between packages**: Create utilities in appropriate package:
   - React components → `packages/ui`
   - React hooks → `packages/react-hooks`
   - Pure utilities → `packages/utils`
   - Types & Zod schemas → `packages/types`
   - Constants → `packages/constants`
   - Form options (default values + validators) → `packages/form-options`

5. **Testing**: Tests use Vitest and are colocated with source files (`*.test.ts` or `*.test.tsx`).

6. **Deployment**: Run `pnpm deploy` in `apps/web` to build and deploy to Cloudflare Workers.

## Important Notes

- **React 19**: Using latest React with overrides in root `package.json`
- **No `next` app**: This uses TanStack Start, not Next.js
- **File-based routing**: Don't manually edit `routeTree.gen.ts`
- **Workspace dependencies**: Use `workspace:*` protocol for internal packages
- **Prettier + Husky**: Code is auto-formatted on commit via lint-staged
- **Strict ESLint**: Max warnings set to 0; build fails on warnings
