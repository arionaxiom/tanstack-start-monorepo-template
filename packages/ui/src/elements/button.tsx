import { Button as ButtonPrimitive } from "@base-ui/react/button";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@__APP_NAME__/ui/utils/cn";

const buttonVariants = cva(
  cn(
    "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-md border border-transparent text-sm font-medium whitespace-nowrap select-none",
    "transition-colors duration-[var(--duration-1)] ease-[var(--ease)]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
    "disabled:pointer-events-none disabled:opacity-60",
    "aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
  ),
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground border border-primary hover:bg-[oklch(var(--brand-700))] active:brightness-95",
        secondary:
          "bg-transparent text-foreground border border-border hover:bg-muted active:bg-muted",
        outline:
          "bg-background text-foreground border border-border hover:bg-muted active:bg-muted",
        ghost: "bg-transparent text-foreground hover:bg-muted active:bg-muted",
        destructive:
          "bg-destructive text-destructive-foreground border border-destructive hover:brightness-90 active:brightness-95",
        spotlight:
          "bg-spotlight text-spotlight-foreground border border-spotlight hover:brightness-95 active:brightness-90",
        link: "text-primary underline-offset-4 hover:underline border-0 px-0",
      },
      size: {
        default: "h-9 px-3.5 text-sm rounded-md",
        xs: "h-6 px-2 text-xs rounded-sm",
        sm: "h-8 px-3 text-sm rounded-md",
        md: "h-9 px-3.5 text-sm rounded-md",
        lg: "h-10 px-4 text-[0.9375rem] rounded-md",
        xl: "h-12 px-5 text-[0.9375rem] rounded-md",
        icon: "size-9 rounded-md",
        "icon-xs": "size-6 rounded-sm [&_svg:not([class*='size-'])]:size-3",
        "icon-sm": "size-8 rounded-md",
        "icon-lg": "size-10 rounded-md",
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
