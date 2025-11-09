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
- **Forms**: TanStack Form + React Hook Form
- **Testing**: Vitest + React Testing Library
- **Monorepo**: Turborepo with pnpm workspaces
- **Package Manager**: pnpm (v10.20.0+)
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
  - `turbo/no-undeclared-env-vars: warn`
  - Unused vars prefixed with `_` are ignored

### TypeScript Configuration

- **Target**: ES2022
- **Module**: ESNext with bundler resolution
- **Strict mode**: Enabled with additional checks (noUnusedLocals, noUnusedParameters)
- **Path aliases**: Configured per package via tsconfig.json `paths`

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
   - Types → `packages/types`
   - Constants → `packages/constants`

5. **Testing**: Tests use Vitest and are colocated with source files (`*.test.ts` or `*.test.tsx`).

6. **Deployment**: Run `pnpm deploy` in `apps/web` to build and deploy to Cloudflare Workers.

## Important Notes

- **React 19**: Using latest React with overrides in root `package.json`
- **No `next` app**: This uses TanStack Start, not Next.js
- **File-based routing**: Don't manually edit `routeTree.gen.ts`
- **Workspace dependencies**: Use `workspace:*` protocol for internal packages
- **Prettier + Husky**: Code is auto-formatted on commit via lint-staged
- **Strict ESLint**: Max warnings set to 0; build fails on warnings
