import type { Label as LabelPrimitive } from "radix-ui";
import { Slot } from "radix-ui";
import * as React from "react";

import { Label } from "@__APP_NAME__/ui/elements/label";
import {
  FormItemContext,
  useFieldContext,
} from "@__APP_NAME__/ui/elements/tanstack-form";
import { cn } from "@__APP_NAME__/ui/utils/index";

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext.Provider value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext.Provider>
  );
}

function FormLabel({
  className,
  ...props
}: React.ComponentProps<typeof LabelPrimitive.Root>) {
  const field = useFieldContext();
  const hasError = field.state.meta.errors.length > 0;

  return (
    <Label
      data-slot="form-label"
      data-error={hasError}
      className={cn("data-[error=true]:text-destructive", className)}
      htmlFor={field.formItemId}
      {...props}
    />
  );
}

function FormControl({ ...props }: React.ComponentProps<typeof Slot.Root>) {
  const field = useFieldContext();
  const hasError = field.state.meta.errors.length > 0;

  return (
    <Slot.Root
      data-slot="form-control"
      id={field.formItemId}
      aria-describedby={
        !hasError
          ? field.formDescriptionId
          : `${field.formDescriptionId} ${field.formMessageId}`
      }
      aria-invalid={hasError}
      {...props}
    />
  );
}

function FormDescription({ className, ...props }: React.ComponentProps<"p">) {
  const field = useFieldContext();

  return (
    <p
      data-slot="form-description"
      id={field.formDescriptionId}
      className={cn("text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

function FormMessage({ className, ...props }: React.ComponentProps<"p">) {
  const field = useFieldContext();
  const errors = field.state.meta.errors;
  const body =
    errors.length > 0 ? String(errors[0]?.message ?? errors[0] ?? "") : null;

  if (!body) {
    return null;
  }

  return (
    <p
      data-slot="form-message"
      id={field.formMessageId}
      className={cn("text-sm text-destructive", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage };
