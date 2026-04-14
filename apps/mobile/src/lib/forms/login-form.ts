import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'

import { authClient } from '~/lib/auth/auth-client'
import { DEFAULT_ERROR_MESSAGE } from '~/lib/constants'

const loginSchema = z.object({
	email: z.string().trim().min(1, 'Email requis').email('Adresse email invalide'),
	password: z.string().nonempty('Mot de passe requis'),
})

export const useLoginForm = ({ onSuccess }: { onSuccess: () => void }) => {
	const [formError, setFormError] = useState<string>()

	const form = useForm({
		defaultValues: {
			email: '',
			password: '',
		},
		onSubmit: async ({ value }) => {
			setFormError(undefined)

			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			})

			if (error) {
				setFormError(error.message ?? DEFAULT_ERROR_MESSAGE)
				return
			}

			onSuccess()
		},
		validators: {
			onChange: loginSchema,
			onSubmit: loginSchema,
		},
	})

	return { form, formError }
}
