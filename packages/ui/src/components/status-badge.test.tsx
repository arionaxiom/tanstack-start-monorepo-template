import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

import { StatusBadge } from "./status-badge.js";

describe("StatusBadge", () => {
  it("default variant", async () => {
    await render(<StatusBadge>open</StatusBadge>);
    await expect.element(page.getByText("open")).toHaveClass("text-foreground");
  });

  it("agent variant references --agent token", async () => {
    const { container } = await render(
      <StatusBadge variant="agent">running</StatusBadge>
    );
    const badge = container.querySelector<HTMLElement>(
      ":scope > *"
    ) as HTMLElement;
    expect(badge.className).toMatch(/text-agent-emphasis/);
  });
});
