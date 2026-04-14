import { useForm } from '@tanstack/react-form'
import { useState } from 'react'
import { z } from 'zod'

import { authClient } from '~/lib/auth/auth-client'
import { DEFAULT_ERROR_MESSAGE } from '~/lib/constants'

const registerSchema = z.object({
	email: z.string().trim().min(1, 'Email requis').email('Adresse email invalide'),
	name: z.string().trim().min(1, 'Nom requis'),
	password: z
		.string()
		.min(8, 'Le mot de passe doit contenir au moins 8 caracteres')
		.nonempty('Mot de passe requis'),
})

export const useRegisterForm = ({ onSuccess }: { onSuccess: () => void }) => {
	const [formError, setFormError] = useState<string>()

	const form = useForm({
		defaultValues: {
			email: '',
			name: '',
			password: '',
		},
		onSubmit: async ({ value }) => {
			setFormError(undefined)

			const { error } = await authClient.signUp.email({
				email: value.email,
				name: value.name,
				password: value.password,
			})

			if (error) {
				setFormError(error.message ?? DEFAULT_ERROR_MESSAGE)
				return
			}

			onSuccess()
		},
		validators: {
			onChange: registerSchema,
			onSubmit: registerSchema,
		},
	})

	return { form, formError }
}
