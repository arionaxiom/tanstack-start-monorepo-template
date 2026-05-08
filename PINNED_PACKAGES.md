# Pinned Packages

Packages intentionally held at a specific version due to known issues with newer releases. **Check this file before upgrading any package listed here.**

| Package                     | Pinned           | Latest | Reason                                                                                                                                                                                                                                   | Enforcement    |
| --------------------------- | ---------------- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| vitest                      | 4.0.18           | 4.1.0  | 4.1.0 changes import.meta.glob behavior, breaks convex-test                                                                                                                                                                              | pnpm.overrides |
| @vitest/coverage-v8         | 4.0.18           | 4.1.0  | Must match vitest                                                                                                                                                                                                                        | pnpm.overrides |
| @vitest/runner              | 4.0.18           | 4.1.0  | Must match vitest                                                                                                                                                                                                                        | pnpm.overrides |
| @vitest/spy                 | 4.0.18           | 4.1.0  | Must match vitest                                                                                                                                                                                                                        | pnpm.overrides |
| react                       | 19.2.0           | 19.2.4 | Pinned for future Expo / React Native compatibility                                                                                                                                                                                      | pnpm.overrides |
| react-dom                   | 19.2.0           | 19.2.4 | Must match react                                                                                                                                                                                                                         | pnpm.overrides |
| typescript                  | ~5.9.2           | 5.9.3  | Dedupe @lingui/react — split resolution created dual React context (see below)                                                                                                                                                           | pnpm.overrides |
| @lingui/\* (full ecosystem) | ^5.9.4 / ^5.11.0 | 6.0.x  | Prevent partial 6.0 migration — pin the whole ecosystem (`@lingui/core`, `@lingui/react`, `@lingui/cli`, `@lingui/macro`, `@lingui/loader`, `@lingui/vite-plugin`, `@lingui/swc-plugin`) coherently at 5.x until v6 migration is planned | pnpm.overrides |

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

**Last reviewed**: 2026-05-08 (added typescript `~5.9.2`, removed recharts pin, added @lingui ecosystem pins after P2 dep bump)
