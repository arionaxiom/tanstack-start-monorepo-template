---
name: template-toolchain
description: Use when upgrading dependencies or changing Node, pnpm, TypeScript native compilation, ESLint, Vitest, build tools or CI configuration.
---

# Toolchain Compatibility

No dependency is intentionally held below its latest stable release.

React, React DOM, their type packages, Vitest and its coverage provider use exact
`pnpm-workspace.yaml` overrides so the monorepo resolves one version of each.
Those overrides track the latest stable releases; they are consistency locks,
not downgrade pins.

## TypeScript 7 and ESLint

TypeScript 7's Go compiler is installed as `@typescript/native` through the npm alias
`npm:typescript@7.0.2`. Its `tsc` executable is the compiler used by every
workspace type-check.

TypeScript 7.0 does not expose the compiler API required by
`typescript-eslint`. Following the TypeScript team's supported side-by-side
configuration, the `typescript` dependency name points to the latest
`@typescript/typescript6` compatibility package. This supplies the TypeScript 6
API to ESLint and the `tsc6` binary without replacing TypeScript 7's `tsc`.

When TypeScript 7.1 and `typescript-eslint` expose compatible APIs, remove the
compatibility alias and let both compilation and linting use TypeScript 7
directly.

Last reviewed: 2026-10-19.

## Upgrade workflow

1. Read every workspace manifest, `pnpm-workspace.yaml`, the lockfile,
   `.node-version` and CI workflows. Query the live npm registry and current
   official migration guides before choosing versions. Keep npm aliases intact.
2. Update direct dependency ranges, peer requirements and consistency overrides
   together. Use the latest stable release; avoid nightly or prerelease tags.
   DefinitelyTyped tags can target old compiler lines: select the newest stable
   Node types supported by the project compiler instead of downgrading them.
3. Use the exact pnpm version in root `packageManager` and the Node version in
   `.node-version`. Keep CI aligned with that runtime. Refresh transitive
   dependencies within their upstream constraints; do not force unrelated majors.
4. Preserve pnpm strict isolation and its release-age policy. If a selected
   stable package is too new, verify its published metadata and add only that
   exact package/version to `minimumReleaseAgeExclude`. Remove obsolete entries.
5. Run `pnpm clean:node-modules`, then `pnpm install --frozen-lockfile` to
   exercise a clean isolated install. Resolve warnings instead of suppressing them.
6. Confirm `pnpm exec tsc --version` and all workspace type checks use the native
   compiler. Run `pnpm verify:all`, which includes the desktop/mobile browser
   suite, and check `pnpm outdated -r` against the live registry.

Vitest 5 includes its runner internally. Do not restore an unused direct
`@vitest/runner` dependency or force Vitest 4 internals into its dependency graph.

Component tests use Vitest Browser Mode with `@vitest/browser-playwright`,
`vitest-browser-react` and native `expect.element` assertions. Keep those
packages aligned with Vitest and install Chromium before verification.

## Vitest 5 browser interceptor

`@vitest/mocker` 5.0.5 attaches `configureServer` only when
`registerWebSocketEvents` is enabled, so Vite 8.3 no longer warns about a
server hook on Browser Mode's environment plugin. The exact-version pnpm patch
that did the same for 5.0.0 was removed in that upgrade. If the warning
returns, fix it upstream or with a new exact-version patch; do not suppress
Vite diagnostics or downgrade Vite.

## Vite 8.3.4 server sourcemap

`vite@8.3.4` has an exact-version pnpm patch for `vite:css-post`. When its
`renderChunk` hook strips CSS imports it decides whether to return a sourcemap
from the top-level `config.build.sourcemap`, while every other hook reads the
current environment's setting. `@cloudflare/vite-plugin` enables sourcemaps on
the Worker environment only, so the server chunk came back without a map and
Rolldown warned `SOURCEMAP_BROKEN`. The patch reads
`this.environment.config.build.sourcemap` instead.

The open upstream report, vitejs/vite#23809, blames the `transform` hook's
dev-server branch; that branch does not run in a build. Remove the patch when a
Vite release reads the environment's setting there, then confirm `pnpm build`
prints no `SOURCEMAP_BROKEN` and the server `router-*.js.map` has mappings. Do
not silence the check with `rolldownOptions.checks.sourcemapBroken`.

## Playwright web server

The e2e web server runs Vite directly from `apps/web`, not through
`pnpm --filter=web exec`. Graceful shutdown signals the server, and pnpm 12.14
reports a child ended by a signal as `ERR_PNPM_RECURSIVE_EXEC_FIRST_FAIL`;
earlier pnpm exited 143 without saying so.

The internal `packages/eslint-config` package owns lint configuration and custom
rules. Update rule documentation and messages here or in the relevant skill when
changing enforcement.

The TypeScript team documents the supported aliases in its
[TypeScript 7 release announcement](https://devblogs.microsoft.com/typescript/announcing-typescript-7-0/).
