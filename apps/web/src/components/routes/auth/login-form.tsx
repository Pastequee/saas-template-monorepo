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
	email: z.string().nonempty('Email is required'),
	password: z.string().nonempty('Password is required'),
})

const loginFormOptions = formOptions({
	defaultValues: { email: '', password: '' },
	validators: { onSubmit: formSchema },
})

export const LoginForm = () => {
	const router = useRouter()
	const { redirect } = useSearch({ from: '/_auth' })

	const [errorMessage, setErrorMessage] = useState<string>()

	const form = useAppForm({
		...loginFormOptions,
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			})

			if (error) {
				setErrorMessage(error.message ?? DEFAULT_ERROR_MESSAGE)
				return
			}

			router.navigate({ replace: true, to: redirect ?? '/' })
		},
	})

	return (
		<form
			className="flex flex-col gap-4"
			noValidate
			onSubmit={(e) => {
				e.preventDefault()
				e.stopPropagation()
				form.handleSubmit()
			}}
		>
			{errorMessage && (
				<Alert variant="destructive">
					<AlertCircle />
					<AlertTitle>{errorMessage}</AlertTitle>
				</Alert>
			)}

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
				children={(field) => (
					<field.TextField
						autoComplete="current-password"
						label="Mot de passe"
						placeholder="••••••••"
						type="password"
					/>
				)}
				name="password"
			/>

			<form.AppForm>
				<form.SubmitButton>Sign in</form.SubmitButton>
			</form.AppForm>

			<div className="my-2 flex items-center gap-4">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-sm">OU</span>
				<Separator className="flex-1" />
			</div>

			<GoogleSignInButton onError={setErrorMessage} />
		</form>
	)
}
