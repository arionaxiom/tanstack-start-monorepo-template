import { describe, expect, it } from "vitest";

import { render, screen } from "@__APP_NAME__/ui/test-utils";

import { SectionHeader } from "./section-header.js";

describe("SectionHeader", () => {
  it("renders title only", () => {
    render(<SectionHeader title="Dashboard" />);
    expect(screen.getByText("Dashboard")).toHaveClass("text-headline");
  });

  it("renders kicker, description, and actions when given", () => {
    render(
      <SectionHeader
        kicker="STOCK · DASHBOARD"
        title="Stock"
        description="Inventory overview."
        actions={<button type="button">Edit</button>}
        size="page"
      />
    );
    expect(screen.getByText("STOCK · DASHBOARD")).toHaveClass("text-kicker");
    expect(screen.getByText("Stock")).toHaveClass("text-display");
    expect(screen.getByText("Inventory overview.")).toBeVisible();
    expect(screen.getByRole("button", { name: "Edit" })).toBeVisible();
  });
});
