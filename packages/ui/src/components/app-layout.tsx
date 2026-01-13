import type { ComponentType, ReactNode } from "react";

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
import { ScrollArea } from "@__APP_NAME__/ui/elements/scroll-area";
import {
  SidebarProvider,
  SidebarTrigger,
} from "@__APP_NAME__/ui/elements/sidebar";
import { Toaster } from "@__APP_NAME__/ui/elements/sonner";

import { AppSidebar, MenuItem } from "./app-sidebar";

export interface NavigationItem {
  title: string;
  href: string;
}

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: Array<{
    title: string;
    href?: string;
  }>;
  navigationItems?: NavigationItem[];
  menuItems?: MenuItem[];
  LinkComponent?: ComponentType<{
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }>;
  headerActions?: React.ReactNode;
}

export function AppLayout({
  children,
  breadcrumbs,
  navigationItems = [],
  LinkComponent,
  menuItems = [],
  headerActions,
}: AppLayoutProps) {
  const BrandLink = LinkComponent
    ? (props: { children: React.ReactNode }) => (
        <LinkComponent to="/" {...props} />
      )
    : ({ children }: { children: React.ReactNode }) => (
        <a href="/">{children}</a>
      );

  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar LinkComponent={LinkComponent} menuItems={menuItems} />
      <main className="relative flex min-h-svh flex-1 flex-col overflow-hidden">
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_15%,var(--secondary)/35%,transparent_55%),radial-gradient(circle_at_85%_0,var(--accent)/25%,transparent_60%)]"
          aria-hidden
        />
        <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-2 border-b bg-[color-mix(in_oklab,var(--background)_90%,transparent)]/95 backdrop-blur-xl transition-[width,height] ease-linear supports-[backdrop-filter]:bg-background/75">
          <div className="flex flex-1 items-center gap-3 px-4">
            <SidebarTrigger className="-ml-1" />
            <BrandLink>
              <div className="flex min-w-[44px] shrink-0 items-center justify-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-2 py-1 text-sm font-semibold text-primary sm:gap-3 sm:px-3 sm:text-sm lg:px-4 lg:py-2 lg:text-base">
                <img
                  src="/logo/logo512.png"
                  alt="TC Logistics"
                  className="h-8 w-8 shrink-0 rounded-full border border-primary/40 bg-card/80 object-contain p-0.5 sm:h-8 sm:w-8 lg:h-10 lg:w-10"
                />
                <span className="hidden tracking-wide sm:inline">
                  TC Logistics
                </span>
              </div>
            </BrandLink>

            {navigationItems.length > 0 && (
              <NavigationMenu className="z-0 hidden lg:flex">
                <NavigationMenuList>
                  {navigationItems.map((item) => (
                    <NavigationMenuItem key={item.href}>
                      <NavigationMenuLink
                        href={item.href}
                        className={navigationMenuTriggerStyle({
                          className:
                            "data-[state=active]:bg-primary/20 data-[state=active]:text-primary",
                        })}
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
                    <>
                      {index > 0 && (
                        <BreadcrumbSeparator
                          key={`separator-${index}`}
                          className="hidden md:block"
                        />
                      )}
                      <BreadcrumbItem
                        key={crumb.title}
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
                    </>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            )}

            {headerActions ? (
              <div className="ml-auto flex items-center gap-3">
                {headerActions}
              </div>
            ) : (
              <div className="ml-auto" />
            )}
          </div>
        </header>
        <ScrollArea className="flex-1">
          <div className="relative flex flex-1 flex-col gap-4 p-4 pt-0">
            <div
              className="pointer-events-none absolute -top-16 right-10 h-64 w-64 rounded-full bg-primary/15 blur-3xl"
              aria-hidden
            />
            <div className="pointer-events-none absolute bottom-10 left-4 h-52 w-52 rounded-full bg-accent/25 blur-3xl" />
            <div className="relative">{children}</div>
          </div>
        </ScrollArea>
      </main>
      <Toaster />
    </SidebarProvider>
  );
}
