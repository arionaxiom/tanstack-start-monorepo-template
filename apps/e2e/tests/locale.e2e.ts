import { expect } from "@playwright/test";

import { test } from "@/fixtures/app-test";

test("changes locale to Thai and preserves it after reload", async ({
  page,
  waitForHydration,
}) => {
  await page.goto("/");
  await waitForHydration();
  await page.getByTestId("locale-switcher-trigger").click();
  await page.getByRole("option", { name: "Thai" }).click();

  await expect(page.locator("html")).toHaveAttribute("lang", "th");
  await page.reload();
  await waitForHydration();
  await expect(page.locator("html")).toHaveAttribute("lang", "th");
});
