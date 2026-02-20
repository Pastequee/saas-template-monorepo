import { formOptions } from '@tanstack/react-form'
import { useRouter, useSearch } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { z } from 'zod'

import { Alert, AlertTitle } from '~/components/ui/alert'
import { Separator } from '~/components/ui/separator'
import { authClient } from '~/lib/clients/auth-client'
import { useAppForm } from '~/lib/hooks/form-hook'
import { DEFAULT_ERROR_MESSAGE } from '~/lib/utils/constants'

import { GoogleSignInButton } from './google-sign-in-button'

const formSchema = z.object({
	email: z.email('Invalid email address').nonempty('Name is required'),
	name: z.string().nonempty('Name is required'),
	password: z.string().nonempty('Name is required').min(8, 'Must be at least 8 characters long'),
})

const registerFormOptions = formOptions({
	defaultValues: { email: '', name: '', password: '' },
	validators: { onSubmit: formSchema },
})

export const RegisterForm = () => {
	const router = useRouter()
	const { redirect } = useSearch({ from: '/_auth' })

	const [signUpResponseError, setSignUpResponseError] = useState<string>()

	const form = useAppForm({
		...registerFormOptions,
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signUp.email({
				email: value.email,
				name: value.name,
				password: value.password,
			})

			if (error) {
				setSignUpResponseError(error.message ?? DEFAULT_ERROR_MESSAGE)
				return
			}

			router.navigate({ replace: true, to: redirect ?? '/login' })
		},
	})

	return (
		<form
			className="flex flex-col gap-4"
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
		>
			{signUpResponseError && (
				<Alert variant="destructive">
					<AlertCircle />
					<AlertTitle>{signUpResponseError}</AlertTitle>
				</Alert>
			)}

			<form.AppField
				children={(field) => (
					<field.TextField autoComplete="name" label="Nom" placeholder="Votre nom" />
				)}
				name="name"
			/>

			<form.AppField
				children={(field) => (
					<field.TextField
						autoComplete="email"
						label="Email"
						placeholder="votre@email.com"
						type="email"
					/>
				)}
				name="email"
			/>

			<form.AppField
				children={(field) => <field.TextField label="Mot de passe" placeholder="••••••••" />}
				name="password"
			/>

			<form.AppForm>
				<form.SubmitButton>Créer un compte</form.SubmitButton>
			</form.AppForm>

			<div className="my-2 flex items-center gap-4">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-sm">OU</span>
				<Separator className="flex-1" />
			</div>

			<GoogleSignInButton onError={setSignUpResponseError} />
		</form>
	)
}
