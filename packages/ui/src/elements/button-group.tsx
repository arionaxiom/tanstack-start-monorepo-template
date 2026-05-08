import * as React from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function ButtonGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      role="group"
      data-slot="button-group"
      className={cn(
        "inline-flex divide-x divide-border rounded-md border border-border [&>button]:rounded-none [&>button:first-child]:rounded-l-md [&>button:last-child]:rounded-r-md",
        className
      )}
      {...props}
    />
  );
}

export { ButtonGroup };
