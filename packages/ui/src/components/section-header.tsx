import { type ElementType, type ReactNode } from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

export interface SectionHeaderProps {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  size?: "page" | "section";
  /**
   * HTML heading level for the title element. Defaults to `2` (`<h2>`).
   * Set to `1` when this is the primary page heading, or a higher number
   * when nested inside other sections, to maintain a correct heading
   * hierarchy without forking the component.
   */
  level?: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
}

export function SectionHeader({
  kicker,
  title,
  description,
  actions,
  size = "section",
  level = 2,
  className,
}: SectionHeaderProps) {
  const titleClass = size === "page" ? "text-display" : "text-headline";
  const descClass = "text-body text-muted-foreground";
  const Heading = `h${level}` as ElementType;

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
        <Heading
          className={cn(titleClass, "font-bold tracking-tight text-foreground")}
        >
          {title}
        </Heading>
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

SectionHeader.displayName = "SectionHeader";
