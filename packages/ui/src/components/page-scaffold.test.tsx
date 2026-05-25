import { describe, expect, it } from "vitest";

import { render, screen } from "@__APP_NAME__/ui/test-utils";

import { PageScaffold } from "./page-scaffold.js";

describe("PageScaffold", () => {
  it("renders header + content", () => {
    render(
      <PageScaffold title="Dashboard" description="Overview">
        <div data-testid="content">x</div>
      </PageScaffold>
    );
    expect(screen.getByText("Dashboard")).toBeVisible();
    expect(screen.getByTestId("content")).toBeVisible();
  });
});
