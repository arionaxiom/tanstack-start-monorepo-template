import { formOptions } from "@tanstack/form-core";

import { signInSchema } from "@__APP_NAME__/types/forms";

export const signInFormOpts = formOptions({
  defaultValues: {
    email: "",
    password: "",
  },
  validators: {
    onSubmit: signInSchema,
  },
});
