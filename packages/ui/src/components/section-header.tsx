import { type ReactNode } from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

export interface SectionHeaderProps {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  size?: "page" | "section";
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  actions,
  size = "section",
  className,
}: SectionHeaderProps) {
  const titleClass = size === "page" ? "text-display" : "text-headline";
  const descClass = "text-body text-muted-foreground";

  return (
    <header
      className={cn(
        "flex items-end justify-between gap-4",
        size === "page" ? "mb-6" : "mb-4",
        className
      )}
    >
      <div className="min-w-0 flex-1">
        {kicker ? (
          <div className="mb-2 text-kicker font-medium text-muted-foreground uppercase">
            {kicker}
          </div>
        ) : null}
        <h2
          className={cn(titleClass, "font-bold tracking-tight text-foreground")}
        >
          {title}
        </h2>
        {description ? (
          <p className={cn(descClass, "mt-2 max-w-prose")}>{description}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2">{actions}</div>
      ) : null}
    </header>
  );
}
