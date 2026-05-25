"use client";

import { Drawer as DrawerPrimitive } from "@base-ui/react/drawer";
import * as React from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

type DrawerDirection = "top" | "right" | "bottom" | "left";

type DrawerProps = Omit<
  React.ComponentProps<typeof DrawerPrimitive.Root>,
  "swipeDirection"
> & {
  direction?: DrawerDirection;
  swipeDirection?: React.ComponentProps<
    typeof DrawerPrimitive.Root
  >["swipeDirection"];
};

const DrawerDirectionContext = React.createContext<DrawerDirection>("bottom");

const swipeDirectionByDrawerDirection = {
  bottom: "down",
  top: "up",
  left: "left",
  right: "right",
} as const satisfies Record<
  DrawerDirection,
  NonNullable<DrawerProps["swipeDirection"]>
>;

function Drawer({
  direction = "bottom",
  swipeDirection = swipeDirectionByDrawerDirection[direction],
  ...props
}: DrawerProps) {
  return (
    <DrawerDirectionContext value={direction}>
      <DrawerPrimitive.Root swipeDirection={swipeDirection} {...props} />
    </DrawerDirectionContext>
  );
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />;
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />;
}

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Backdrop>) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="drawer-overlay"
      className={cn(
        "fixed inset-0 z-50 bg-[oklch(var(--overlay))] data-closed:animate-out data-closed:fade-out-0 data-open:animate-in data-open:fade-in-0",
        className
      )}
      {...props}
    />
  );
}

type DrawerContentProps = React.ComponentProps<typeof DrawerPrimitive.Popup> & {
  showOverlay?: boolean;
};

function DrawerContent({
  className,
  children,
  showOverlay = true,
  ...props
}: DrawerContentProps) {
  const direction = React.use(DrawerDirectionContext);

  return (
    <DrawerPortal data-slot="drawer-portal">
      {showOverlay ? <DrawerOverlay /> : null}
      <DrawerPrimitive.Viewport
        data-slot="drawer-viewport"
        className="pointer-events-none fixed inset-0 z-50"
      >
        <DrawerPrimitive.Popup
          data-drawer-direction={direction}
          data-slot="drawer-content"
          className={cn(
            "group/drawer-content pointer-events-auto fixed z-50 flex h-auto flex-col border-border bg-card text-sm shadow-(--shadow-modal) data-[drawer-direction=bottom]:inset-x-0 data-[drawer-direction=bottom]:bottom-0 data-[drawer-direction=bottom]:mt-24 data-[drawer-direction=bottom]:max-h-[80vh] data-[drawer-direction=bottom]:rounded-t-lg data-[drawer-direction=bottom]:border-t data-[drawer-direction=left]:inset-y-0 data-[drawer-direction=left]:left-0 data-[drawer-direction=left]:w-[420px] data-[drawer-direction=left]:rounded-r-lg data-[drawer-direction=left]:border-r data-[drawer-direction=right]:inset-y-0 data-[drawer-direction=right]:right-0 data-[drawer-direction=right]:w-[420px] data-[drawer-direction=right]:rounded-l-lg data-[drawer-direction=right]:border-l data-[drawer-direction=top]:inset-x-0 data-[drawer-direction=top]:top-0 data-[drawer-direction=top]:mb-24 data-[drawer-direction=top]:max-h-[80vh] data-[drawer-direction=top]:rounded-b-lg data-[drawer-direction=top]:border-b data-[drawer-direction=left]:sm:max-w-[480px] data-[drawer-direction=right]:sm:max-w-[480px]",
            className
          )}
          {...props}
        >
          <DrawerPrimitive.Content className="flex h-full flex-col">
            <div className="mx-auto mt-4 hidden h-1.5 w-[100px] shrink-0 rounded-full bg-muted group-data-[drawer-direction=bottom]/drawer-content:block" />
            {children}
          </DrawerPrimitive.Content>
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </DrawerPortal>
  );
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[drawer-direction=bottom]/drawer-content:text-center group-data-[drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  );
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("font-medium text-foreground", className)}
      {...props}
    />
  );
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
