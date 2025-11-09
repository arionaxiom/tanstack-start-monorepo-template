# TanStack Start + Cloudflare Template

Opinionated GitHub template for building modern logistics or operations dashboards with TanStack Start, Cloudflare Workers, React 19, Tailwind CSS v4, and Lingui-powered internationalization. The workspace is a pnpm + Turborepo monorepo where every package is ready to be published under your own scope (`@__APP_NAME__/*`).

## Highlights

- **TanStack Start SSR app** running on Cloudflare Workers with Smart Placement, assets binding, and Vite 7 dev ergonomics.
- **React 19, Tailwind v4, Radix primitives, shadcn-style library** shipped from `packages/ui`.
- **i18n out of the box** via Lingui with English, Thai, and pseudo locales plus router-level locale awareness.
- **Shared packages** for hooks, utils, constants, assets, ESLint, Tailwind, and TS configs to keep features isolated but consistent.
- **Strict quality gates** (ESLint, Vitest, TS) enforced through pnpm scripts, lint-staged, and Husky.

## Requirements

- Node.js **>= 22** (aligns with Cloudflare Workers runtime)
- pnpm **10.20+** (workspaces + overrides rely on this version)
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
   The repo ships with `.github/workflows/init.yml` (“Initialize from template”) that replaces every `__APP_NAME__` placeholder with your repo name on the first push to `main` (or whenever you manually run it via **Actions → Initialize from template → Run workflow**, optionally supplying `app_name`). If Actions are disabled, fall back to an editor/CLI multi-file replace to swap `__APP_NAME__` for your slug (e.g., `acme`).

4. **Start the dev server**  
   ```bash
   pnpm dev          # runs turbo dev across the repo
   pnpm dev --filter=web   # or just the TanStack Start app on :3000
   ```
   > **Known quirk:** the TanStack Start dev server occasionally fails the first time because Lingui’s extraction race leaves missing catalog files. Simply stop and rerun `pnpm dev`—subsequent runs work consistently.

5. **Commit hooks**  
   Husky’s pre-commit hook automatically formats staged files via Prettier. Linting, tests, and type checks are manual—see “Quality Checks”.

## Workspace Layout

```
apps/
  web/                  # TanStack Start app (Cloudflare Workers entry)
packages/
  assets/               # Static assets bundled via Wrangler assets binding
  constants/            # Shared constants
  eslint-config/        # Base + React ESLint configs
  fixtures/             # Sample data (seed/mocks)
  locale/               # Lingui config + locale catalogs
  node-fn/              # Worker-side helpers / server-only code
  react-hooks/          # Cross-app React hooks
  tailwind-config/      # Tailwind v4 shared config + shared CSS
  types/                # Shared TypeScript types
  typescript-config/    # Reusable tsconfig presets
  ui/                   # Design system components/elements/hooks/utils
  utils/                # Framework-agnostic utilities
```

## Core Scripts

| Location          | Script                | Purpose |
|-------------------|-----------------------|---------|
| root              | `pnpm dev`            | Run `turbo run dev` (all apps/packages) |
| root              | `pnpm build`          | Build everything via Turborepo |
| root              | `pnpm lint`           | Run ESLint with `--max-warnings 0` |
| root              | `pnpm check-types`    | Type-check every package |
| root              | `pnpm format`         | Format `ts/tsx/md` files with Prettier |
| apps/web          | `pnpm dev`            | Start TanStack Start (Vite) on port 3000 |
| apps/web          | `pnpm test`           | Run Vitest + RTL |
| apps/web          | `pnpm build`          | Build SSR bundle for Workers |
| apps/web          | `pnpm deploy`         | Build + deploy via Wrangler |
| packages/locale   | `pnpm lingui:extract` | Extract strings from app + UI packages |
| packages/locale   | `pnpm compile`        | Compile `.po` catalogs into runtime JS |

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
pnpm lint         # ESLint (fails on warnings)
pnpm check-types  # Typescript --noEmit across the monorepo
pnpm --filter=web test   # Vitest suite
pnpm format       # Prettier + Tailwind plugin formatting
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

## Troubleshooting

- **Dev server fails on first run**: The Lingui extraction step competes with TanStack Start boot. Just re-run `pnpm dev`—subsequent runs succeed because catalogs already exist.
- **Mismatched Node/pnpm versions**: Verify `node -v` ≥ 22 and `pnpm -v` ≥ 10.20. Project tooling relies on these versions (see `package.json` → `engines` & `packageManager`).
- **Route type errors**: Delete `apps/web/src/routeTree.gen.ts` and rerun `pnpm dev` to regenerate if route definitions drift from generated types.

## Utility Scripts

- `clear-node-modules.sh` removes every nested `node_modules` folder—handy if you switch Node versions or packages become corrupted.

---

You now have everything required to spin up a production-ready TanStack Start + Cloudflare stack. Swap in your own branding, replace the `__APP_NAME__` scope, add routes/components, and ship. Have fun building!
