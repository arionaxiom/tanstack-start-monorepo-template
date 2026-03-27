import path from "path";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [viteReact()],
  resolve: {
    extensions: [".tsx", ".ts", ".jsx", ".js"],
    alias: {
      "@__APP_NAME__/ui/elements": path.resolve(__dirname, "./src/elements"),
      "@__APP_NAME__/ui/components": path.resolve(
        __dirname,
        "./src/components"
      ),
      "@__APP_NAME__/ui/utils": path.resolve(__dirname, "./src/utils"),
      "@__APP_NAME__/utils": path.resolve(__dirname, "../utils/src"),
      "@__APP_NAME__/constants": path.resolve(__dirname, "../constants/src"),
      "@__APP_NAME__/types": path.resolve(__dirname, "../types/src"),
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
    include: ["src/**/*.test.{ts,tsx}"],
    passWithNoTests: true,
  },
});
