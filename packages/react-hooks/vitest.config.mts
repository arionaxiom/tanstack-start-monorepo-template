import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [
    react({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
  ],
  test: {
    environment: "jsdom",
    setupFiles: ["./test-setup.ts"],
    globals: true,
  },
});
