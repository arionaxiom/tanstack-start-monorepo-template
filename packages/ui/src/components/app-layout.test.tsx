import { House } from "lucide-react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@__APP_NAME__/ui/elements/sidebar";
import { render } from "@__APP_NAME__/ui/test-utils";

import { APP_RIGHT_SIDEBAR_PANEL_ID, AppLayout } from "./app-layout.js";

const TestLink = ({
  to,
  ...props
}: React.ComponentProps<"a"> & { to: string }) => <a href={to} {...props} />;

describe("AppLayout", () => {
  it("defaults the desktop sidebar to expanded", async () => {
    const { container } = await render(
      <AppLayout
        LinkComponent={TestLink}
        menuItems={[
          { key: "dashboard", title: "Dashboard", url: "/", icon: House },
        ]}
      >
        <main>Content</main>
      </AppLayout>
    );

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();
    await expect
      .element(page.getByTestId("sidebar-link-dashboard"))
      .toBeInTheDocument();
  });

  it("uses an independent app-nav sidebar panel", async () => {
    const { container } = await render(
      <AppLayout
        LinkComponent={TestLink}
        menuItems={[
          { key: "dashboard", title: "Dashboard", url: "/", icon: House },
        ]}
      >
        <main>Content</main>
      </AppLayout>
    );

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="left"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();

    const sidebarTriggers = page.getByRole("button", {
      name: /toggle sidebar/i,
    });
    await sidebarTriggers.last().click();

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="left"][data-state="collapsed"]'
        )
      )
      .toBeInTheDocument();
  });

  it("can host a right sidebar that reserves desktop layout space", async () => {
    const { container } = await render(
      <AppLayout
        LinkComponent={TestLink}
        headerActions={
          <SidebarTrigger
            panelId={APP_RIGHT_SIDEBAR_PANEL_ID}
            aria-label="Toggle details panel"
          />
        }
        rightSidebar={
          <Sidebar panelId={APP_RIGHT_SIDEBAR_PANEL_ID} side="right">
            <SidebarContent>Details content</SidebarContent>
          </Sidebar>
        }
      >
        <section>Content</section>
      </AppLayout>
    );

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="right"][data-state="collapsed"]'
        )
      )
      .toBeInTheDocument();

    await page.getByRole("button", { name: "Toggle details panel" }).click();

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="right"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();
    await expect.element(page.getByText("Details content")).toBeInTheDocument();
  });
});
