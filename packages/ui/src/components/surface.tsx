import { type VariantProps, cva } from "class-variance-authority";
import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type Ref,
} from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

const surfaceVariants = cva("", {
  variants: {
    elevation: {
      page: "bg-background text-foreground",
      section: "bg-surface text-foreground",
      card: "bg-card text-card-foreground",
      elevated: "bg-elevated text-card-foreground shadow-(--shadow-popover)",
      inverse: "bg-foreground text-inverse-foreground",
    },
    bordered: {
      true: "border border-border",
      false: "",
    },
    radius: {
      none: "rounded-none",
      md: "rounded-md",
      lg: "rounded-lg",
      xl: "rounded-xl",
    },
  },
  defaultVariants: {
    elevation: "page",
    bordered: false,
    radius: "none",
  },
});

export type SurfaceProps<T extends ElementType = "div"> = {
  as?: T;
  ref?: Ref<HTMLElement>;
} & VariantProps<typeof surfaceVariants> &
  Omit<
    ComponentPropsWithoutRef<T>,
    "as" | keyof VariantProps<typeof surfaceVariants>
  >;

export function Surface<T extends ElementType = "div">({
  as,
  elevation,
  bordered,
  radius,
  className,
  ref,
  ...rest
}: SurfaceProps<T>) {
  const Component = (as ?? "div") as ElementType;
  return (
    <Component
      ref={ref}
      className={cn(
        surfaceVariants({ elevation, bordered, radius }),
        className
      )}
      {...rest}
    />
  );
}

Surface.displayName = "Surface";
