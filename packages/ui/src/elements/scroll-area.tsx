import { ScrollArea as ScrollAreaPrimitive } from "@base-ui/react/scroll-area";
import type { Ref } from "react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

interface ScrollAreaProps extends ScrollAreaPrimitive.Root.Props {
  viewportClassName?: string;
  contentClassName?: string;
  viewportRef?: Ref<HTMLDivElement>;
  contentRef?: Ref<HTMLDivElement>;
}

function ScrollArea({
  className,
  viewportClassName,
  contentClassName,
  viewportRef,
  contentRef,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollAreaPrimitive.Root
      data-slot="scroll-area"
      className={cn("relative", className)}
      {...props}
    >
      <ScrollAreaPrimitive.Viewport
        ref={viewportRef}
        data-slot="scroll-area-viewport"
        className={cn(
          "size-full rounded-[inherit] transition-[color,box-shadow] outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1",
          viewportClassName
        )}
      >
        <ScrollAreaPrimitive.Content
          ref={contentRef}
          data-slot="scroll-area-content"
          className={contentClassName}
        >
          {children}
        </ScrollAreaPrimitive.Content>
      </ScrollAreaPrimitive.Viewport>
      <ScrollBar />
      <ScrollAreaPrimitive.Corner />
    </ScrollAreaPrimitive.Root>
  );
}

function ScrollBar({
  className,
  orientation = "vertical",
  ...props
}: ScrollAreaPrimitive.Scrollbar.Props) {
  return (
    <ScrollAreaPrimitive.Scrollbar
      data-slot="scroll-area-scrollbar"
      data-orientation={orientation}
      orientation={orientation}
      className={cn(
        "flex touch-none p-px transition-colors select-none data-horizontal:h-2.5 data-horizontal:flex-col data-horizontal:border-t data-horizontal:border-t-transparent data-vertical:h-full data-vertical:w-2.5 data-vertical:border-l data-vertical:border-l-transparent",
        className
      )}
      {...props}
    >
      <ScrollAreaPrimitive.Thumb
        data-slot="scroll-area-thumb"
        className="relative w-1.5 flex-1 rounded-full bg-border-strong transition-colors hover:bg-foreground/30"
      />
    </ScrollAreaPrimitive.Scrollbar>
  );
}

export { ScrollArea, ScrollBar };
