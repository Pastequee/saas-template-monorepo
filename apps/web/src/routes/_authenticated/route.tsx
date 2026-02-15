import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/_authenticated')({
	beforeLoad: ({ context, location }) => {
		if (!context.auth) {
			throw redirect({ to: '/login', search: { redirect: location.pathname } })
		}
		return { auth: context.auth }
	},
	component: RouteComponent,
})

function RouteComponent() {
	return (
		<div className="flex flex-1 flex-col">
			<Navbar />
			<main className="flex w-screen flex-1 flex-col items-center">
				<Outlet />
			</main>
		</div>
	)
}
