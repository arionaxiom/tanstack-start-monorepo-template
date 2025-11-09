import { Home } from "lucide-react";

import { MenuItem } from "@__APP_NAME__/ui/components/app-sidebar";

export const navigationItems = [
  { title: "Home", href: "/" },
  { title: "About", href: "/about" },
  { title: "Contact", href: "/contact" },
];

export const menuItems: MenuItem[] = [
  {
    title: "Home",
    url: "/",
    icon: Home,
  },
];
