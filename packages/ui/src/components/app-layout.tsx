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

import { AppSidebar, MenuItem } from "./app-sidebar";

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
  LinkComponent?: ComponentType<{
    to: string;
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    [key: string]: unknown;
  }>;
  headerActions?: React.ReactNode;
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
}: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar LinkComponent={LinkComponent} menuItems={menuItems} />
      <main
        id="main-content"
        className="relative flex flex-1 flex-col overflow-y-auto bg-background"
      >
        <a
          href="#main-content"
          className="sr-only focus-visible:not-sr-only focus-visible:absolute focus-visible:top-3 focus-visible:left-4 focus-visible:z-40 focus-visible:rounded-md focus-visible:bg-primary focus-visible:px-3 focus-visible:py-1.5 focus-visible:text-sm focus-visible:font-medium focus-visible:text-primary-foreground focus-visible:shadow-[var(--shadow-popover)]"
          data-testid="skip-to-content"
        >
          <Trans>Skip to content</Trans>
        </a>
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background md:h-12">
          <div className="flex flex-1 items-center gap-4 px-4">
            <SidebarTrigger className="-ml-1" />
            {LinkComponent ? (
              <LinkComponent to="/" data-testid="brand-logo-link">
                {brand}
              </LinkComponent>
            ) : (
              <a href="/" data-testid="brand-logo-link">
                {brand}
              </a>
            )}

            {navigationItems.length > 0 && (
              <NavigationMenu className="z-0 hidden lg:flex">
                <NavigationMenuList>
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        href={item.href}
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
                    <Fragment key={crumb.href ?? `${index}-${crumb.title}`}>
                      {index > 0 && (
                        <BreadcrumbSeparator className="hidden md:block" />
                      )}
                      <BreadcrumbItem
                        className={index === 0 ? "hidden md:block" : ""}
                      >
                        {index === breadcrumbs.length - 1 ? (
                          <BreadcrumbPage>{crumb.title}</BreadcrumbPage>
                        ) : (
                          <BreadcrumbLink href={crumb.href}>
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
        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
      </main>
    </SidebarProvider>
  );
}
