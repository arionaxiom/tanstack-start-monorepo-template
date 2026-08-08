import type { ComponentType, ReactNode } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@__APP_NAME__/ui/elements/sidebar";

export const APP_NAV_SIDEBAR_PANEL_ID = "app-nav";

export interface MenuItem {
  key: string; // kebab-case stable identifier (used for data-testid; must not change with locale)
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  /**
   * Optional label shown in the sidebar header. Defaults to
   * `__APP_DISPLAY_NAME__`. Override to customise without forking the component.
   */
  groupLabel?: ReactNode;
  LinkComponent: ComponentType<{
    to: string;
    children?: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    [key: string]: unknown;
  }>;
  menuItems: MenuItem[];
  children?: ReactNode;
  panelId?: string;
}

export function AppSidebar({
  groupLabel = "__APP_DISPLAY_NAME__",
  LinkComponent,
  menuItems,
  children,
  panelId = APP_NAV_SIDEBAR_PANEL_ID,
}: AppSidebarProps) {
  const { isMobile, openMobile, toggleSidebar } = useSidebar(panelId);

  const handleNavigate = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar panelId={panelId}>
      <SidebarHeader className="flex-row items-center justify-between border-b border-sidebar-border px-3 py-2">
        <div className="min-w-0 truncate text-sm font-semibold text-sidebar-foreground">
          {groupLabel}
        </div>
        <SidebarTrigger panelId={panelId} className="size-8 shrink-0" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    panelId={panelId}
                    tooltip={item.title}
                    render={({
                      children,
                      className,
                      onClick: baseOnClick,
                      ...rest
                    }: React.HTMLAttributes<HTMLAnchorElement>) => (
                      <LinkComponent
                        to={item.url}
                        className={className}
                        data-testid={`sidebar-link-${item.key}`}
                        onClick={(event) => {
                          baseOnClick?.(event);
                          handleNavigate();
                        }}
                        {...(rest as Record<string, unknown>)}
                      >
                        {children}
                      </LinkComponent>
                    )}
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        {children}
      </SidebarContent>
    </Sidebar>
  );
}

AppSidebar.displayName = "AppSidebar";
