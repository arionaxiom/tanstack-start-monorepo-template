import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.E2E_PORT ?? 3137);
const baseURL = process.env.E2E_BASE_URL ?? `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: "./tests",
  testMatch: "**/*.e2e.ts",
  outputDir: "./test-results",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: process.env.CI
    ? [["github"], ["html", { open: "never" }]]
    : [["list"], ["html", { open: "never" }]],
  use: {
    baseURL,
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium-desktop",
      use: {
        ...devices["Desktop Chrome"],
        viewport: { width: 1440, height: 1000 },
      },
    },
    {
      name: "chromium-mobile",
      use: {
        ...devices["Pixel 5"],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        command: `pnpm --filter=web exec vite dev --host 127.0.0.1 --port ${port}`,
        url: `${baseURL}/healthz`,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
        gracefulShutdown: {
          signal: "SIGTERM",
          timeout: 10_000,
        },
      },
});
