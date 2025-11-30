import { createFileRoute, redirect } from '@tanstack/react-router'
import { LogoutButton } from '~/components/auth/logout-button'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/account')({
	component: Account,
	beforeLoad: ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: '/login' })
		}

		return { auth: context.auth }
	},
})

function Account() {
	const { auth } = Route.useRouteContext()

	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col items-center justify-center gap-2">
				<h1>Account</h1>
				<p>User: {auth.user.email}</p>
				<LogoutButton />
			</main>
			<Footer />
		</div>
	)
}
