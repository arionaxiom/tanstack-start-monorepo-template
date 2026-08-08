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
import { ThemeProvider } from "@__APP_NAME__/ui/components/theme-provider";
import { ThemeToggle } from "@__APP_NAME__/ui/components/theme-toggle";
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
        title: "__APP_DISPLAY_NAME__",
        description:
          "A production-ready operations workspace built with TanStack Start.",
      }),
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "icon", href: "/logo/brand-mark.svg", type: "image/svg+xml" },
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
    <html lang={loaderLocale ?? "en"} suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <ThemeProvider>
          <AppLayout
            LinkComponent={Link}
            navigationItems={navigationItems}
            menuItems={menuItems}
            headerActions={
              <>
                <ThemeToggle />
                <LocaleSwitcher />
              </>
            }
          >
            <TooltipProvider>{children}</TooltipProvider>
          </AppLayout>
          <Toaster />
        </ThemeProvider>
        {isDev ? <DevelopmentTanStackDevtools /> : null}
        <Scripts />
      </body>
    </html>
  );
}
