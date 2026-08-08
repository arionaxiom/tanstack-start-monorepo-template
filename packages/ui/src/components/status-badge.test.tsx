import { describe, expect, it } from "vitest";

import { render, screen } from "@__APP_NAME__/ui/test-utils";

import { StatusBadge } from "./status-badge.js";

describe("StatusBadge", () => {
  it("default variant", () => {
    render(<StatusBadge>open</StatusBadge>);
    expect(screen.getByText("open")).toHaveClass("text-foreground");
  });

  it("agent variant references --agent token", () => {
    const { container } = render(
      <StatusBadge variant="agent">running</StatusBadge>
    );
    const badge = container.firstChild as HTMLElement;
    expect(badge.className).toMatch(/text-agent-emphasis/);
  });
});
