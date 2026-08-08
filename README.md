# TanStack Start + Cloudflare Template

Opinionated GitHub template for building modern logistics or operations dashboards with TanStack Start, Cloudflare Workers, React 19, Tailwind CSS v4, and Lingui-powered internationalization. The workspace is a pnpm + Turborepo monorepo where every package is ready to be published under your own scope (`@__APP_NAME__/*`).

## AI Agent Guidance

This template is designed to be worked on collaboratively with AI agents. Agent guidance is split into:

- [`AGENTS.md`](./AGENTS.md) — shared baseline for every agent
- [`CLAUDE.md`](./CLAUDE.md) — Claude-specific additions
- [`CODEX.md`](./CODEX.md) — Codex-specific additions
- [`FRONTEND_RULES.md`](./FRONTEND_RULES.md) — frontend conventions
- [`PINNED_PACKAGES.md`](./PINNED_PACKAGES.md) — toolchain compatibility notes

## Highlights

- **TanStack Start SSR app** running on Cloudflare Workers with Smart Placement, assets binding, and Vite dev ergonomics.
- **React 19, Tailwind v4, Base UI primitives, shadcn-style library** shipped from `packages/ui`.
- **i18n out of the box** via Lingui with English, Thai, and pseudo locales plus router-level locale awareness.
- **Shared packages** for hooks, utils, constants, assets, ESLint, Tailwind, and TS configs to keep features isolated but consistent.
- **Strict quality gates** (Prettier, ESLint, Vitest, TypeScript, ESM verification, and production builds) enforced in CI.

## Requirements

- Node.js **>= 24**
- pnpm **11.20+** (Corepack reads the exact version from `package.json`)
- Wrangler CLI (optional until you deploy): `npm i -g wrangler`
- Cloudflare account with Workers enabled for deployment

## Quick Start

1. **Use this template**  
   On GitHub, click “Use this template” → “Create a new repository”, then clone your repo locally.

2. **Install dependencies**

   ```bash
   pnpm install
   ```

3. **Rename the workspace scope**  
   The repo ships with `.github/workflows/init.yml` (“Initialize from template”) that replaces every `__APP_NAME__` placeholder with your repo name on the first push to `main` (or whenever you manually run it via **Actions → Initialize from template → Run workflow**, optionally supplying `app_name`). You can run the same tested initializer locally with `pnpm template:init -- --name acme`.

4. **Start the dev server**

   ```bash
   pnpm dev          # runs turbo dev across the repo
   pnpm dev --filter=web   # or just the TanStack Start app on :3000
   ```

   The web app's dev wrapper probes `/healthz` and automatically retries the rare TanStack Start + Cloudflare + Lingui cold-start race.

5. **Commit hooks**  
   Husky’s pre-commit hook automatically formats staged files via Prettier. Linting, tests, and type checks are manual—see “Quality Checks”.

## Workspace Layout

```
apps/
  web/                  # TanStack Start app (Cloudflare Workers entry)
packages/
  assets/               # Static assets bundled via Wrangler assets binding
  constants/            # Shared constants
  eslint-config/        # Base + React ESLint configs (with custom rules)
  form-options/         # TanStack Form options (Zod schemas + default values)
  locale/               # Lingui config + locale catalogs
  node-fn/              # Worker-side helpers / server-only code
  react-hooks/          # Cross-app React hooks
  tailwind-config/      # Tailwind v4 shared config + shared CSS
  test-utils/           # Shared TestProviders wrapper + testing-library re-exports
  types/                # Shared TypeScript types
  typescript-config/    # Reusable tsconfig presets
  ui/                   # Design system components/elements/hooks/utils (Base UI)
  utils/                # Framework-agnostic utilities
```

## Core Scripts

| Location        | Script                | Purpose                                  |
| --------------- | --------------------- | ---------------------------------------- |
| root            | `pnpm dev`            | Run `turbo run dev` (all apps/packages)  |
| root            | `pnpm build`          | Build everything via Turborepo           |
| root            | `pnpm lint`           | Run ESLint with `--max-warnings 0`       |
| root            | `pnpm check-types`    | Type-check every package                 |
| root            | `pnpm format`         | Format the repository with Prettier      |
| root            | `pnpm format:check`   | Verify formatting without writing        |
| root            | `pnpm verify`         | Run every CI quality gate                |
| root            | `pnpm template:init`  | Replace template scope placeholders      |
| apps/web        | `pnpm dev`            | Start TanStack Start (Vite) on port 3000 |
| apps/web        | `pnpm build`          | Build SSR bundle for Workers             |
| apps/web        | `pnpm deploy`         | Build + deploy via Wrangler              |
| packages/locale | `pnpm lingui:extract` | Extract strings from app + UI packages   |
| packages/locale | `pnpm compile`        | Compile `.po` catalogs into runtime JS   |

Run any script from the repo root with `pnpm --filter=<package>` when you need a package-specific command (e.g., `pnpm --filter=@__APP_NAME__/ui build`).

## Development Workflow

- **Routing**: Add new routes under `apps/web/src/routes`. TanStack Router regenerates `routeTree.gen.ts`; never edit it manually.
- **UI components**: Build reusable primitives in `packages/ui/src/elements`, composite app components in `packages/ui/src/components`, and share hooks via `packages/ui/src/hooks`.
- **Shared logic**: Prefer `packages/utils` for framework-agnostic helpers, `packages/react-hooks` for hook-only utilities, and `packages/types` for TypeScript contracts.
- **Assets & constants**: Keep Worker-served assets inside `packages/assets/src` so Wrangler’s `ASSETS` binding can serve them. Store configuration flags or enumerations in `packages/constants`.

## Internationalization (Lingui)

1. Wrap user-facing strings with the `<Trans>` macro or `t` helper in your UI/app code.
2. Extract new keys:
   ```bash
   pnpm --filter=@__APP_NAME__/locale lingui:extract
   ```
3. Translate the generated `.po` files in `packages/locale/locales/{en|th|pseudo}.po`.
4. Compile for runtime usage:
   ```bash
   pnpm --filter=@__APP_NAME__/locale compile
   ```
   Lingui is wired into the router, so locales propagate through TanStack Start loaders and components automatically once catalogs are compiled.

## Quality Checks

```bash
pnpm verify # format check, lint, TypeScript 7, tests, and production build
```

These are the checks you should run before every push. Automation assumes they return clean results.

## Deployment (Cloudflare Workers)

1. Configure Wrangler: update `apps/web/wrangler.jsonc` (name, bindings, env vars).
2. Authenticate once: `wrangler login` or `wrangler login --scopes` as needed.
3. Build and deploy:
   ```bash
   cd apps/web
   pnpm deploy            # wraps vite build + wrangler deploy
   ```
   Use `pnpm cf-typegen` anytime you change bindings so TypeScript has up-to-date Worker environment types.

## Toolchain Compatibility

All dependencies track their latest stable releases. React and Vitest families use exact central overrides only to keep one resolution across the workspace. TypeScript 7 is the project compiler; ESLint receives the TypeScript 6 compatibility API required by `typescript-eslint`. See [`PINNED_PACKAGES.md`](./PINNED_PACKAGES.md) for details.

## Troubleshooting

- **Dev server fails repeatedly**: Run `pnpm --filter=web dev:raw` to bypass the warmup wrapper and inspect the first Vite failure directly.
- **Mismatched Node/pnpm versions**: Verify `node -v` ≥ 24 and `pnpm -v` ≥ 11.20. Project tooling relies on `package.json` → `engines` and `packageManager`.
- **Route type errors**: Delete `apps/web/src/routeTree.gen.ts` and rerun `pnpm dev` to regenerate if route definitions drift from generated types.

## Utility Scripts

- `pnpm clean:node-modules` safely removes nested `node_modules` directories with a cross-platform ESM script.

---

You now have everything required to spin up a production-ready TanStack Start + Cloudflare stack. Swap in your own branding, replace the `__APP_NAME__` scope, add routes/components, and ship. Have fun building!
