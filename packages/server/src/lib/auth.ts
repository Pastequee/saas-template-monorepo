import auth from '@repo/auth'
import { AuthRole } from '@repo/db/types'
import { Elysia } from 'elysia'

const AuthService = {
	isValidAuthRole: (role: string | null | undefined): role is AuthRole => {
		if (!role) return false
		return AuthRole.includes(role as AuthRole)
	},

	hasAuthRole: <TRole extends AuthRole>(role: AuthRole, askedRole: TRole): role is TRole =>
		role === askedRole,
}

export const authMacro = new Elysia({ name: 'auth-macro' })
	.macro('auth', {
		resolve: async function authMiddleware({ status, request: { headers } }) {
			const session = await auth.api.getSession({ headers })

			if (!session || !AuthService.isValidAuthRole(session.user.role)) return status(401)

			return {
				user: {
					...session.user,
					role: session.user.role as AuthRole, // Need to help type inference here
				},
				session: session.session,
			}
		},
	})
	.macro('authRole', (askedRole: AuthRole) => ({
		resolve: async function roleMiddleware({ status, request: { headers } }) {
			const session = await auth.api.getSession({ headers })

			if (!session || !AuthService.isValidAuthRole(session.user.role)) return status(401)

			// Admin has all permissions
			if (AuthService.hasAuthRole(session.user.role, askedRole)) {
				return { user: { ...session.user, role: session.user.role }, session: session.session }
			}

			return status(403)
		},
	}))
