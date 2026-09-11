import { afterEach, describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { renderHook } from "@__APP_NAME__/ui/test-utils";

import { useIsMobile } from "./use-mobile";

afterEach(async () => {
  await page.viewport(1440, 1000);
});

describe("useIsMobile in the browser", () => {
  it("responds to real viewport changes", async () => {
    const { result } = await renderHook(useIsMobile);
    expect(result.current).toBe(false);

    await page.viewport(390, 844);
    await expect.poll(() => result.current).toBe(true);

    await page.viewport(1440, 1000);
    await expect.poll(() => result.current).toBe(false);
  });
});
