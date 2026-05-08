import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@__APP_NAME__/ui/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-1.5 h-5 text-xs font-medium border whitespace-nowrap shrink-0",
  {
    variants: {
      variant: {
        default: "bg-muted text-fg border-border",
        primary: "bg-primary/10 text-primary border-primary/20",
        spotlight: "bg-spotlight/10 text-spotlight border-spotlight/25",
        success: "bg-success/10 text-success border-success/20",
        warning: "bg-warning/10 text-warning border-warning/20",
        destructive: "bg-destructive/10 text-destructive border-destructive/20",
        agent: "bg-agent/10 text-agent border-agent/20",
        info: "bg-info/10 text-info border-info/20",
        outline: "bg-transparent text-fg border-border-strong",
        // Legacy compat aliases
        secondary: "bg-muted text-fg border-border",
        ghost: "bg-transparent text-foreground border-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

function Badge({
  className,
  variant = "default",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  });
}

export { Badge, badgeVariants };
