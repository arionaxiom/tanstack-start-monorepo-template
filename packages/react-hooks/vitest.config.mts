import { createRequire } from "node:module";
import path from "path";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

const require = createRequire(import.meta.url);

export default defineConfig({
  plugins: [
    viteReact({
      plugins: [[require.resolve("@lingui/swc-plugin"), {}]],
    }),
  ],
  resolve: {
    alias: {
      "@__APP_NAME__/locale/locales/en": path.resolve(
        __dirname,
        "../locale/locales/en/messages.js"
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    globals: true,
  },
});
