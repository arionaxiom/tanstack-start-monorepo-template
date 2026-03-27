import type { ReactNode } from "react";

import { Input } from "@__APP_NAME__/ui/elements/input";
import { useFieldContext } from "@__APP_NAME__/ui/elements/tanstack-form";

import { FormControl, FormItem, FormLabel, FormMessage } from "./common";

interface FormInputProps {
  label?: ReactNode;
  placeholder?: string;
  "data-testid"?: string;
  type?: string;
  autoComplete?: string;
}

function FormInput({
  label,
  placeholder,
  "data-testid": testId,
  type,
  autoComplete,
}: FormInputProps) {
  const field = useFieldContext<string>();

  return (
    <FormItem>
      {label && <FormLabel>{label}</FormLabel>}
      <FormControl>
        <Input
          data-testid={testId}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          value={field.state.value}
          onBlur={field.handleBlur}
          onChange={(e) => field.handleChange(e.target.value)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

export { FormInput };
