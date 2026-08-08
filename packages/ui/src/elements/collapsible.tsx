import { Collapsible as CollapsiblePrimitive } from "@base-ui/react/collapsible";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Collapsible({ ...props }: CollapsiblePrimitive.Root.Props) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />;
}

function CollapsibleTrigger({
  className,
  ...props
}: CollapsiblePrimitive.Trigger.Props) {
  return (
    <CollapsiblePrimitive.Trigger
      data-slot="collapsible-trigger"
      className={cn(
        "duration-fast flex w-full items-center justify-between px-3 py-2 text-left text-sm font-medium transition-colors ease-standard hover:bg-muted/50",
        className
      )}
      {...props}
    />
  );
}

function CollapsibleContent({
  className,
  ...props
}: CollapsiblePrimitive.Panel.Props) {
  return (
    <CollapsiblePrimitive.Panel
      data-slot="collapsible-content"
      className={cn(
        "duration-default h-(--collapsible-panel-height) overflow-hidden transition-[height] ease-standard data-ending-style:h-0 data-starting-style:h-0 motion-reduce:transition-none",
        className
      )}
      {...props}
    />
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
