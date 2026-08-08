# Toolchain Compatibility

No dependency is intentionally held below its latest stable release.

React, React DOM, their type packages, and Vitest's coupled packages use exact
`pnpm-workspace.yaml` overrides so the monorepo resolves one version of each.
Those overrides track the latest stable releases; they are consistency locks,
not downgrade pins.

## TypeScript 7 and ESLint

TypeScript 7 is installed as `@typescript/native` through the npm alias
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

Last reviewed: 2026-08-08.
