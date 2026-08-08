import { mergeProps } from "@base-ui/react/merge-props";
import { useRender } from "@base-ui/react/use-render";
import { type VariantProps, cva } from "class-variance-authority";

import { cn } from "@__APP_NAME__/ui/utils/cn";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-1.5 h-5 text-xs font-medium border whitespace-nowrap shrink-0",
  {
    variants: {
      variant: {
        default: "border-border bg-muted text-foreground",
        primary: "bg-primary/10 text-primary border-primary/20",
        spotlight:
          "border-spotlight/25 bg-spotlight/10 text-spotlight-emphasis",
        success: "border-success/20 bg-success/10 text-success-emphasis",
        warning: "border-warning/20 bg-warning/10 text-warning-emphasis",
        destructive:
          "border-destructive/20 bg-destructive/10 text-destructive-emphasis",
        agent: "border-agent/20 bg-agent/10 text-agent-emphasis",
        info: "border-info/20 bg-info/10 text-info-emphasis",
        outline: "border-border-strong bg-transparent text-foreground",
        // Legacy compat aliases
        secondary: "border-border bg-muted text-foreground",
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
