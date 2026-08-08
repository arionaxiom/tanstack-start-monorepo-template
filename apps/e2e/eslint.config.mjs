import { defineConfig } from "eslint/config";
import globals from "globals";

import { config as baseConfig } from "@__APP_NAME__/eslint-config/base";

export default defineConfig([
  {
    extends: [baseConfig],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
