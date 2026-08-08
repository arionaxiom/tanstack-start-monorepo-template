# Web application

TanStack Start application deployed to Cloudflare Workers. Repository-wide setup, architecture, and quality commands live in the [root README](../../README.md).

From the repository root:

```bash
pnpm --filter=web dev
pnpm --filter=web build
pnpm --filter=web check-types
pnpm --filter=web lint
pnpm --filter=web test
```

Routes live in `src/routes`; do not edit `src/routeTree.gen.ts` manually. Shared UI belongs in `packages/ui`, and Worker-served static files belong in `packages/assets/src`.
