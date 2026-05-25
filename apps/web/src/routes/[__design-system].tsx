import { createFileRoute, notFound } from "@tanstack/react-router";

import { DesignSystemShowcase } from "@__APP_NAME__/ui/components/design-system/index";

export const Route = createFileRoute("/__design-system")({
  beforeLoad: () => {
    if (process.env.NODE_ENV === "production") {
      throw notFound();
    }
  },
  component: DesignSystemShowcase,
});
