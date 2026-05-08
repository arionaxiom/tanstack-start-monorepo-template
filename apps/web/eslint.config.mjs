import { defineConfig } from "eslint/config";
import globals from "globals";

import { config as reactInternalConfig } from "@__APP_NAME__/eslint-config/react-internal";

/** @type {import("eslint").Linter.Config[]} */
export default defineConfig([
  {
    extends: [reactInternalConfig],
  },
  {
    // Node.js dev-time scripts (e.g., dev-with-warmup.mjs) — not part of
    // the app's browser/SSR runtime. They legitimately use process,
    // setTimeout, console, etc.
    name: "apps-web/scripts-node-globals",
    files: ["scripts/**/*.{mjs,js,ts}"],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
  },
]);
