import { useState } from 'react'
import { toast } from 'sonner'
import z from 'zod'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { PasswordInput } from '~/components/ui/password-input'
import { authClient } from '~/lib/clients/auth-client'
import { useAppForm } from '~/lib/hooks/form-hook'

// User type matching the admin API response
type AdminUser = {
	id: string
	name: string
	email: string
}

type Props = {
	user: AdminUser
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

const passwordSchema = z
	.object({
		newPassword: z.string().min(8, 'Password must be at least 8 characters'),
		confirmPassword: z.string().nonempty('Please confirm the password'),
	})
	.refine((data) => data.newPassword === data.confirmPassword, {
		message: 'Passwords do not match',
		path: ['confirmPassword'],
	})

export function ChangePasswordDialog({ user, open, onOpenChange, onSuccess }: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const form = useAppForm({
		defaultValues: { newPassword: '', confirmPassword: '' },
		validators: { onChange: passwordSchema, onMount: passwordSchema, onSubmit: passwordSchema },
		onSubmit: async ({ value }) => {
			setIsSubmitting(true)

			const result = await authClient.admin.setUserPassword({
				userId: user.id,
				newPassword: value.newPassword,
			})

			setIsSubmitting(false)

			if (result.error) {
				toast.error(result.error.message ?? 'Failed to change password')
				return
			}

			toast.success(`Password changed for ${user.name}`)
			form.reset()
			onOpenChange(false)
			onSuccess()
		},
	})

	// Reset form when dialog closes
	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			form.reset()
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Password</DialogTitle>
					<DialogDescription>
						Set a new password for <span className="font-medium">{user.email}</span>
					</DialogDescription>
				</DialogHeader>

				<form
					className="flex flex-col gap-4"
					onSubmit={(e) => {
						e.preventDefault()
						form.handleSubmit()
					}}
				>
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
								label="Confirm Password"
							/>
						)}
					</form.AppField>

					<DialogFooter>
						<Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
							Cancel
						</Button>
						<form.AppForm>
							<form.SubmitButton label={isSubmitting ? 'Saving...' : 'Change Password'} />
						</form.AppForm>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
	)
}
