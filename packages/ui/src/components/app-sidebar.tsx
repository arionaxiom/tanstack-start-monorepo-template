import type { ComponentType } from "react";

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
  LinkComponent?: ComponentType<{
    to: string;
    children: React.ReactNode;
    onClick?: () => void;
    className?: string;
  }>;
  menuItems: MenuItem[];
}

export function AppSidebar({ LinkComponent, menuItems }: AppSidebarProps) {
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
          <SidebarGroupLabel>__APP_NAME__</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.key}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    {LinkComponent ? (
                      <LinkComponent to={item.url} onClick={handleNavigate}>
                        <item.icon />
                        <span>{item.title}</span>
                      </LinkComponent>
                    ) : (
                      <a
                        href={item.url}
                        onClick={handleNavigate}
                        data-testid={`sidebar-link-${item.key}`}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </a>
                    )}
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
