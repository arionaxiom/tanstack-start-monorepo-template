import { test } from "@/fixtures/app-test";

for (const theme of ["light", "dark"] as const) {
  test(`meets the WCAG A and AA automated baseline in ${theme} mode`, async ({
    assertNoAccessibilityViolations,
    page,
    waitForHydration,
  }) => {
    await page.addInitScript((selectedTheme) => {
      window.localStorage.setItem("__APP_NAME__-theme", selectedTheme);
    }, theme);
    await page.goto("/");
    await waitForHydration();
    await assertNoAccessibilityViolations();
  });
}
