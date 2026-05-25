import { House } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  Sidebar,
  SidebarContent,
  SidebarTrigger,
} from "@__APP_NAME__/ui/elements/sidebar";
import { render, screen, userEvent } from "@__APP_NAME__/ui/test-utils";

import { APP_RIGHT_SIDEBAR_PANEL_ID, AppLayout } from "./app-layout.js";

describe("AppLayout", () => {
  beforeEach(() => {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it("defaults the desktop sidebar to expanded", () => {
    const { container } = render(
      <AppLayout
        menuItems={[
          { key: "dashboard", title: "Dashboard", url: "/", icon: House },
        ]}
      >
        <main>Content</main>
      </AppLayout>
    );

    expect(
      container.querySelector('[data-slot="sidebar"][data-state="expanded"]')
    ).toBeInTheDocument();
    expect(screen.getByTestId("sidebar-link-dashboard")).toBeInTheDocument();
  });

  it("uses an independent app-nav sidebar panel", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AppLayout
        menuItems={[
          { key: "dashboard", title: "Dashboard", url: "/", icon: House },
        ]}
      >
        <main>Content</main>
      </AppLayout>
    );

    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="left"][data-state="expanded"]'
      )
    ).toBeInTheDocument();

    const sidebarTriggers = screen.getAllByRole("button", {
      name: /toggle sidebar/i,
    });
    await user.click(sidebarTriggers.at(-1)!);

    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="left"][data-state="collapsed"]'
      )
    ).toBeInTheDocument();
  });

  it("can host a right sidebar that reserves desktop layout space", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AppLayout
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

    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="right"][data-state="collapsed"]'
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "Toggle details panel" })
    );

    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="right"][data-state="expanded"]'
      )
    ).toBeInTheDocument();
    expect(screen.getByText("Details content")).toBeInTheDocument();
  });
});
