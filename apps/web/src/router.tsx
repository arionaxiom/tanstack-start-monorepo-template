import { type I18n, setupI18n } from "@lingui/core";
import { createRouter as createTanStackRouter } from "@tanstack/react-router";
import { getGlobalStartContext } from "@tanstack/react-start";

import { DefaultCatchBoundary } from "@__APP_NAME__/ui/components/default-catch-boundary";
import { NotFound } from "@__APP_NAME__/ui/components/not-found";

import { routerWithLingui } from "@/i18n/router-plugin";

import { routeTree } from "./routeTree.gen";

export interface AppContext {
  i18n: I18n;
}

export function getRouter() {
  const context = getGlobalStartContext();
  const i18n = context?.i18n ?? setupI18n();

  const router = routerWithLingui(
    createTanStackRouter({
      routeTree,
      context: {
        i18n,
      },
      defaultErrorComponent: DefaultCatchBoundary,
      defaultNotFoundComponent: () => <NotFound />,
      scrollRestoration: true,
      defaultPreloadStaleTime: 0,
    }),
    i18n
  );

  return router;
}

type AppRouter = ReturnType<typeof getRouter>;

declare module "@tanstack/react-router" {
  interface Register {
    router: AppRouter;
  }
}
