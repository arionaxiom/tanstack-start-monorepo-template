import { describe, expect, it } from "vitest";

import { render } from "@__APP_NAME__/ui/test-utils";

import { Surface } from "./surface.js";

describe("Surface", () => {
  it("renders with default elevation", async () => {
    const { container } = await render(<Surface data-testid="s">hi</Surface>);
    await expect
      .element(container.querySelector<HTMLElement>(":scope > *"))
      .toHaveClass("bg-background");
  });

  it("applies card elevation", async () => {
    const { container } = await render(
      <Surface elevation="card" bordered radius="lg">
        hi
      </Surface>
    );
    await expect
      .element(container.querySelector<HTMLElement>(":scope > *"))
      .toHaveClass("bg-card", "border", "border-border", "rounded-lg");
  });

  it("renders as a custom element", async () => {
    const { container } = await render(<Surface as="section">x</Surface>);
    expect(container.querySelector<HTMLElement>("section")).not.toBeNull();
  });

  it("keeps in-page elevated surfaces border-based", async () => {
    const { container } = await render(
      <Surface elevation="elevated">x</Surface>
    );

    expect(container.querySelector<HTMLElement>(":scope > *")).toHaveClass(
      "bg-elevated",
      "border",
      "border-border"
    );
    await expect
      .element(container.querySelector<HTMLElement>(":scope > *"))
      .not.toHaveClass("shadow-popover");
  });

  it("reserves shadow elevation for floating surfaces", async () => {
    const { container } = await render(
      <Surface elevation="floating">x</Surface>
    );

    await expect
      .element(container.querySelector<HTMLElement>(":scope > *"))
      .toHaveClass("bg-popover", "text-popover-foreground", "shadow-popover");
  });
});
