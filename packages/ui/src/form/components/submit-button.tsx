import type { ReactNode } from "react";

import { Button } from "@__APP_NAME__/ui/elements/button";
import { useFormContext } from "@__APP_NAME__/ui/elements/tanstack-form";

interface SubmitButtonProps {
  children: ReactNode;
  loadingChildren?: ReactNode;
  className?: string;
  "data-testid"?: string;
}

function SubmitButton({
  children,
  loadingChildren,
  className,
  "data-testid": testId,
}: SubmitButtonProps) {
  const form = useFormContext();

  return (
    <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
      {([canSubmit, isSubmitting]) => (
        <Button
          data-testid={testId}
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className={className}
        >
          {isSubmitting ? (loadingChildren ?? children) : children}
        </Button>
      )}
    </form.Subscribe>
  );
}

SubmitButton.displayName = "SubmitButton";

export { SubmitButton };
