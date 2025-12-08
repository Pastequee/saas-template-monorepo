import { useRouter } from '@tanstack/react-router'
import { UserCheck } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '~/components/ui/button'
import { authClient } from '~/lib/clients/auth-client'
import { useAuth } from '~/lib/hooks/use-auth'

// Banner shown when an admin is impersonating a user
// Uses better-auth session to detect impersonation status

export function ImpersonationBanner() {
	const auth = useAuth()
	const router = useRouter()
	const [isLoading, setIsLoading] = useState(false)

	if (!auth) return null

	const impersonatedBy = auth.session.impersonatedBy

	if (!impersonatedBy) {
		return null
	}

	const handleStopImpersonation = async () => {
		setIsLoading(true)

		const result = await authClient.admin.stopImpersonating()

		setIsLoading(false)

		if (result.error) {
			toast.error(result.error.message ?? 'Failed to stop impersonation')
			return
		}

		toast.success('Stopped impersonating')

		router.navigate({ to: '/admin/users' })
	}

	return (
		<div className="sticky top-0 z-50 flex w-full items-center justify-center gap-4 bg-amber-500 px-4 py-2 text-amber-950">
			<div className="flex items-center gap-2">
				<UserCheck className="size-4" />
				<span className="font-medium text-sm">
					You are currently impersonating <span className="font-bold">{auth.user.name}</span>
				</span>
			</div>
			<Button
				className="h-7 border-amber-700 bg-amber-600 text-amber-950 hover:bg-amber-400"
				disabled={isLoading}
				onClick={handleStopImpersonation}
				size="sm"
				variant="outline"
			>
				{isLoading ? 'Stopping...' : 'Stop Impersonating'}
			</Button>
		</div>
	)
}
