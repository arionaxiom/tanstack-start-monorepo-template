import { useLingui } from "@lingui/react/macro";
import { Building2, Home, Phone } from "lucide-react";

import type { NavigationItem } from "@__APP_NAME__/ui/components/app-layout";
import type { MenuItem } from "@__APP_NAME__/ui/components/app-sidebar";

export const useNavigationItems = (): NavigationItem[] => {
  const { t } = useLingui();
  return [
    { title: t`Home`, href: "/" },
    { title: t`About`, href: "/about" },
    { title: t`Contact`, href: "/contact" },
  ];
};

export const useMenuItems = (): MenuItem[] => {
  const { t } = useLingui();
  return [
    {
      title: t`Home`,
      url: "/",
      icon: Home,
    },
    {
      title: t`About`,
      url: "/about",
      icon: Building2,
    },
    {
      title: t`Contact`,
      url: "/contact",
      icon: Phone,
    },
  ];
};
