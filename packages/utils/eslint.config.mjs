import { defineConfig } from "eslint/config";
import { config as baseConfig } from "@__APP_NAME__/eslint-config/base";

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  {
    extends: [baseConfig],
  },
]);
