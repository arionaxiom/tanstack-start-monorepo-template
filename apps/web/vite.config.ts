import { cloudflare } from "@cloudflare/vite-plugin";
import { lingui } from "@lingui/vite-plugin";
import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

const config = defineConfig({
  publicDir: "../../packages/assets/src/",
  build: {
    target: "esnext",
  },
  resolve: {
    tsconfigPaths: true,
  },
  plugins: [
    tailwindcss(),
    cloudflare({ viteEnvironment: { name: "ssr" } }),
    tanstackStart(),
    viteReact({
      plugins: [["@lingui/swc-plugin", {}]],
    }),
    lingui(),
  ],
});

export default config;
