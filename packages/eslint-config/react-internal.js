import { createRequire } from "node:module";

import js from "@eslint/js";
import eslintConfigPrettier from "eslint-config-prettier";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

import { config as baseConfig } from "./base.js";

const require = createRequire(import.meta.url);
const requireTestidOnActionElements = require("./rules/require-testid-on-action-elements.cjs");

const templatePlugin = {
  rules: {
    "require-testid-on-action-elements": requireTestidOnActionElements,
  },
};

/**
 * A custom ESLint configuration for libraries that use React.
 *
 * @type {import("eslint").Linter.Config[]}
 */
export const config = [
  ...baseConfig,
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  {
    settings: {
      react: {
        version: "19.2.4",
      },
    },
  },
  {
    languageOptions: {
      ...pluginReact.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
      "no-console": "error",
      "react/no-unescaped-entities": "off",
    },
  },
  {
    plugins: {
      template: templatePlugin,
    },
    rules: {
      "template/require-testid-on-action-elements": "error",
    },
  },
];
