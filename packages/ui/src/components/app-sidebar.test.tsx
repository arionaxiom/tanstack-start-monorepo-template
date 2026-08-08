import { House } from "lucide-react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { SidebarProvider } from "@__APP_NAME__/ui/elements/sidebar";
import { render, screen } from "@__APP_NAME__/ui/test-utils";

import { AppSidebar } from "./app-sidebar.js";

const TestLink = ({
  to,
  ...props
}: React.ComponentProps<"a"> & { to: string }) => <a href={to} {...props} />;

describe("AppSidebar", () => {
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

  it("renders app-provided sidebar content after navigation", () => {
    render(
      <SidebarProvider>
        <AppSidebar
          LinkComponent={TestLink}
          menuItems={[
            { key: "dashboard", title: "Dashboard", url: "/", icon: House },
          ]}
        >
          <section aria-label="Secondary navigation">Secondary content</section>
        </AppSidebar>
      </SidebarProvider>
    );

    expect(screen.getByTestId("sidebar-link-dashboard")).toBeInTheDocument();
    expect(screen.getByLabelText("Secondary navigation")).toHaveTextContent(
      "Secondary content"
    );
  });

  it("renders a sidebar-local toggle control", () => {
    render(
      <SidebarProvider>
        <AppSidebar
          LinkComponent={TestLink}
          menuItems={[
            { key: "dashboard", title: "Dashboard", url: "/", icon: House },
          ]}
        />
      </SidebarProvider>
    );

    expect(
      screen.getByRole("button", { name: "Toggle Sidebar" })
    ).toBeInTheDocument();
  });
});
