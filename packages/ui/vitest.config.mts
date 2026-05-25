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
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: {
      "@__APP_NAME__/ui/test-utils": path.resolve(
        import.meta.dirname,
        "./src/test-utils.tsx"
      ),
      "@__APP_NAME__/ui/elements": path.resolve(
        import.meta.dirname,
        "./src/elements"
      ),
      "@__APP_NAME__/ui/components": path.resolve(
        import.meta.dirname,
        "./src/components"
      ),
      "@__APP_NAME__/ui/utils": path.resolve(
        import.meta.dirname,
        "./src/utils"
      ),
      "@__APP_NAME__/utils": path.resolve(import.meta.dirname, "../utils/src"),
      "@__APP_NAME__/constants": path.resolve(
        import.meta.dirname,
        "../constants/src"
      ),
      "@__APP_NAME__/types": path.resolve(import.meta.dirname, "../types/src"),
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
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
