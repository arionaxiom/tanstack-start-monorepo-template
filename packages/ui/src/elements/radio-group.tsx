import { Radio as RadioPrimitive } from "@base-ui/react/radio";
import { RadioGroup as RadioGroupPrimitive } from "@base-ui/react/radio-group";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function RadioGroup({
  className,
  "data-testid": dataTestId,
  ...props
}: RadioGroupPrimitive.Props & { "data-testid"?: string }) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      data-testid={dataTestId}
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  );
}

function RadioGroupItem({
  className,
  "data-testid": dataTestId,
  ...props
}: RadioPrimitive.Root.Props & { "data-testid"?: string }) {
  return (
    <RadioPrimitive.Root
      data-slot="radio-group-item"
      data-testid={dataTestId}
      className={cn(
        "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-border-strong bg-background outline-none",
        "transition-colors duration-[var(--duration-1)] ease-[var(--ease)]",
        "after:absolute after:-inset-x-3 after:-inset-y-2",
        "focus-visible:ring-2 focus-visible:ring-primary/20",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-destructive aria-invalid:ring-2 aria-invalid:ring-destructive/15",
        "aria-invalid:aria-checked:border-primary",
        "data-checked:border-primary data-checked:bg-primary data-checked:text-primary-foreground",
        className
      )}
      {...props}
    >
      <RadioPrimitive.Indicator
        data-slot="radio-group-indicator"
        className="flex size-4 items-center justify-center"
      >
        <span className="absolute top-1/2 left-1/2 size-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary-foreground" />
      </RadioPrimitive.Indicator>
    </RadioPrimitive.Root>
  );
}

export { RadioGroup, RadioGroupItem };
