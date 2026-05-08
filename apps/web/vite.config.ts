import { cloudflare } from "@cloudflare/vite-plugin";
import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { createRequire } from "node:module";
import { defineConfig } from "vite";

const require = createRequire(import.meta.url);

const config = defineConfig({
  publicDir: "../../packages/assets/src/",
  build: {
    target: "esnext",
  },
  resolve: {
    tsconfigPaths: true,
  },
  // Pre-bundle Lingui at startup. Without this, Vite discovers @lingui/core
  // and @lingui/react mid-request the first time SSR renders a route that
  // imports them, which triggers a known dep-optimization race on the
  // TanStack Start + Cloudflare Workers runtime — the SSR worker holds a
  // stale module reference and serves 500s until restarted. Listing them
  // here means Vite optimizes them upfront, eliminating the race for the
  // common cold-start path. The dev-with-warmup.mjs wrapper remains as a
  // backstop for any edge case this misses.
  optimizeDeps: {
    include: ["@lingui/core", "@lingui/react", "@lingui/react/macro"],
  },
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact({
      plugins: [[require.resolve("@lingui/swc-plugin"), {}]],
    }),
    lingui(),
  ],
});

export default config;
