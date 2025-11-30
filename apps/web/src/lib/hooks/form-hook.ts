import { createFormHook, createFormHookContexts } from '@tanstack/react-form'

import { SubmitButton } from '~/components/ui/form-fields/submit-button'
import { TextField } from '~/components/ui/form-fields/text-field'

const { fieldContext, formContext, useFieldContext, useFormContext } = createFormHookContexts()

export const { useAppForm, withFieldGroup, withForm } = createFormHook({
	fieldComponents: { TextField },
	fieldContext,
	formComponents: { SubmitButton },
	formContext,
})

export { useFieldContext, useFormContext }
