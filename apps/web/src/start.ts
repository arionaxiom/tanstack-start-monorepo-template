import { createCsrfMiddleware, createStart } from "@tanstack/react-start";

import { linguiMiddleware } from "@/i18n/lingui-middleware";

const csrfMiddleware = createCsrfMiddleware({
  filter: (context) => context.handlerType === "serverFn",
});

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [csrfMiddleware, linguiMiddleware],
  };
});
