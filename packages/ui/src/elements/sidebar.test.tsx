import { beforeEach, describe, expect, it } from "vitest";
import { page, userEvent } from "vitest/browser";

import { Button } from "@__APP_NAME__/ui/elements/button";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@__APP_NAME__/ui/elements/sidebar";
import { render } from "@__APP_NAME__/ui/test-utils";

function PanelStateButton({ panelId }: { panelId: string }) {
  const { open, setOpen } = useSidebar(panelId);
  return (
    <Button type="button" onClick={() => setOpen((value) => !value)}>
      {panelId}:{open ? "open" : "closed"}
    </Button>
  );
}

describe("Sidebar keyed panels", () => {
  beforeEach(() => {
    document.cookie = "sidebar_state=; Max-Age=0; path=/";
    window.localStorage.clear();
  });

  it("keeps existing default sidebar behavior", async () => {
    const { container } = await render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>Default sidebar</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();
  });

  it("keeps keyed left and right panels independent", async () => {
    const { container } = await render(
      <SidebarProvider
        panels={{
          "app-nav": {
            defaultOpen: true,
            cookieName: "sidebar_state",
            keyboardShortcut: "b",
          },
          "details-panel": {
            defaultOpen: false,
            cookieName: null,
            keyboardShortcut: null,
          },
        }}
      >
        <Sidebar panelId="app-nav" side="left">
          <SidebarTrigger panelId="app-nav" aria-label="Toggle app nav" />
          <SidebarContent>App nav</SidebarContent>
        </Sidebar>
        <Sidebar panelId="details-panel" side="right">
          <SidebarTrigger panelId="details-panel" aria-label="Toggle details" />
          <SidebarContent>Details</SidebarContent>
        </Sidebar>
        <PanelStateButton panelId="details-panel" />
      </SidebarProvider>
    );

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="left"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();
    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="right"][data-state="collapsed"]'
        )
      )
      .toBeInTheDocument();

    await page.getByRole("button", { name: "details-panel:closed" }).click();

    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="left"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();
    await expect
      .element(
        container.querySelector<HTMLElement>(
          '[data-slot="sidebar"][data-side="right"][data-state="expanded"]'
        )
      )
      .toBeInTheDocument();
  });

  it("resizes only the configured right sidebar and persists its width", async () => {
    const { container } = await render(
      <SidebarProvider
        panels={{
          "app-nav": { defaultOpen: true, cookieName: null },
          "details-panel": { defaultOpen: true, cookieName: null },
        }}
      >
        <Sidebar panelId="app-nav" side="left">
          <SidebarContent>App nav</SidebarContent>
        </Sidebar>
        <Sidebar
          panelId="details-panel"
          side="right"
          resizableWidth={{
            defaultWidth: 320,
            minWidth: 280,
            maxWidth: 520,
            storageKey: "test-details-width",
          }}
        >
          <SidebarContent>Details</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    const rightSidebar = container.querySelector<HTMLElement>(
      '[data-slot="sidebar"][data-side="right"]'
    );
    const leftSidebar = container.querySelector<HTMLElement>(
      '[data-slot="sidebar"][data-side="left"]'
    );
    const resizeHandle = page.getByRole("separator", {
      name: "Resize right sidebar",
    });

    await expect.element(rightSidebar).toHaveStyle("--sidebar-width: 320px");
    await expect.element(leftSidebar).not.toHaveStyle("--sidebar-width: 320px");

    const handleBounds = resizeHandle.element().getBoundingClientRect();
    const startX = handleBounds.width / 2;
    const startY = handleBounds.height / 2;
    await userEvent.dragAndDrop(resizeHandle, document.body, {
      sourcePosition: { x: startX, y: startY },
      targetPosition: {
        x: handleBounds.left + startX - 140,
        y: handleBounds.top + startY,
      },
    });

    await expect.element(rightSidebar).toHaveStyle("--sidebar-width: 460px");
    expect(window.localStorage.getItem("test-details-width")).toBe("460");
  });
});
