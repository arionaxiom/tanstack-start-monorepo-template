import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@__APP_NAME__/ui/utils/cn";

const buttonVariants = cva(
  cn(
    "inline-flex items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap",
    "transition-colors duration-[var(--duration-1)] ease-[var(--ease)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:cursor-not-allowed disabled:opacity-60",
    "[&>svg]:size-4 [&>svg]:shrink-0"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary hover:bg-[oklch(var(--brand-700))] active:brightness-95",
        secondary:
          "bg-transparent text-foreground border border-border hover:bg-muted active:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive hover:brightness-90 active:brightness-95",
        spotlight:
          "bg-spotlight text-spotlight-foreground border border-spotlight hover:brightness-95 active:brightness-90",
        link: "text-primary underline-offset-4 hover:underline border-0 px-0",
      },
      size: {
        xs: "h-6 px-2 text-xs rounded-sm",
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-9 px-3.5 text-sm rounded-md",
        lg: "h-10 px-4 text-[0.9375rem] rounded-md",
        xl: "h-12 px-5 text-[0.9375rem] rounded-md",
        icon: "size-9 rounded-md",
      },
    },
    defaultVariants: { variant: "default", size: "md" },
  }
);

function Button({
  className,
  variant = "default",
  size = "md",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}

export { Button, buttonVariants };
