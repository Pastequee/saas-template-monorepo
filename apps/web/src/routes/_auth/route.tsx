import { createFileRoute, Outlet, redirect } from '@tanstack/react-router'
import z from 'zod'

export const Route = createFileRoute('/_auth')({
	component: AuthLayout,
	beforeLoad: ({ context }) => {
		// If user is already authenticated, redirect to home
		if (context.auth) {
			throw redirect({ to: '/' })
		}
	},
	validateSearch: z.object({
		redirect: z.string().optional(),
	}),
})

function AuthLayout() {
	return (
		<main className="flex flex-1 items-center justify-center">
			<Outlet />
		</main>
	)
}
