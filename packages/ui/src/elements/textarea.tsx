import * as React from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Textarea({
  className,
  "data-testid": dataTestId,
  ...props
}: React.ComponentProps<"textarea"> & { "data-testid"?: string }) {
  return (
    <textarea
      data-slot="textarea"
      data-testid={dataTestId}
      className={cn(
        "flex min-h-20 w-full rounded-md border border-border bg-background px-3 py-2 text-sm",
        "text-foreground placeholder:text-subtle-foreground",
        "shadow-none outline-none",
        "duration-fast transition-colors ease-standard",
        "hover:border-border-strong",
        "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        className
      )}
      {...props}
    />
  );
}

export { Textarea };
