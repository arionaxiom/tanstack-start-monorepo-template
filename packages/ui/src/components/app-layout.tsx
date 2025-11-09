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
import {
  SidebarProvider,
  SidebarTrigger,
} from "@__APP_NAME__/ui/elements/sidebar";

import { AppSidebar, MenuItem } from "./app-sidebar";

interface NavigationItem {
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
  LinkComponent?: ComponentType<{ to: string; children: React.ReactNode }>;
}

export function AppLayout({
  children,
  breadcrumbs,
  navigationItems = [],
  LinkComponent,
  menuItems = [],
}: AppLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <AppSidebar LinkComponent={LinkComponent} menuItems={menuItems} />
      <main className="flex min-h-svh flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
          <div className="flex flex-1 items-center gap-4 px-4">
            <SidebarTrigger className="-ml-1" />

            {navigationItems.length > 0 && (
              <NavigationMenu className="z-0">
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
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">{children}</div>
      </main>
    </SidebarProvider>
  );
}
