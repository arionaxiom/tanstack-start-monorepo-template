import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import turboPlugin from "eslint-plugin-turbo";
import tseslint from "typescript-eslint";

// ── Banned imports ──────────────────────────────────────────────────────────

const bannedPackages = [
  {
    name: "redux",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "@reduxjs/toolkit",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "mobx",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "mobx-react",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "mobx-react-lite",
    message:
      "Use TanStack Query + React Context + Zustand (FRONTEND_RULES.md client state)",
  },
  {
    name: "framer-motion",
    message:
      "Use Tailwind transitions + tw-animate-css (FRONTEND_RULES.md animation)",
  },
  {
    name: "motion",
    message:
      "Use Tailwind transitions + tw-animate-css (FRONTEND_RULES.md animation)",
  },
];

const bannedTestingLibrary = {
  name: "@testing-library/react",
  message:
    "Import from the package's own test-utils instead (see AGENTS.md testing conventions)",
};

const bannedRelativeParent = {
  group: ["../*"],
  message:
    "Relative parent imports (../) are banned. Use absolute imports (@__APP_NAME__/* or @/) instead. Same-directory (./) imports are allowed.",
};

// ── Cross-layer import restrictions ─────────────────────────────────────────
// Each package's eslint.config.mjs uses these to ban imports from higher layers.
// See AGENTS.md "Package Dependency Direction" for the full layer diagram.

const pkg = (name) => ({
  name: `@__APP_NAME__/${name}`,
  message: `Cross-layer import: @__APP_NAME__/${name} is above this package's layer (see AGENTS.md "Package Dependency Direction").`,
});

/** All @__APP_NAME__/* packages — used by L0 packages that can't import anything. */
const allPackages = [
  "types",
  "locale",
  "assets",
  "test-utils",
  "tailwind-config",
  "eslint-config",
  "typescript-config",
  "constants",
  "utils",
  "form-options",
  "react-hooks",
  "node-fn",
  "ui",
].map(pkg);

/** Packages above L1 */
const aboveL1 = ["form-options", "react-hooks", "node-fn", "ui"].map(pkg);

/** Packages above L2 */
const aboveL2 = ["react-hooks", "node-fn", "ui"].map(pkg);

/** Packages above L3 */
const aboveL3 = ["ui"].map(pkg);

export {
  allPackages,
  aboveL1,
  aboveL2,
  aboveL3,
  bannedRelativeParent,
};

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
    },
    rules: {
      "turbo/no-undeclared-env-vars": "warn",
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          args: "all",
          argsIgnorePattern: "^_",
          caughtErrors: "all",
          caughtErrorsIgnorePattern: "^_",
          destructuredArrayIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          ignoreRestSiblings: true,
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          paths: [...bannedPackages, bannedTestingLibrary],
          patterns: [bannedRelativeParent],
        },
      ],
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "JSXAttribute[name.name='className'][value.expression.type='TemplateLiteral']",
          message:
            "Use cn() from @__APP_NAME__/ui/utils to compose className — not template literals (FRONTEND_RULES.md theme tokens).",
        },
        {
          selector:
            "JSXAttribute[name.name='className'][value.expression.type='BinaryExpression']",
          message:
            "Use cn() from @__APP_NAME__/ui/utils to compose className — not string concatenation (FRONTEND_RULES.md theme tokens).",
        },
      ],
    },
  },
  {
    // Test-utils wrapper files and vitest setup files are the ONLY places
    // allowed to import from @testing-library/react directly.
    files: [
      "src/test-utils.tsx",
      "src/test-utils.ts",
      "src/react.tsx", // packages/test-utils/src/react.tsx
      "src/index.ts", // packages/test-utils/src/index.ts
      "test-setup.ts", // vitest setup files
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [...bannedPackages],
          // @testing-library/react intentionally NOT banned here.
          patterns: [bannedRelativeParent],
        },
      ],
    },
  },
  {
    // lingui.config.ts files import the root monorepo lingui.config via
    // a relative parent path. The root config is not a package, so there
    // is no absolute import for it.
    files: ["lingui.config.ts"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [...bannedPackages, bannedTestingLibrary],
          // ../* pattern intentionally NOT included here.
        },
      ],
    },
  },
  {
    ignores: [
      "dist/**",
      "**/_*/",
      "_*/",
      "**/.*/",
      ".*/",
      "jest.config.js",
      "coverage/",
      "**/coverage/",
      "babel.config.js",
      "worker-configuration.d.ts",
    ],
  },
];
