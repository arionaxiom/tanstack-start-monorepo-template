import { expect } from "@playwright/test";

import { test } from "@/fixtures/app-test";

test("renders the application shell without horizontal overflow", async ({
  page,
  waitForHydration,
}) => {
  const response = await page.goto("/");

  expect(response?.ok()).toBe(true);
  await waitForHydration();
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

  const dimensions = await page.locator("html").evaluate((html) => ({
    clientWidth: html.clientWidth,
    scrollWidth: html.scrollWidth,
  }));
  expect(dimensions.scrollWidth).toBe(dimensions.clientWidth);
});

test("returns an exact healthy response from the liveness route", async ({
  page,
  waitForHydration,
}) => {
  const response = await page.goto("/healthz");

  expect(response?.status()).toBe(200);
  await waitForHydration();
  await expect(page.getByTestId("healthz")).toHaveText("ok");
});
