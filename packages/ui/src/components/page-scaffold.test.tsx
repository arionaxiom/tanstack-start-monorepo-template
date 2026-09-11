import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

import { PageScaffold } from "./page-scaffold.js";

describe("PageScaffold", () => {
  it("renders header + content", async () => {
    await render(
      <PageScaffold title="Dashboard" description="Overview">
        <div data-testid="content">x</div>
      </PageScaffold>
    );
    await expect.element(page.getByText("Dashboard")).toBeVisible();
    await expect.element(page.getByTestId("content")).toBeVisible();
  });
});
