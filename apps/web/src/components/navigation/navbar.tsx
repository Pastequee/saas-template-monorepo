import { Link } from '@tanstack/react-router'
import { LogOut, User } from 'lucide-react'
import { useAuth } from '~/lib/hooks/use-auth'
import { Button } from '../ui/button'

export const Navbar = () => {
	const auth = useAuth()

	if (!auth) return null

	return (
		<header className="sticky top-0 z-10 flex items-center justify-center gap-4 border-b bg-background p-4">
			<nav className="flex max-w-7xl flex-1 items-center justify-end gap-4">
				<Link className="mr-auto font-bold text-2xl text-primary" to="/">
					BonnesAffaires
				</Link>

				<Button nativeButton={false} render={<Link to="/account" />} variant="ghost">
					<User />
					{auth.user.name}
				</Button>

				<Button onClick={auth.logout} variant="ghost">
					<LogOut />
					Se déconnecter
				</Button>
			</nav>
		</header>
	)
}
