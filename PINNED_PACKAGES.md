# Pinned Packages

Packages intentionally held at a specific version due to known issues with newer releases. **Check this file before upgrading any package listed here.**

| Package             | Pinned  | Latest | Reason                                                      | Enforcement            |
| ------------------- | ------- | ------ | ----------------------------------------------------------- | ---------------------- |
| vitest              | 4.0.18  | 4.1.0  | 4.1.0 changes import.meta.glob behavior, breaks convex-test | pnpm.overrides         |
| @vitest/coverage-v8 | 4.0.18  | 4.1.0  | Must match vitest                                           | pnpm.overrides         |
| @vitest/runner      | 4.0.18  | 4.1.0  | Must match vitest                                           | pnpm.overrides         |
| recharts            | ^2.15.3 | 3.8.0  | v3 rewrote tooltip/legend props                             | Semver in package.json |

## Resolved pins

| Package              | Was pinned | Resolution                                                |
| -------------------- | ---------- | --------------------------------------------------------- |
| vite                 | 6.x        | Migrated to @vitejs/plugin-react-swc + @lingui/swc-plugin |
| @vitejs/plugin-react | 4.x        | Replaced with @vitejs/plugin-react-swc                    |

---

**Last reviewed**: 2026-03-27
