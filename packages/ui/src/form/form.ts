import { createFormHook } from "@tanstack/react-form";

import {
  fieldContext,
  formContext,
} from "@__APP_NAME__/ui/elements/tanstack-form";

import { SubmitButton } from "./components/submit-button";
import { FormInput } from "./elements/input";

const { useAppForm, withForm } = createFormHook({
  fieldComponents: {
    FormInput,
  },
  formComponents: {
    SubmitButton,
  },
  fieldContext,
  formContext,
});

export { useAppForm, withForm };
