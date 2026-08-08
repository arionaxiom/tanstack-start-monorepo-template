import { ChevronDownIcon } from "lucide-react";
import * as React from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

type NativeSelectProps = Omit<React.ComponentProps<"select">, "size"> & {
  size?: "sm" | "default";
  "data-testid"?: string;
};

function NativeSelect({
  className,
  size = "default",
  "data-testid": dataTestId,
  ...props
}: NativeSelectProps) {
  return (
    <div
      className={cn(
        "group/native-select relative w-fit has-[select:disabled]:opacity-50",
        className
      )}
      data-slot="native-select-wrapper"
      data-size={size}
    >
      <select
        data-slot="native-select"
        data-size={size}
        data-testid={dataTestId}
        className={cn(
          "h-9 w-full min-w-0 appearance-none rounded-md border border-border bg-background py-1 pr-8 pl-3 text-sm",
          "text-foreground placeholder:text-subtle-foreground",
          "shadow-none outline-none select-none",
          "duration-fast transition-colors ease-standard",
          "hover:border-border-strong",
          "focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
          "disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground",
          "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
          "selection:bg-primary selection:text-primary-foreground",
          "data-[size=sm]:h-8"
        )}
        {...props}
      />
      <ChevronDownIcon
        className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-foreground select-none"
        aria-hidden="true"
        data-slot="native-select-icon"
      />
    </div>
  );
}

function NativeSelectOption({
  className,
  ...props
}: React.ComponentProps<"option">) {
  return (
    <option
      data-slot="native-select-option"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

function NativeSelectOptGroup({
  className,
  ...props
}: React.ComponentProps<"optgroup">) {
  return (
    <optgroup
      data-slot="native-select-optgroup"
      className={cn("bg-[Canvas] text-[CanvasText]", className)}
      {...props}
    />
  );
}

export { NativeSelect, NativeSelectOptGroup, NativeSelectOption };
