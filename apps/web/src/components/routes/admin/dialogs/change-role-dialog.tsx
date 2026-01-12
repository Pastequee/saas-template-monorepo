import { UserRole } from '@repo/db/types'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from '~/components/ui/dialog'
import { Label } from '~/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '~/components/ui/select'
import { authClient } from '~/lib/clients/auth-client'
import type { UserWithRole } from '~/lib/queries/admin.queries'

type Props = {
	user: UserWithRole
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

export function ChangeRoleDialog({ user, open, onOpenChange, onSuccess }: Props) {
	const currentRole = user.role
	const [selectedRole, setSelectedRole] = useState(currentRole)
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleSubmit = async () => {
		if (selectedRole === currentRole) {
			onOpenChange(false)
			return
		}

		setIsSubmitting(true)

		const result = await authClient.admin.setRole({
			userId: user.id,
			role: selectedRole,
		})

		setIsSubmitting(false)

		if (result.error) {
			toast.error(result.error.message ?? 'Failed to change role')
			return
		}

		toast.success(`Role changed to ${selectedRole} for ${user.name}`)
		onOpenChange(false)
		onSuccess()
	}

	// Reset selection when dialog opens
	const handleOpenChange = (newOpen: boolean) => {
		if (newOpen) {
			setSelectedRole(currentRole)
		}
		onOpenChange(newOpen)
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Change Role</DialogTitle>
					<DialogDescription>
						Change the role for <span className="font-medium">{user.email}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-2">
					<Label htmlFor="role-select">Role</Label>
					<Select onValueChange={(v) => setSelectedRole(v as UserRole)} value={selectedRole}>
						<SelectTrigger id="role-select">
							<SelectValue>Select a role</SelectValue>
						</SelectTrigger>

						<SelectContent>
							{UserRole.map((role) => (
								<SelectItem key={role} value={role}>
									{role.charAt(0).toUpperCase() + role.slice(1)}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
					<p className="text-muted-foreground text-xs">
						{selectedRole === 'admin' && 'Full access to all features including user management'}
						{selectedRole === 'user' && 'Standard user access'}
					</p>
				</div>

				<DialogFooter>
					<Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
						Cancel
					</Button>
					<Button disabled={isSubmitting || selectedRole === currentRole} onClick={handleSubmit}>
						{isSubmitting ? 'Saving...' : 'Change Role'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
