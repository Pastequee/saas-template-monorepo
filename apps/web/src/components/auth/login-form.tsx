import { env } from '@repo/env/web'
import { useRouter } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'
import googleIcon from '~/assets/google.svg'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { authClient } from '~/lib/clients/auth-client'
import { useAppForm } from '~/lib/hooks/form-hook'
import { Button } from '../ui/button'
import { PasswordInput } from '../ui/password-input'
import { Separator } from '../ui/separator'

const formSchema = z.object({
	email: z.string().nonempty('Email is required'),
	password: z.string().nonempty('Password is required'),
})

export const LoginForm = () => {
	const router = useRouter()
	const [errorMessage, setErrorMessage] = useState<string>()

	const form = useAppForm({
		defaultValues: { email: '', password: '' },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signIn.email({
				email: value.email,
				password: value.password,
			})

			if (error) {
				setErrorMessage(error.message ?? 'An unknown error occurred, please try again later.')
				return
			}

			router.navigate({ to: '/', replace: true })
		},
		defaultState: {
			canSubmit: false,
		},
		validators: { onChange: formSchema, onMount: formSchema, onSubmit: formSchema },
	})

	const handleSocialSignIn = async ({ provider }: { provider: 'google' }) => {
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: env.VITE_FRONTEND_URL,
		})

		if (error) {
			setErrorMessage(error.message ?? 'An unknown error occurred, please try again later.')
			return
		}
	}

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
				children={(field) => <field.TextField autoComplete="email" label="Email" type="email" />}
				name="email"
			/>

			<form.AppField
				children={(field) => (
					<field.TextField autoComplete="current-password" input={PasswordInput} label="Password" />
				)}
				name="password"
			/>

			<form.AppForm>
				<form.SubmitButton label="Sign in" />
			</form.AppForm>

			<div className="my-2 flex items-center gap-4">
				<Separator className="flex-1" />
				<span className="text-muted-foreground text-sm">OR</span>
				<Separator className="flex-1" />
			</div>

			<Button
				className="w-full"
				onClick={() => handleSocialSignIn({ provider: 'google' })}
				variant="outline"
			>
				<img alt="Google" className="size-4" height={16} src={googleIcon} width={16} />
				Continue with Google
			</Button>
		</form>
	)
}
