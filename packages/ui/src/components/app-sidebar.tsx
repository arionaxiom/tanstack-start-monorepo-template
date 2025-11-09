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
} from "@__APP_NAME__/ui/elements/sidebar";

export interface MenuItem {
  title: string;
  url: string;
  icon: ComponentType<{ className?: string }>;
}

interface AppSidebarProps {
  LinkComponent?: ComponentType<{ to: string; children: React.ReactNode }>;
  menuItems: MenuItem[];
}

export function AppSidebar({ LinkComponent, menuItems }: AppSidebarProps) {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>TC Logistics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    {LinkComponent ? (
                      <LinkComponent to={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </LinkComponent>
                    ) : (
                      <a href={item.url}>
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
