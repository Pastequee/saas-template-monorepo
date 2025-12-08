import { AlertTriangle } from 'lucide-react'
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
import { authClient } from '~/lib/clients/auth-client'
import type { UserWithRole } from '~/lib/queries/admin.queries'

type Props = {
	user: UserWithRole
	open: boolean
	onOpenChange: (open: boolean) => void
}

export function ImpersonateConfirmDialog({ user, open, onOpenChange }: Props) {
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleImpersonate = async () => {
		setIsSubmitting(true)

		const result = await authClient.admin.impersonateUser({
			userId: user.id,
		})

		setIsSubmitting(false)

		if (result.error) {
			toast.error(result.error.message ?? 'Failed to impersonate user')
			return
		}

		toast.success(`Now impersonating ${user.name}`)

		// Reload the page to reflect the impersonated session
		window.location.href = '/'
	}

	return (
		<Dialog onOpenChange={onOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<AlertTriangle className="size-5 text-amber-500" />
						Impersonate User
					</DialogTitle>
					<DialogDescription>
						You are about to impersonate <span className="font-medium">{user.email}</span>
					</DialogDescription>
				</DialogHeader>

				<div className="rounded-md border border-amber-200 bg-amber-50 p-4 text-amber-800 text-sm dark:border-amber-800 dark:bg-amber-950 dark:text-amber-200">
					<p className="font-medium">Warning</p>
					<p className="mt-1">
						While impersonating, you will see the application as this user sees it. Any actions you
						take will be performed as this user.
					</p>
					<p className="mt-2">
						To stop impersonating, use the stop impersonation button or sign out.
					</p>
				</div>

				<DialogFooter>
					<Button onClick={() => onOpenChange(false)} type="button" variant="outline">
						Cancel
					</Button>
					<Button disabled={isSubmitting} onClick={handleImpersonate}>
						{isSubmitting ? 'Starting...' : 'Start Impersonation'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
