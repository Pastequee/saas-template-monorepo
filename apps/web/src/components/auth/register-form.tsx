import { useRouter } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import z from 'zod'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { authClient } from '~/lib/auth-client'
import { useAppForm } from '~/lib/hooks/form-hook'
import { PasswordInput } from '../ui/password-input'

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
		</form>
	)
}
