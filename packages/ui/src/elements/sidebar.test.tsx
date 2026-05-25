import { beforeEach, describe, expect, it, vi } from "vitest";

import { Button } from "@__APP_NAME__/ui/elements/button";
import {
  Sidebar,
  SidebarContent,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@__APP_NAME__/ui/elements/sidebar";
import {
  fireEvent,
  render,
  screen,
  userEvent,
} from "@__APP_NAME__/ui/test-utils";

function installDesktopMatchMedia() {
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
}

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
    installDesktopMatchMedia();
    document.cookie = "sidebar_state=; Max-Age=0; path=/";
    window.localStorage.clear();
  });

  it("keeps existing default sidebar behavior", () => {
    const { container } = render(
      <SidebarProvider defaultOpen>
        <Sidebar>
          <SidebarContent>Default sidebar</SidebarContent>
        </Sidebar>
      </SidebarProvider>
    );

    expect(
      container.querySelector('[data-slot="sidebar"][data-state="expanded"]')
    ).toBeInTheDocument();
  });

  it("keeps keyed left and right panels independent", async () => {
    const user = userEvent.setup();
    const { container } = render(
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

    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="left"][data-state="expanded"]'
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="right"][data-state="collapsed"]'
      )
    ).toBeInTheDocument();

    await user.click(
      screen.getByRole("button", { name: "details-panel:closed" })
    );

    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="left"][data-state="expanded"]'
      )
    ).toBeInTheDocument();
    expect(
      container.querySelector(
        '[data-slot="sidebar"][data-side="right"][data-state="expanded"]'
      )
    ).toBeInTheDocument();
  });

  it("resizes only the configured right sidebar and persists its width", () => {
    const { container } = render(
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

    const rightSidebar = container.querySelector(
      '[data-slot="sidebar"][data-side="right"]'
    );
    const leftSidebar = container.querySelector(
      '[data-slot="sidebar"][data-side="left"]'
    );
    const resizeHandle = screen.getByRole("separator", {
      name: "Resize right sidebar",
    });

    expect(rightSidebar).toHaveStyle({ "--sidebar-width": "320px" });
    expect(leftSidebar).not.toHaveStyle({ "--sidebar-width": "320px" });

    dispatchPointerEvent(resizeHandle, "pointerdown", {
      clientX: 900,
      pointerId: 1,
    });
    dispatchPointerEvent(window, "pointermove", {
      clientX: 760,
      pointerId: 1,
    });
    dispatchPointerEvent(window, "pointerup", { pointerId: 1 });

    expect(rightSidebar).toHaveStyle({ "--sidebar-width": "460px" });
    expect(window.localStorage.getItem("test-details-width")).toBe("460");
  });
});

function dispatchPointerEvent(
  target: Element | Document | Window,
  type: string,
  init: { clientX?: number; pointerId?: number } = {}
) {
  const event = new Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, init);
  fireEvent(target, event);
}
