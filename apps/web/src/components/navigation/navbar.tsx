import { Link } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'

import { Button } from '~/components/ui/button'
import { useAuth } from '~/lib/hooks/use-auth'

export const Navbar = () => {
	const auth = useAuth()

	if (!auth) {
		return null
	}

	return (
		<header className="bg-background sticky top-0 z-10 flex items-center justify-center gap-4 border-b p-4">
			<nav className="flex max-w-7xl flex-1 items-center justify-end gap-4">
				<Link className="text-primary mr-auto text-2xl font-bold" to="/">
					BonnesAffaires
				</Link>

				<Button nativeButton={false} render={<Link to="/account" />} variant="ghost">
					<User />
					{auth.user.name}
				</Button>

				<Button onClick={() => void auth.logout()} variant="ghost">
					<LogOut />
					Se déconnecter
				</Button>
			</nav>
		</header>
	)
}
