import { describe, expect, it } from "vitest";

import { render, screen } from "@__APP_NAME__/ui/test-utils";

import { Drawer, DrawerContent, DrawerTitle } from "./drawer";

describe("DrawerContent", () => {
  it("can render without an overlay for embedded surfaces", () => {
    render(
      <Drawer open modal={false}>
        <DrawerContent showOverlay={false}>
          <DrawerTitle>Drawer content</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );

    expect(screen.getByText("Drawer content")).toBeInTheDocument();
    expect(document.querySelector("[data-slot='drawer-overlay']")).toBeNull();
  });
});
