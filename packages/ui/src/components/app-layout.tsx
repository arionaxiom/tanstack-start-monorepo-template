import { Trans } from "@lingui/react/macro";
import { type ComponentType, Fragment, type ReactNode } from "react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@__APP_NAME__/ui/elements/breadcrumb";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  navigationMenuTriggerStyle,
} from "@__APP_NAME__/ui/elements/navigation-menu";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@__APP_NAME__/ui/elements/sidebar";

import {
  APP_NAV_SIDEBAR_PANEL_ID,
  AppSidebar,
  type MenuItem,
} from "./app-sidebar";

export const APP_RIGHT_SIDEBAR_PANEL_ID = "app-right";

export interface NavigationItem {
  title: string;
  href: string;
}

interface AppLayoutProps {
  children: ReactNode;
  /**
   * Brand mark shown at the top-left of the header. Defaults to a
   * simple logo + `__APP_NAME__` wordmark. Override to plug in your
   * own brand without forking the layout.
   */
  brand?: ReactNode;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
  navigationItems?: NavigationItem[];
  menuItems?: MenuItem[];
  /**
   * Optional router-aware Link to enable client-side navigation.
   * Active-route highlighting (e.g., TanStack Router's
   * `<Link activeProps>`) is the consumer's responsibility — wire
   * it via the link component you pass here.
   */
  LinkComponent: ComponentType<{
    to: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    [key: string]: unknown;
  }>;
  headerActions?: React.ReactNode;
  leftSidebarOpen?: boolean;
  onLeftSidebarOpenChange?: (open: boolean) => void;
  onRightSidebarOpenChange?: (open: boolean) => void;
  rightSidebarOpen?: boolean;
  rightSidebarPanelId?: string;
  rightSidebar?: React.ReactNode;
  sidebarContent?: React.ReactNode;
}

const DefaultBrand = () => (
  <div className="flex shrink-0 items-center gap-2">
    <img
      src="/logo/logo512.png"
      alt="__APP_NAME__"
      className="size-7 shrink-0 rounded-md object-contain"
    />
    <span className="hidden text-sm font-semibold tracking-tight text-foreground sm:inline">
      __APP_NAME__
    </span>
  </div>
);

export function AppLayout({
  children,
  brand = <DefaultBrand />,
  breadcrumbs,
  navigationItems = [],
  LinkComponent,
  menuItems = [],
  headerActions,
  leftSidebarOpen,
  onLeftSidebarOpenChange,
  onRightSidebarOpenChange,
  rightSidebarOpen,
  rightSidebarPanelId = APP_RIGHT_SIDEBAR_PANEL_ID,
  rightSidebar,
  sidebarContent,
}: AppLayoutProps) {
  return (
    <SidebarProvider
      panels={{
        [APP_NAV_SIDEBAR_PANEL_ID]: {
          cookieName: leftSidebarOpen === undefined ? "sidebar_state" : null,
          defaultOpen: true,
          keyboardShortcut: "b",
          onOpenChange: onLeftSidebarOpenChange,
          open: leftSidebarOpen,
        },
        [rightSidebarPanelId]: {
          cookieName: null,
          defaultOpen: false,
          keyboardShortcut: null,
          onOpenChange: onRightSidebarOpenChange,
          open: rightSidebarOpen,
        },
      }}
    >
      <AppSidebar
        LinkComponent={LinkComponent}
        menuItems={menuItems}
        panelId={APP_NAV_SIDEBAR_PANEL_ID}
      >
        {sidebarContent}
      </AppSidebar>
      <main
        id="main-content"
        className="relative flex flex-1 flex-col overflow-y-auto bg-background"
      >
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-4 focus-visible:z-40 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground focus-visible:shadow-popover"
          data-testid="skip-to-content"
        >
          <Trans>Skip to content</Trans>
        </a>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background md:h-12">
          <div className="flex flex-1 items-center gap-4 px-4">
            <SidebarTrigger
              panelId={APP_NAV_SIDEBAR_PANEL_ID}
              className="-ml-1"
            />
            <LinkComponent to="/" data-testid="brand-logo-link">
              {brand}
            </LinkComponent>

            {navigationItems.length > 0 && (
              <NavigationMenu className="z-0 hidden lg:flex">
                <NavigationMenuList>
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        render={<LinkComponent to={item.href} />}
                        className={navigationMenuTriggerStyle()}
                      >
                        {item.title}
                      </NavigationMenuLink>
                    </NavigationMenuItem>
                  ))}
                </NavigationMenuList>
              </NavigationMenu>
            )}

            {breadcrumbs && breadcrumbs.length > 0 && (
              <Breadcrumb>
                <BreadcrumbList>
                  {breadcrumbs.map((crumb, index) => (
                    <Fragment key={crumb.href ?? crumb.title}>
                      {index > 0 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                      <BreadcrumbItem
                        className={index === 0 ? "hidden md:block" : ""}
                      >
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink
                            render={<LinkComponent to={crumb.href ?? "/"} />}
                          >
                            {crumb.title}
                          </BreadcrumbLink>
                        )}
                      </BreadcrumbItem>
                    </Fragment>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            <div className="flex-1" />

            {headerActions ? (
              <div className="flex items-center gap-3">{headerActions}</div>
            ) : null}
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 px-3 py-4">{children}</div>
      </main>
      {rightSidebar}
    </SidebarProvider>
  );
}
