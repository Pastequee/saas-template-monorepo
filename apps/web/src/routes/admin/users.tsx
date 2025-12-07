import { createFileRoute, redirect } from '@tanstack/react-router'
import { UsersTable } from '~/components/admin/users-table'
import { Footer } from '~/components/footer'
import { Navbar } from '~/components/navigation/navbar'

export const Route = createFileRoute('/admin/users')({
	component: AdminUsersPage,
	beforeLoad: ({ context }) => {
		if (!context.auth) {
			throw redirect({ to: '/login' })
		}

		if (context.auth.user.role !== 'admin') {
			throw redirect({ to: '/' })
		}

		return { auth: context.auth }
	},
})

function AdminUsersPage() {
	return (
		<div className="flex min-h-screen flex-col">
			<Navbar />
			<main className="flex flex-1 flex-col gap-6 px-4 py-8">
				<div className="mx-auto w-full max-w-6xl space-y-6">
					<div>
						<h1 className="font-bold text-2xl">User Management</h1>
						<p className="text-muted-foreground text-sm">Manage users, roles, and permissions</p>
					</div>

					<UsersTable />
				</div>
			</main>
			<Footer />
		</div>
	)
}
