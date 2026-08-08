import { expect } from "@playwright/test";

import { test } from "@/fixtures/app-test";

test("switches theme and persists the explicit preference", async ({
  page,
  waitForHydration,
}) => {
  await page.goto("/");
  await waitForHydration();
  await page.evaluate(() => {
    window.localStorage.setItem("__APP_NAME__-theme", "light");
  });
  await page.reload();
  await waitForHydration();

  await expect(page.locator("html")).not.toHaveClass(/dark/);
  await page.getByTestId("theme-toggle").click();
  await expect(page.locator("html")).toHaveClass(/dark/);

  await page.reload();
  await waitForHydration();
  await expect(page.locator("html")).toHaveClass(/dark/);
});
