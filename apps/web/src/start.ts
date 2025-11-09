import { createStart } from "@tanstack/react-start";

import { linguiMiddleware } from "@/i18n/lingui-middleware";

export const startInstance = createStart(() => {
  return {
    requestMiddleware: [linguiMiddleware],
  };
});
