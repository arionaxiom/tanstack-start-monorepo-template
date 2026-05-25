import { type ReactNode } from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

import { SectionHeader } from "./section-header.js";

export interface PageScaffoldProps {
  kicker?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  children: ReactNode;
  width?: "default" | "narrow" | "wide" | "full";
  className?: string;
}

export function PageScaffold({
  kicker,
  title,
  description,
  actions,
  children,
  width = "default",
  className,
}: PageScaffoldProps) {
  const widthClass = {
    narrow: "max-w-2xl",
    default: "max-w-5xl",
    wide: "max-w-7xl",
    full: "max-w-none",
  }[width];

  return (
    <div className={cn("mx-auto px-6 py-6", widthClass, className)}>
      <SectionHeader
        kicker={kicker}
        title={title}
        description={description}
        actions={actions}
        size="page"
      />
      <section>{children}</section>
    </div>
  );
}

PageScaffold.displayName = "PageScaffold";
