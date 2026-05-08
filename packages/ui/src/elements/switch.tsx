import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Switch({
  className,
  "data-testid": dataTestId,
  ...props
}: SwitchPrimitive.Root.Props & { "data-testid"?: string }) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-testid={dataTestId}
      className={cn(
        "peer group/switch relative inline-flex h-5 w-9 shrink-0 items-center rounded-full",
        "border border-transparent shadow-none outline-none",
        "transition-colors duration-[var(--duration-1)] ease-[var(--ease)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-primary/20",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "data-[state=checked]:bg-primary data-[state=unchecked]:bg-muted",
        "data-disabled:cursor-not-allowed data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "pointer-events-none block size-4 rounded-full border border-border-strong bg-background shadow-popover",
          "transition-transform duration-[var(--duration-1)]",
          "data-[state=checked]:translate-x-4 data-[state=unchecked]:translate-x-0"
        )}
      />
    </SwitchPrimitive.Root>
  );
}

export { Switch };
