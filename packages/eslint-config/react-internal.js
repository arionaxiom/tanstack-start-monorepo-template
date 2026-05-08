import { createRequire } from "node:module";
import { defineConfig } from "eslint/config";
import pluginReact from "eslint-plugin-react";
import pluginReactHooks from "eslint-plugin-react-hooks";
import globals from "globals";

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
export const config = defineConfig([
  {
    name: "react-internal/extends-base",
    extends: [baseConfig, pluginReact.configs.flat.recommended],
  },
  {
    name: "react-internal/react-settings",
    settings: {
      react: {
        version: "19.2.4",
      },
    },
  },
  {
    name: "react-internal/browser-globals",
    languageOptions: {
      globals: {
        ...globals.serviceworker,
        ...globals.browser,
      },
    },
  },
  {
    name: "react-internal/react-hooks",
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
    name: "react-internal/template-plugin",
    plugins: {
      template: templatePlugin,
    },
    rules: {
      "template/require-testid-on-action-elements": "error",
    },
  },
]);
