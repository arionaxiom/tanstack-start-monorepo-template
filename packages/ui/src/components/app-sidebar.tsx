import type { ComponentType, ReactNode } from "react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@__APP_NAME__/ui/elements/sidebar";

export interface MenuItem {
  key: string; // kebab-case stable identifier (used for data-testid; must not change with locale)
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  /**
   * Optional label shown above the navigation group. Defaults to
   * `__APP_NAME__`. Override to customise without forking the component.
   */
  groupLabel?: ReactNode;
  LinkComponent?: ComponentType<{
    to: string;
    children: React.ReactNode;
    onClick?: React.MouseEventHandler<HTMLAnchorElement>;
    className?: string;
    [key: string]: unknown;
  }>;
  menuItems: MenuItem[];
}

export function AppSidebar({
  groupLabel = "__APP_NAME__",
  LinkComponent,
  menuItems,
}: AppSidebarProps) {
  const { isMobile, openMobile, toggleSidebar } = useSidebar();

  const handleNavigate = () => {
    if (isMobile && openMobile) {
      toggleSidebar();
    }
  };

  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{groupLabel}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    render={
                      LinkComponent ? (
                        ({
                          children,
                          className,
                          onClick: baseOnClick,
                          ...rest
                        }: React.HTMLAttributes<HTMLAnchorElement>) => (
                          <LinkComponent
                            to={item.url}
                            className={className}
                            data-testid={`sidebar-link-${item.key}`}
                            onClick={(e) => {
                              baseOnClick?.(e);
                              handleNavigate();
                            }}
                            {...(rest as Record<string, unknown>)}
                          >
                            {children}
                          </LinkComponent>
                        )
                      ) : (
                        <a
                          href={item.url}
                          onClick={handleNavigate}
                          data-testid={`sidebar-link-${item.key}`}
                        />
                      )
                    }
                  >
                    <item.icon />
                    <span>{item.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

AppSidebar.displayName = "AppSidebar";
