import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Switch({
  className,
  size = "default",
  "data-testid": dataTestId,
  ...props
}: SwitchPrimitive.Root.Props & {
  size?: "sm" | "default";
  "data-testid"?: string;
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      data-testid={dataTestId}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-full data-[size=default]:h-5 data-[size=default]:w-9 data-[size=sm]:h-4 data-[size=sm]:w-7",
        "border border-transparent shadow-none outline-none",
        "transition-colors duration-[var(--duration-1)] ease-[var(--ease)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "data-checked:bg-primary data-unchecked:bg-muted",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block rounded-full border border-border-strong bg-background shadow-popover group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3",
          "transition-transform duration-[var(--duration-1)]",
          "data-checked:group-data-[size=default]/switch:translate-x-4 data-checked:group-data-[size=sm]/switch:translate-x-3 data-unchecked:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
