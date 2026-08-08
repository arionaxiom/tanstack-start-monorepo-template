import { describe, expect, it } from "vitest";

import { render, screen } from "@__APP_NAME__/ui/test-utils";

import {
  Drawer,
  DrawerContent,
  DrawerSwipeHandle,
  DrawerTitle,
} from "./drawer";

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

  it("maps the compatibility direction prop to the Base UI swipe axis", () => {
    render(
      <Drawer open modal={false} direction="left" showSwipeHandle>
        <DrawerContent>
          <DrawerTitle>Side drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );

    const popup = document.querySelector("[data-slot='drawer-popup']");

    expect(popup).toHaveAttribute("data-drawer-direction", "left");
    expect(popup).toHaveAttribute("data-swipe-axis", "x");
    expect(
      document.querySelector("[data-slot='drawer-swipe-handle']")
    ).toBeInTheDocument();
  });

  it("exports a swipe handle for custom drawer compositions", () => {
    render(<DrawerSwipeHandle data-testid="custom-drawer-handle" />);

    expect(screen.getByTestId("custom-drawer-handle")).toHaveAttribute(
      "aria-hidden",
      "true"
    );
  });
});
