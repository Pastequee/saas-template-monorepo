import { createFileRoute, redirect } from '@tanstack/react-router'
import { AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { LogoutButton } from '~/components/auth/logout-button'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'
import { Alert, AlertTitle } from '~/components/ui/alert'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { PasswordInput } from '~/components/ui/password-input'
import { authClient } from '~/lib/clients/auth-client'
import { useAppForm } from '~/lib/hooks/form-hook'

export const Route = createFileRoute('/account')({
	component: Account,
	beforeLoad: ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: '/login' })
		}

		return { user: context.auth.user }
	},
})

function Account() {
	const { user } = Route.useRouteContext()

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col items-center gap-6 px-4 py-8">
				<div className="w-full max-w-lg space-y-6">
					<h1 className="font-bold text-2xl">Account Settings</h1>

					{/* Profile Section - Update name */}
					<ProfileForm defaultName={user.name} />

					{/* Email Section - Update email */}
					<EmailForm currentEmail={user.email} />

					{/* Password Section - Change password */}
					<PasswordForm />

					{/* Logout Section */}
					<Card>
						<CardHeader>
							<CardTitle>Session</CardTitle>
							<CardDescription>Manage your current session</CardDescription>
						</CardHeader>
						<CardContent>
							<LogoutButton />
						</CardContent>
					</Card>
				</div>
			</main>
			<Footer />
		</div>
	)
}

// --- Profile Form ---
// Allows user to update their display name

const profileSchema = z.object({
	name: z.string().nonempty('Name is required'),
})

function ProfileForm({ defaultName }: { defaultName: string }) {
	const [error, setError] = useState<string>()

	const form = useAppForm({
		defaultValues: { name: defaultName },
		validators: { onChange: profileSchema, onMount: profileSchema, onSubmit: profileSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			const result = await authClient.updateUser({
				name: value.name,
			})

			if (result.error) {
				setError(result.error.message ?? 'Failed to update profile')
				return
			}

			toast.success('Profile updated successfully')
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Profile</CardTitle>
				<CardDescription>Update your display name</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					{error && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					)}

					<form.AppField name="name">
						{(field) => <field.TextField autoComplete="name" label="Name" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Update Profile" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}

// --- Email Form ---
// Allows user to change their email address
// Note: Requires changeEmail to be enabled in backend auth config

const emailSchema = z.object({
	newEmail: z.string().email('Invalid email address').nonempty('Email is required'),
})

function EmailForm({ currentEmail }: { currentEmail: string }) {
	const [error, setError] = useState<string>()

	const form = useAppForm({
		defaultValues: { newEmail: '' },
		validators: { onChange: emailSchema, onMount: emailSchema, onSubmit: emailSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			// Skip if same as current email
			if (value.newEmail === currentEmail) {
				setError('New email must be different from current email')
				return
			}

			const result = await authClient.changeEmail({
				newEmail: value.newEmail,
				callbackURL: '/account',
			})

			if (result.error) {
				setError(result.error.message ?? 'Failed to change email')
				return
			}

			toast.success('Verification email sent. Please check your inbox.')
			form.reset()
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Email</CardTitle>
				<CardDescription>
					Current email: <span className="font-medium">{currentEmail}</span>
				</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					{error && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					)}

					<form.AppField name="newEmail">
						{(field) => <field.TextField autoComplete="email" label="New Email" type="email" />}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Change Email" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}

// --- Password Form ---
// Allows user to change their password

const passwordSchema = z
	.object({
		currentPassword: z.string().nonempty('Current password is required'),
		newPassword: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string().nonempty('Please confirm your password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

function PasswordForm() {
	const [error, setError] = useState<string>()

	const form = useAppForm({
		defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
		validators: { onChange: passwordSchema, onMount: passwordSchema, onSubmit: passwordSchema },
		onSubmit: async ({ value }) => {
			setError(undefined)

			const result = await authClient.changePassword({
				currentPassword: value.currentPassword,
				newPassword: value.newPassword,
				revokeOtherSessions: true, // Invalidate other sessions for security
			})

			if (result.error) {
				setError(result.error.message ?? 'Failed to change password')
				return
			}

			toast.success('Password changed successfully')
			form.reset()
		},
	})

	return (
		<Card>
			<CardHeader>
				<CardTitle>Password</CardTitle>
				<CardDescription>Update your password</CardDescription>
			</CardHeader>
			<CardContent>
				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
					{error && (
						<Alert variant="destructive">
							<AlertCircle />
							<AlertTitle>{error}</AlertTitle>
						</Alert>
					)}

					<form.AppField name="currentPassword">
						{(field) => (
							<field.TextField
								autoComplete="current-password"
								input={PasswordInput}
								label="Current Password"
							/>
						)}
					</form.AppField>

					<form.AppField name="newPassword">
						{(field) => (
							<field.TextField
								autoComplete="new-password"
								input={PasswordInput}
								label="New Password"
							/>
						)}
					</form.AppField>

					<form.AppField name="confirmPassword">
						{(field) => (
							<field.TextField
								autoComplete="new-password"
								input={PasswordInput}
								label="Confirm New Password"
							/>
						)}
					</form.AppField>

					<form.AppForm>
						<form.SubmitButton label="Change Password" />
					</form.AppForm>
				</form>
			</CardContent>
		</Card>
	)
}
