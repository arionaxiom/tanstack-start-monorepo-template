import { defineConfig } from "eslint/config";

import { config as reactInternalConfig } from "@__APP_NAME__/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  {
    extends: [reactInternalConfig],
  },
  {
    name: "ui/generated-elements-react-rule-relaxations",
    files: ["src/elements/**/*.{ts,tsx}"],
    rules: {
      "@eslint-react/dom-no-dangerously-set-innerhtml": "off",
      "@eslint-react/no-array-index-key": "off",
      "@eslint-react/no-context-provider": "off",
      "@eslint-react/no-nested-component-definitions": "off",
      "@eslint-react/no-use-context": "off",
      "@eslint-react/purity": "off",
      "@eslint-react/set-state-in-effect": "off",
      "react-hooks/set-state-in-effect": "off",
    },
  },
]);
