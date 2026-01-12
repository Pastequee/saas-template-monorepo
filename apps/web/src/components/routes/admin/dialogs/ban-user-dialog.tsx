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
import { Input } from '~/components/ui/input'
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

// Ban duration options in seconds
const BAN_DURATIONS = [
	{ label: '1 Hour', value: 60 * 60 },
	{ label: '1 Day', value: 60 * 60 * 24 },
	{ label: '1 Week', value: 60 * 60 * 24 * 7 },
	{ label: '1 Month', value: 60 * 60 * 24 * 30 },
	{ label: 'Permanent', value: 0 },
] as const

type Props = {
	user: UserWithRole
	open: boolean
	onOpenChange: (open: boolean) => void
	onSuccess: () => void
}

export function BanUserDialog({ user, open, onOpenChange, onSuccess }: Props) {
	const isBanned = user.banned ?? false

	// Form state for ban action
	const [banReason, setBanReason] = useState('')
	const [banDuration, setBanDuration] = useState<number>(60 * 60 * 24) // Default: 1 day
	const [isSubmitting, setIsSubmitting] = useState(false)

	const handleBan = async () => {
		setIsSubmitting(true)

		const result = await authClient.admin.banUser({
			userId: user.id,
			banReason: banReason || undefined,
			// 0 = permanent ban (no expiry)
			banExpiresIn: banDuration === 0 ? undefined : banDuration,
		})

		setIsSubmitting(false)

		if (result.error) {
			toast.error(result.error.message ?? 'Failed to ban user')
			return
		}

		toast.success(`${user.name} has been blocked`)
		resetForm()
		onOpenChange(false)
		onSuccess()
	}

	const handleUnban = async () => {
		setIsSubmitting(true)

		const result = await authClient.admin.unbanUser({
			userId: user.id,
		})

		setIsSubmitting(false)

		if (result.error) {
			toast.error(result.error.message ?? 'Failed to unban user')
			return
		}

		toast.success(`${user.name} has been unblocked`)
		onOpenChange(false)
		onSuccess()
	}

	const resetForm = () => {
		setBanReason('')
		setBanDuration(60 * 60 * 24)
	}

	const handleOpenChange = (newOpen: boolean) => {
		if (!newOpen) {
			resetForm()
		}
		onOpenChange(newOpen)
	}

	// Different dialog content based on current ban status
	if (isBanned) {
		return (
			<Dialog onOpenChange={handleOpenChange} open={open}>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Unblock User</DialogTitle>
						<DialogDescription>
							Remove the block on <span className="font-medium">{user.email}</span>
						</DialogDescription>
					</DialogHeader>

					{user.banReason && (
						<div className="rounded-md bg-muted p-3 text-sm">
							<p className="font-medium text-muted-foreground">Current ban reason:</p>
							<p>{user.banReason}</p>
						</div>
					)}

					<DialogFooter>
						<Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
							Cancel
						</Button>
						<Button disabled={isSubmitting} onClick={handleUnban}>
							{isSubmitting ? 'Unblocking...' : 'Unblock User'}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		)
	}

	return (
		<Dialog onOpenChange={handleOpenChange} open={open}>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Block User</DialogTitle>
					<DialogDescription>
						Block <span className="font-medium">{user.email}</span> from accessing the platform
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-4">
					<div className="space-y-2">
						<Label htmlFor="ban-reason">Reason (optional)</Label>
						<Input
							id="ban-reason"
							onChange={(e) => setBanReason(e.target.value)}
							placeholder="Enter a reason for blocking..."
							value={banReason}
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="ban-duration">Duration</Label>
						<Select onValueChange={(v) => setBanDuration(Number(v))} value={String(banDuration)}>
							<SelectTrigger id="ban-duration">
								<SelectValue>Select duration</SelectValue>
							</SelectTrigger>
							<SelectContent>
								{BAN_DURATIONS.map((d) => (
									<SelectItem key={d.value} value={String(d.value)}>
										{d.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
				</div>

				<DialogFooter>
					<Button onClick={() => handleOpenChange(false)} type="button" variant="outline">
						Cancel
					</Button>
					<Button disabled={isSubmitting} onClick={handleBan} variant="destructive">
						{isSubmitting ? 'Blocking...' : 'Block User'}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
