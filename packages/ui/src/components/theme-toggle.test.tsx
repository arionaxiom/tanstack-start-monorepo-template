import { beforeEach, describe, expect, it, vi } from "vitest";

import { render, screen, userEvent } from "@__APP_NAME__/ui/test-utils";

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
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      await screen.findByRole("button", { name: "Switch to dark theme" })
    );

    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches from the resolved dark theme to light", async () => {
    resolvedTheme = "dark";
    const user = userEvent.setup();
    render(<ThemeToggle />);

    await user.click(
      await screen.findByRole("button", { name: "Switch to light theme" })
    );

    expect(setTheme).toHaveBeenCalledWith("light");
  });
});
