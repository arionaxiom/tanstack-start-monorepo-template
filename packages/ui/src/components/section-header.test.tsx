import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

import { SectionHeader } from "./section-header.js";

describe("SectionHeader", () => {
  it("renders title only", async () => {
    await render(<SectionHeader title="Dashboard" />);
    await expect
      .element(page.getByText("Dashboard"))
      .toHaveClass("text-headline");
  });

  it("renders kicker, description, and actions when given", async () => {
    await render(
      <SectionHeader
        kicker="STOCK · DASHBOARD"
        title="Stock"
        description="Inventory overview."
        actions={<button type="button">Edit</button>}
        size="page"
      />
    );
    await expect
      .element(page.getByText("STOCK · DASHBOARD"))
      .toHaveClass("text-kicker");
    await expect.element(page.getByText("Stock")).toHaveClass("text-display");
    await expect.element(page.getByText("Inventory overview.")).toBeVisible();
    await expect
      .element(page.getByRole("button", { name: "Edit" }))
      .toBeVisible();
  });
});
