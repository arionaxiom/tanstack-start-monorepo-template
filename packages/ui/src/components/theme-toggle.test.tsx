import { beforeEach, describe, expect, it, vi } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

import { ThemeToggle } from "./theme-toggle.js";

const setTheme = vi.fn();
let resolvedTheme = "light";

vi.mock("next-themes", () => ({
  useTheme: () => ({ resolvedTheme, setTheme }),
}));

describe("ThemeToggle", () => {
  beforeEach(() => {
    resolvedTheme = "light";
    setTheme.mockClear();
  });

  it("switches from the resolved light theme to dark", async () => {
    await render(<ThemeToggle />);

    await page.getByRole("button", { name: "Switch to dark theme" }).click();

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from the resolved dark theme to light", async () => {
    resolvedTheme = "dark";
    await render(<ThemeToggle />);

    await page.getByRole("button", { name: "Switch to light theme" }).click();

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
