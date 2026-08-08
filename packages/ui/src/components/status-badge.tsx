import { type VariantProps, cva } from "class-variance-authority";
import { type ComponentPropsWithoutRef, type ReactNode, type Ref } from "react";

import { Badge } from "@__APP_NAME__/ui/elements/badge";
import { cn } from "@__APP_NAME__/ui/utils/cn";

const statusBadgeVariants = cva("inline-flex items-center gap-1", {
  variants: {
    variant: {
      default: "bg-muted text-foreground border-border",
      primary: "bg-primary/10 text-primary border-primary/20",
      spotlight: "border-spotlight/25 bg-spotlight/10 text-spotlight-emphasis",
      success: "border-success/20 bg-success/10 text-success-emphasis",
      warning: "border-warning/20 bg-warning/10 text-warning-emphasis",
      destructive:
        "border-destructive/20 bg-destructive/10 text-destructive-emphasis",
      agent: "border-agent/20 bg-agent/10 text-agent-emphasis",
      info: "border-info/20 bg-info/10 text-info-emphasis",
      outline: "bg-transparent text-foreground border-border-strong",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface StatusBadgeProps
  extends
    Omit<ComponentPropsWithoutRef<typeof Badge>, "variant" | "children">,
    VariantProps<typeof statusBadgeVariants> {
  ref?: Ref<HTMLSpanElement>;
  icon?: ReactNode;
  children: ReactNode;
}

export function StatusBadge({
  variant,
  icon,
  children,
  className,
  ref,
  ...rest
}: StatusBadgeProps) {
  return (
    <Badge
      ref={ref}
      className={cn(statusBadgeVariants({ variant }), className)}
      {...rest}
    >
      {icon ? (
        <span className="shrink-0" aria-hidden>
          {icon}
        </span>
      ) : null}
      {children}
    </Badge>
  );
}

StatusBadge.displayName = "StatusBadge";
