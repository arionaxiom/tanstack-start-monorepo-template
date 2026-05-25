import { Tabs as TabsPrimitive } from "@base-ui/react/tabs";
import { type VariantProps, cva } from "class-variance-authority";
import type { ComponentType, HTMLAttributes, ReactNode } from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Tabs({
  className,
  orientation = "horizontal",
  ...props
}: TabsPrimitive.Root.Props) {
  return (
    <TabsPrimitive.Root
      data-slot="tabs"
      data-orientation={orientation}
      className={cn(
        "group/tabs flex gap-2 data-horizontal:flex-col",
        className
      )}
      {...props}
    />
  );
}

const tabsListVariants = cva(
  "group/tabs-list flex items-center border-b border-border",
  {
    variants: {
      variant: {
        default: "",
        line: "gap-0 bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

const tabsTriggerClassName = cn(
  "relative -mb-px border-b-2 border-transparent px-3 py-2 text-sm text-muted-foreground hover:text-foreground",
  "data-[state=active]:border-primary data-[state=active]:text-foreground",
  "focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none",
  "disabled:pointer-events-none disabled:opacity-50",
  "whitespace-nowrap transition-colors"
);

function TabsList({
  className,
  variant = "default",
  ...props
}: TabsPrimitive.List.Props & VariantProps<typeof tabsListVariants>) {
  return (
    <TabsPrimitive.List
      data-slot="tabs-list"
      data-variant={variant}
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  );
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn(tabsTriggerClassName, className)}
      {...props}
    />
  );
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return (
    <TabsPrimitive.Panel
      data-slot="tabs-content"
      className={cn("flex-1 pt-4 text-sm outline-none", className)}
      {...props}
    />
  );
}

export interface RouteTabsLinkComponentProps {
  to: string;
  children: ReactNode;
  className?: string;
  "aria-current"?: "page" | undefined;
  "aria-label"?: string;
  "aria-selected"?: boolean;
  role?: string;
  "data-state"?: "active" | "inactive";
  "data-tab"?: string;
  "data-testid"?: string;
  onClick?: () => void;
  activeProps?: { className?: string };
}

export type RouteTabsLinkComponent = ComponentType<RouteTabsLinkComponentProps>;

export interface RouteTabsListProps
  extends
    Omit<HTMLAttributes<HTMLElement>, "children">,
    VariantProps<typeof tabsListVariants> {
  "aria-label": string;
  children: ReactNode;
}

function RouteTabsList({
  className,
  variant = "line",
  children,
  ...props
}: RouteTabsListProps) {
  return (
    <nav
      role="tablist"
      data-slot="route-tabs-list"
      className={cn(
        tabsListVariants({ variant }),
        "overflow-x-auto",
        className
      )}
      {...props}
    >
      {children}
    </nav>
  );
}

export interface RouteTabsLinkProps {
  to: string;
  active: boolean;
  LinkComponent: RouteTabsLinkComponent;
  children: ReactNode;
  className?: string;
  tabKey?: string;
  "aria-label"?: string;
  "data-testid"?: string;
  onClick?: () => void;
}

function RouteTabsLink({
  to,
  active,
  LinkComponent,
  children,
  className,
  tabKey,
  "aria-label": ariaLabel,
  "data-testid": dataTestId,
  onClick,
}: RouteTabsLinkProps) {
  return (
    <LinkComponent
      to={to}
      role="tab"
      aria-label={ariaLabel}
      aria-selected={active}
      aria-current={active ? "page" : undefined}
      data-state={active ? "active" : "inactive"}
      data-tab={tabKey}
      data-testid={dataTestId}
      activeProps={{
        className: "border-primary text-foreground",
      }}
      className={cn(tabsTriggerClassName, className)}
      onClick={onClick}
    >
      {children}
    </LinkComponent>
  );
}

export {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  RouteTabsList,
  RouteTabsLink,
  tabsListVariants,
  tabsTriggerClassName,
};
