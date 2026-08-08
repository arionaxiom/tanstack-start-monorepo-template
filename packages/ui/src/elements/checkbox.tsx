"use client";

import { Checkbox as CheckboxPrimitive } from "@base-ui/react/checkbox";
import { CheckIcon } from "lucide-react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Checkbox({
  className,
  "data-testid": dataTestId,
  ...props
}: CheckboxPrimitive.Root.Props & { "data-testid"?: string }) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      data-testid={dataTestId}
      className={cn(
        "peer relative flex size-4 shrink-0 items-center justify-center rounded-xs border border-border-strong bg-background",
        "shadow-none transition-colors duration-[var(--duration-1)] ease-[var(--ease)] outline-none",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "group-has-disabled/field:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "aria-invalid:aria-checked:border-primary",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="grid place-content-center text-current transition-none [&>svg]:size-3.5"
      >
        <CheckIcon />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
}

export { Checkbox };
