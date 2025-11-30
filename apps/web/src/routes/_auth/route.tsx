import { createFileRoute, Outlet } from '@tanstack/react-router'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/_auth')({
	component: AuthLayout,
})

function AuthLayout() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 items-center justify-center">
				<Outlet />
			</main>
		</div>
	)
}
