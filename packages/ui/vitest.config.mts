import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { playwright } from "@vitest/browser-playwright";
import { fileURLToPath } from "node:url";
import path from "path";
import { defineConfig } from "vitest/config";

const linguiSwcPlugin = fileURLToPath(
  import.meta.resolve("@lingui/swc-plugin")
);

export default defineConfig({
  plugins: [
    tailwindcss(),
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
    passWithNoTests: true,
    projects: [
      {
        test: {
          name: "node",
          environment: "node",
          include: ["src/**/*.test.ts", "src/**/*.ssr.test.tsx"],
        },
      },
      {
        test: {
          name: "browser",
          include: ["src/**/*.test.tsx"],
          exclude: ["src/**/*.ssr.test.tsx"],
          setupFiles: ["./test-setup.ts"],
          browser: {
            enabled: true,
            headless: true,
            provider: playwright(),
            instances: [
              { browser: "chromium", viewport: { width: 1440, height: 1000 } },
            ],
          },
        },
      },
    ],
  },
});
