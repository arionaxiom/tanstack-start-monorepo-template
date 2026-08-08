import * as React from "react";

import { Label } from "@__APP_NAME__/ui/elements/label";
import {
  FormItemContext,
  useFieldContext,
} from "@__APP_NAME__/ui/elements/tanstack-form";
import { cn } from "@__APP_NAME__/ui/utils/cn";

/**
 * Base props that every form field component registered in `createFormHook`
 * MUST extend. This enforces R15 (data-testid passthrough) at the type level.
 *
 * When creating a new form field component in this directory, extend this
 * interface and destructure + forward `data-testid` to the underlying DOM
 * element.
 */
export interface FormFieldBaseProps {
  "data-testid"?: string;
}

function FormItem({ className, ...props }: React.ComponentProps<"div">) {
  const id = React.useId();

  return (
    <FormItemContext value={{ id }}>
      <div
        data-slot="form-item"
        className={cn("grid gap-2", className)}
        {...props}
      />
    </FormItemContext>
  );
}

function FormLabel({ className, ...props }: React.ComponentProps<"label">) {
  const field = useFieldContext();
  const hasError = field.state.meta.errors.length > 0;

  return (
    <Label
      data-slot="form-label"
      data-error={hasError}
      className={cn("data-[error=true]:text-destructive-emphasis", className)}
      htmlFor={field.formItemId}
      {...props}
    />
  );
}

function FormControl({
  children,
  ...props
}: React.PropsWithChildren<React.HTMLAttributes<HTMLElement>>) {
  const field = useFieldContext();
  const hasError = field.state.meta.errors.length > 0;

  const child = React.Children.only(children);
  if (!React.isValidElement(child)) return <>{children}</>;

  const formControlProps: Record<string, unknown> = {
    "data-slot": "form-control",
    id: field.formItemId,
    "aria-describedby": !hasError
      ? field.formDescriptionId
      : `${field.formDescriptionId} ${field.formMessageId}`,
    "aria-invalid": hasError,
    ...props,
  };

  return React.cloneElement(
    child as React.ReactElement<Record<string, unknown>>,
    formControlProps
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
      className={cn("text-sm text-destructive-emphasis", className)}
      {...props}
    >
      {body}
    </p>
  );
}

export { FormItem, FormLabel, FormControl, FormDescription, FormMessage };
