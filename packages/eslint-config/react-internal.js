import tanstackRouterPlugin from "@tanstack/eslint-plugin-router";
import pluginReactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";

import { config as baseConfig } from "./base.js";
import { eslintReactRecommended } from "./react-preset.js";
import noRawInternalNavigation from "./rules/no-raw-internal-navigation.js";
import requireTestidOnActionElements from "./rules/require-testid-on-action-elements.js";

const templatePlugin = {
  rules: {
    "no-raw-internal-navigation": noRawInternalNavigation,
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
    extends: [
      baseConfig,
      eslintReactRecommended,
      tanstackRouterPlugin.configs["flat/recommended"],
    ],
    rules: {
      "@tanstack/router/create-route-property-order": "error",
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
      "no-console": "error",
      "@eslint-react/no-children-only": "off",
      "@eslint-react/no-clone-element": "off",
    },
  },
  {
    name: "react-internal/template-plugin",
    plugins: {
      template: templatePlugin,
    },
    rules: {
      "template/no-raw-internal-navigation": "error",
      "template/require-testid-on-action-elements": "error",
    },
  },
]);
