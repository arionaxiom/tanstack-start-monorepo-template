import { Input as InputPrimitive } from "@base-ui/react/input";
import * as React from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Input({
  className,
  type,
  "data-testid": dataTestId,
  ...props
}: React.ComponentProps<"input"> & { "data-testid"?: string }) {
  const Component = type === "file" ? "input" : InputPrimitive;

  return (
    <Component
      type={type}
      data-slot="input"
      data-testid={dataTestId}
      className={cn(
        "flex h-9 w-full rounded-md border border-border bg-background px-3 text-sm",
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

export { Input };
