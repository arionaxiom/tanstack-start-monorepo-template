import { describe, expect, it } from "vitest";
import { page } from "vitest/browser";

import { render } from "@__APP_NAME__/ui/test-utils";

import {
  Drawer,
  DrawerContent,
  DrawerSwipeHandle,
  DrawerTitle,
} from "./drawer";

describe("DrawerContent", () => {
  it("can render without an overlay for embedded surfaces", async () => {
    await render(
      <Drawer open modal={false}>
        <DrawerContent showOverlay={false}>
          <DrawerTitle>Drawer content</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );

    await expect.element(page.getByText("Drawer content")).toBeInTheDocument();
    expect(
      document.querySelector<HTMLElement>("[data-slot='drawer-overlay']")
    ).toBeNull();
  });

  it("maps the compatibility direction prop to the Base UI swipe axis", async () => {
    await render(
      <Drawer open modal={false} direction="left" showSwipeHandle>
        <DrawerContent>
          <DrawerTitle>Side drawer</DrawerTitle>
        </DrawerContent>
      </Drawer>
    );

    const popup = document.querySelector<HTMLElement>(
      "[data-slot='drawer-popup']"
    );

    expect(popup).toHaveAttribute("data-drawer-direction", "left");
    await expect.element(popup).toHaveAttribute("data-swipe-axis", "x");
    await expect
      .element(
        document.querySelector<HTMLElement>("[data-slot='drawer-swipe-handle']")
      )
      .toBeInTheDocument();
  });

  it("exports a swipe handle for custom drawer compositions", async () => {
    await render(<DrawerSwipeHandle data-testid="custom-drawer-handle" />);

    await expect
      .element(page.getByTestId("custom-drawer-handle"))
      .toHaveAttribute("aria-hidden", "true");
  });
});
