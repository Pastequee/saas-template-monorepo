import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { SubmitButton } from '~/components/ui/form-fields/submit-button'
import { TextField } from '~/components/ui/form-fields/text-field'

const { fieldContext, formContext, useFieldContext, useFormContext } =
  createFormHookContexts()

const { useAppForm } = createFormHook({
  fieldComponents: { TextField },
  fieldContext,
  formComponents: { SubmitButton },
  formContext,
})

export { useAppForm, useFieldContext, useFormContext }
