import { defineConfig } from "@lingui/cli";

export default defineConfig({
  locales: ["en", "th", "pseudo"],
  pseudoLocale: "pseudo",
  sourceLocale: "en",
  fallbackLocales: {
    default: "en",
  },
  rootDir: ".",
  catalogs: [
    {
      path: "<rootDir>/packages/locale/locales/{locale}/messages",
      include: ["<rootDir>/packages/ui/src/", "<rootDir>/apps/web/src/"],
    },
  ],
});
