import { defineConfig } from "eslint/config";
import { config as reactInternalConfig } from "@__APP_NAME__/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  {
    extends: [reactInternalConfig],
  },
  {
    ignores: ["src/elements/**"],
  },
]);
