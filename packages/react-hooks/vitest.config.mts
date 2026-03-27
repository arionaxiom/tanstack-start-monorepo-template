import path from "path";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteReact()],
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
