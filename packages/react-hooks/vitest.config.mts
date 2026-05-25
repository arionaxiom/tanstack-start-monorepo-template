import viteReact from "@vitejs/plugin-react-swc";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vitest/config";

const linguiSwcPlugin = fileURLToPath(
  import.meta.resolve("@lingui/swc-plugin")
);

export default defineConfig({
  plugins: [
    viteReact({
      plugins: [[linguiSwcPlugin, {}]],
    }),
  ],
  resolve: {
    alias: {
      "@__APP_NAME__/locale/locales/en": path.resolve(
        import.meta.dirname,
        "../locale/locales/en/messages.ts"
      ),
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    globals: true,
  },
});
