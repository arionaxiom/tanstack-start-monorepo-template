import AxeBuilder from "@axe-core/playwright";
import { test as base, expect } from "@playwright/test";

interface AppFixtures {
  assertNoAccessibilityViolations: () => Promise<void>;
  browserErrors: void;
  waitForHydration: () => Promise<void>;
}

export const test = base.extend<AppFixtures>({
  browserErrors: [
    async ({ page }, use, testInfo) => {
      const errors: string[] = [];

      page.on("pageerror", (error) => errors.push(`pageerror: ${error.stack}`));
      page.on("console", (message) => {
        if (message.type() === "error") {
          errors.push(`console.error: ${message.text()}`);
        }
      });

      await use();

      if (errors.length > 0) {
        await testInfo.attach("browser-errors", {
          body: errors.join("\n\n"),
          contentType: "text/plain",
        });
      }
      expect(errors, "The browser emitted errors during the test").toEqual([]);
    },
    { auto: true },
  ],
  assertNoAccessibilityViolations: async ({ page }, use) => {
    await use(async () => {
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();

      const summary = results.violations.map((violation) => ({
        help: violation.help,
        id: violation.id,
        impact: violation.impact,
        targets: violation.nodes.map((node) => node.target.join(" ")),
      }));

      expect(summary, "Expected no WCAG A/AA accessibility violations").toEqual(
        []
      );
    });
  },
  waitForHydration: async ({ page }, use) => {
    await use(async () => {
      await expect(page.getByTestId("theme-toggle")).toBeEnabled();
    });
  },
});
