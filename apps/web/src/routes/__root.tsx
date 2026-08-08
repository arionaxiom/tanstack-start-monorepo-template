import {
  HeadContent,
  Link,
  Scripts,
  createRootRouteWithContext,
} from "@tanstack/react-router";

import appCss from "@__APP_NAME__/tailwind-config/shared-styles.css?url";
import { AppLayout } from "@__APP_NAME__/ui/components/app-layout";
import { DefaultCatchBoundary } from "@__APP_NAME__/ui/components/default-catch-boundary";
import { NotFound } from "@__APP_NAME__/ui/components/not-found";
import { Toaster } from "@__APP_NAME__/ui/elements/sonner";
import { TooltipProvider } from "@__APP_NAME__/ui/elements/tooltip";
import { seo } from "@__APP_NAME__/utils/seo/seo";

import { LocaleSwitcher } from "@/components/locale-switcher";
import { DevelopmentTanStackDevtools } from "@/devtools/development-tanstack-devtools";
import { useMenuItems, useNavigationItems } from "@/nav/use-nav";
import type { AppContext } from "@/router";

export const Route = createRootRouteWithContext<AppContext>()({
  loader({ context }) {
    return {
      loaderLocale: context.i18n.locale,
    };
  },
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      ...seo({
        title:
          "TanStack Start | Type-Safe, Client-First, Full-Stack React Framework",
        description: `TanStack Start is a type-safe, client-first, full-stack React framework. `,
      }),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/site.webmanifest", color: "#fffff" },
      { rel: "icon", href: "/logo/favicon.ico" },
    ],
  }),

  errorComponent: (props) => {
    return (
      <RootDocument>
        <DefaultCatchBoundary {...props} />
      </RootDocument>
    );
  },
  notFoundComponent: () => <NotFound />,

  shellComponent: RootDocument,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { loaderLocale } = Route.useLoaderData();
  const navigationItems = useNavigationItems();
  const menuItems = useMenuItems();
  const isDev = Boolean(import.meta.hot);

  return (
    <html lang={loaderLocale ?? "en"}>
      <head>
        <HeadContent />
      </head>
      <body>
        <AppLayout
          LinkComponent={Link}
          navigationItems={navigationItems}
          menuItems={menuItems}
          headerActions={<LocaleSwitcher />}
        >
          <TooltipProvider>{children}</TooltipProvider>
        </AppLayout>
        <Toaster />
        {isDev ? <DevelopmentTanStackDevtools /> : null}
        <Scripts />
      </body>
    </html>
  );
}
