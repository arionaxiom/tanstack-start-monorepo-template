import { Loader2Icon } from "lucide-react";

import { cn } from "@__APP_NAME__/ui/utils/cn";

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <Loader2Icon
      data-slot="spinner"
      role="status"
      aria-label="Loading"
      className={cn("size-4 animate-spin stroke-primary stroke-2", className)}
      {...props}
    />
  );
}

export { Spinner };
