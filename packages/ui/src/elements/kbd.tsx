import { cn } from "@__APP_NAME__/ui/utils/cn";

function Kbd({ className, style, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      data-slot="kbd"
      className={cn(
        "pointer-events-none inline-flex h-5 items-center justify-center rounded-sm border border-border-strong bg-muted px-1.5 text-xs text-muted-foreground select-none",
        className
      )}
      style={{ fontFamily: "var(--font-mono)", ...style }}
      {...props}
    />
  );
}

function KbdGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <kbd
      data-slot="kbd-group"
      className={cn("inline-flex items-center gap-1", className)}
      {...props}
    />
  );
}

export { Kbd, KbdGroup };
