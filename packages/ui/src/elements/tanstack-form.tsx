import { createFormHookContexts } from "@tanstack/react-form";
import * as React from "react";

const {
  fieldContext,
  formContext,
  useFieldContext: _useFieldContext,
  useFormContext,
} = createFormHookContexts();

type FormItemContextValue = {
  id: string;
};

const FormItemContext = React.createContext<FormItemContextValue>(
  {} as FormItemContextValue
);

function useFieldContext<TData>() {
  const field = _useFieldContext<TData>();
  const itemContext = React.useContext(FormItemContext);
  const { id } = itemContext;

  return Object.assign(field, {
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
  });
}

export {
  fieldContext,
  formContext,
  useFieldContext,
  useFormContext,
  FormItemContext,
};
export type { FormItemContextValue };
