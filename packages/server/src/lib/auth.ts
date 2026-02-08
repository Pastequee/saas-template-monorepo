import auth from '@repo/auth'
import { AuthRole } from '@repo/db/types'
import { Elysia } from 'elysia'
import { logger } from './logger'

const AuthService = {
	isValidAuthRole: (role: string | null | undefined): role is AuthRole => {
		if (!role) return false
		return AuthRole.includes(role as AuthRole)
	},

	hasAuthRole: <TRole extends AuthRole>(role: AuthRole, askedRole: TRole): role is TRole =>
		role === askedRole,
}

export const authMacro = new Elysia({ name: 'auth-macro' })
	.use(logger())
	.macro('auth', {
		resolve: async function authMiddleware({ status, request: { headers }, log }) {
			const session = await auth.api.getSession({ headers })

			if (!session || !AuthService.isValidAuthRole(session.user.role)) return status(401)

			log.set({
				user: {
					id: session.user.id,
					authRole: session.user.role,
					accountAge: daysSince(session.user.createdAt),
				},
			})

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
		resolve: async function roleMiddleware({ status, request: { headers }, log }) {
			const session = await auth.api.getSession({ headers })

			if (!session || !AuthService.isValidAuthRole(session.user.role)) return status(401)

			log.set({
				user: {
					id: session.user.id,
					authRole: session.user.role,
					accountAge: daysSince(session.user.createdAt),
				},
			})

			// Admin has all permissions
			if (AuthService.hasAuthRole(session.user.role, askedRole)) {
				return { user: { ...session.user, role: session.user.role }, session: session.session }
			}

			log.set({ askedAuthRole: askedRole })

			return status(403)
		},
	}))

function daysSince(date: Date): number {
	return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}
