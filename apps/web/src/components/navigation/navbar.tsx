import { Link } from '@tanstack/react-router'
import { useAuth } from '~/lib/hooks/use-auth'
import { LoggedIn } from '../auth/logged-in'
import { LoggedOut } from '../auth/logged-out'
import { ThemeSwitcher } from '../ui/theme-switcher'
import { NavbarLink } from './navbar-link'

export const Navbar = () => {
	const auth = useAuth()
	const isAdmin = auth?.user.role === 'admin'

	return (
		<header className="sticky top-0 z-10 flex items-center justify-center gap-4 bg-background p-4">
			<nav className="flex max-w-7xl flex-1 items-center justify-end gap-4">
				<Link className="mr-auto font-bold text-2xl" to="/">
					Awesome Todo App
				</Link>
				<ThemeSwitcher />
				<LoggedOut>
					<div className="flex gap-2">
						<NavbarLink to="/login">Login</NavbarLink>
						<NavbarLink to="/register">Register</NavbarLink>
					</div>
				</LoggedOut>
				<LoggedIn>
					{isAdmin && <NavbarLink to="/admin/users">Admin</NavbarLink>}
					<NavbarLink to="/account">Account</NavbarLink>
				</LoggedIn>
			</nav>
		</header>
	)
}
