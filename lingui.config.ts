import { defineConfig } from "@lingui/cli";

export default defineConfig({
  locales: ["en", "th"],
  sourceLocale: "en",
  compileNamespace: "ts",
  fallbackLocales: {
    default: "en",
  },
  rootDir: ".",
  catalogs: [
    {
      path: "<rootDir>/packages/locale/locales/{locale}/messages",
      include: [
        "<rootDir>/packages/ui/src/",
        "<rootDir>/apps/web/src/",
        "<rootDir>/packages/types/src/",
        "<rootDir>/packages/constants/src/",
        "<rootDir>/packages/node-fn/src/",
      ],
    },
  ],
});
