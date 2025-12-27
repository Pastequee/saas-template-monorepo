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
	email: z.email('Invalid email address').nonempty('Name is required'),
	name: z.string().nonempty('Name is required'),
	password: z.string().nonempty('Name is required').min(8, 'Must be at least 8 characters long'),
})

export const RegisterForm = () => {
	const router = useRouter()
	const [signUpResponseError, setSignUpResponseError] = useState<string>()

	const form = useAppForm({
		defaultValues: { email: '', name: '', password: '' },
		onSubmit: async ({ value }) => {
			const { error } = await authClient.signUp.email({
				email: value.email,
				password: value.password,
				name: value.name,
			})

			if (error) {
				setSignUpResponseError(
					error.message ?? 'An unknown error occurred, please try again later.'
				)
				return
			}

			router.navigate({ to: '/login', replace: true })
		},
		validators: { onChange: formSchema, onMount: formSchema, onSubmit: formSchema },
	})

	const handleSocialSignIn = async ({ provider }: { provider: 'google' }) => {
		const { error } = await authClient.signIn.social({
			provider,
			callbackURL: env.VITE_FRONTEND_URL,
		})

		if (error) {
			setSignUpResponseError(error.message ?? 'An unknown error occurred, please try again later.')
			return
		}
	}

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
				children={(field) => <field.TextField autoComplete="name" label="Name" />}
				name="name"
			/>

			<form.AppField
				children={(field) => <field.TextField autoComplete="email" label="Email" type="email" />}
				name="email"
			/>

			<form.AppField
				children={(field) => <field.TextField input={PasswordInput} label="Password" />}
				name="password"
			/>

			<form.AppForm>
				<form.SubmitButton label="Create account" />
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
