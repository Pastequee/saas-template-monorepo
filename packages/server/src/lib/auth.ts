import auth from '@repo/auth'
import { db } from '@repo/db'
import { AuthRole, type Role } from '@repo/db/types'
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
		resolve: async function authMiddleware({ request: { headers }, log, statusError }) {
			const session = await auth.api.getSession({ headers })

			if (!session || !AuthService.isValidAuthRole(session.user.role))
				return statusError(401, { message: 'You are not authenticated' })

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
	.macro('authAdmin', {
		resolve: async function authAdminMiddleware({ request: { headers }, log, statusError }) {
			const session = await auth.api.getSession({ headers })

			if (!session || !AuthService.isValidAuthRole(session.user.role))
				return statusError(401, { message: 'You are not authenticated' })

			log.set({
				user: {
					id: session.user.id,
					authRole: session.user.role,
					accountAge: daysSince(session.user.createdAt),
				},
			})

			if (!AuthService.hasAuthRole(session.user.role, 'admin')) {
				return statusError(403, { message: 'You are not authorized to access this resource' })
			}

			return { user: { ...session.user, role: session.user.role }, session: session.session }
		},
	})
	.macro(
		'role',
		(asked: Role | [Omit<Role, 'superadmin'> | [Omit<Role, 'superadmin'>], ...Role[]]) => ({
			resolve: async function roleMiddleware({ request: { headers }, log, statusError }) {
				const session = await auth.api.getSession({ headers })

				if (!session || !AuthService.isValidAuthRole(session.user.role))
					return statusError(401, { message: 'You are not authenticated' })

				const userRoles = await db.query.userRoles.findMany({ where: { userId: session.user.id } })

				log.set({
					user: {
						id: session.user.id,
						authRole: session.user.role,
						roles: userRoles.map((userRole) => userRole.role),
						accountAge: daysSince(session.user.createdAt),
					},
				})

				// If the user has no roles, not authorized, return an error
				if (userRoles.length === 0) {
					return statusError(403, { message: 'You are not authorized to access this resource' })
				}

				// Superadmin bypasses all role checks and: has all permissions
				const isSuperadmin = userRoles.some((userRole) => userRole.role === 'superadmin')
				if (isSuperadmin) {
					return { user: { ...session.user, role: session.user.role }, session: session.session }
				}

				const askedRoles = Array.isArray(asked) ? asked : [asked]

				// Check if the user has at least one of the asked roles
				const hasAtLeastOneRole = userRoles.some((userRole) => askedRoles.includes(userRole.role))
				if (!hasAtLeastOneRole) {
					return statusError(403, { message: 'You are not authorized to access this resource' })
				}

				// If the user has at least one of the asked roles, return the user and session
				return { user: { ...session.user, role: session.user.role }, session: session.session }
			},
		})
	)

function daysSince(date: Date): number {
	return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}
