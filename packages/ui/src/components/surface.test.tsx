import { describe, expect, it } from "vitest";

import { render } from "@__APP_NAME__/ui/test-utils";

import { Surface } from "./surface.js";

describe("Surface", () => {
  it("renders with default elevation", () => {
    const { container } = render(<Surface data-testid="s">hi</Surface>);
    expect(container.firstChild).toHaveClass("bg-background");
  });

  it("applies card elevation", () => {
    const { container } = render(
      <Surface elevation="card" bordered radius="lg">
        hi
      </Surface>
    );
    expect(container.firstChild).toHaveClass(
      "bg-card",
      "border",
      "border-border",
      "rounded-lg"
    );
  });

  it("renders as a custom element", () => {
    const { container } = render(<Surface as="section">x</Surface>);
    expect(container.querySelector("section")).not.toBeNull();
  });
});
