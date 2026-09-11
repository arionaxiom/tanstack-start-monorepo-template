import { House } from "lucide-react";
import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { SidebarProvider } from "@__APP_NAME__/ui/elements/sidebar";
import { render } from "@__APP_NAME__/ui/test-utils";

import { AppSidebar } from "./app-sidebar.js";

const TestLink = ({
  to,
  ...props
}: React.ComponentProps<"a"> & { to: string }) => <a href={to} {...props} />;

describe("AppSidebar", () => {
  it("renders app-provided sidebar content after navigation", async () => {
    await render(
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

    await expect
      .element(page.getByTestId("sidebar-link-dashboard"))
      .toBeInTheDocument();
    await expect
      .element(page.getByLabelText("Secondary navigation"))
      .toHaveTextContent("Secondary content");
  });

  it("renders a sidebar-local toggle control", async () => {
    await render(
      <SidebarProvider>
        <AppSidebar
          LinkComponent={TestLink}
          menuItems={[
            { key: "dashboard", title: "Dashboard", url: "/", icon: House },
          ]}
        />
      </SidebarProvider>
    );

    await expect
      .element(page.getByRole("button", { name: "Toggle Sidebar" }))
      .toBeInTheDocument();
  });
});
