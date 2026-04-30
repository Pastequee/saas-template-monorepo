import { auth } from '@repo/auth'
import { normalizeAuthSession } from '@repo/auth/auth-session'
import { db } from '@repo/db'
import { AuthRole } from '@repo/db/types'
import type { Role } from '@repo/db/types'
import { enumContains } from '@repo/utils'
import { Elysia } from 'elysia'

import { logger } from './logger'

const AuthService = {
	hasAuthRole: <TRole extends AuthRole>(role: AuthRole, askedRole: TRole): role is TRole =>
		role === askedRole,

	isValidAuthRole: (role: string | null | undefined): role is AuthRole => {
		if (!role) {
			return false
		}

		return enumContains(AuthRole, role)
	},
}

export const authMacro = new Elysia({ name: 'auth-macro' })
	.use(logger)
	.macro('auth', {
		resolve: async function authMiddleware({ request: { headers }, log, statusError }) {
			const rawSession = await auth.api.getSession({ headers })

			if (!rawSession || !AuthService.isValidAuthRole(rawSession.user.role)) {
				return statusError(401, { message: 'You are not authenticated' })
			}

			const accountAgeDays = daysSince(rawSession.user.createdAt)
			const session = normalizeAuthSession(rawSession)

			log.set({
				user: {
					accountAgeDays,
					authRole: session.user.role,
					id: session.user.id,
				},
			})

			return {
				session: session.session,
				user: {
					...session.user,

					// Need to help type inference here
					role: session.user.role,
				},
			}
		},
	})

	.macro('maybeAuth', {
		resolve: async function maybeAuthMiddleware({ request: { headers }, log }) {
			const rawSession = await auth.api.getSession({ headers })

			if (!rawSession || !AuthService.isValidAuthRole(rawSession.user.role)) {
				return
			}

			const accountAgeDays = daysSince(rawSession.user.createdAt)
			const session = normalizeAuthSession(rawSession)

			log.set({
				user: {
					accountAgeDays,
					authRole: session.user.role,
					id: session.user.id,
				},
			})

			return {
				session: session.session,
				user: {
					...session.user,
					role: session.user.role,
				},
			}
		},
	})

	.macro('authAdmin', {
		resolve: async function authAdminMiddleware({ request: { headers }, log, statusError }) {
			const rawSession = await auth.api.getSession({ headers })

			if (!rawSession || !AuthService.isValidAuthRole(rawSession.user.role)) {
				return statusError(401, { message: 'You are not authenticated' })
			}

			const accountAgeDays = daysSince(rawSession.user.createdAt)
			const session = normalizeAuthSession(rawSession)

			log.set({
				user: {
					accountAgeDays,
					authRole: session.user.role,
					id: session.user.id,
				},
			})

			if (!AuthService.hasAuthRole(session.user.role, 'admin')) {
				return statusError(403, { message: 'You are not authorized to access this resource' })
			}

			return { session: session.session, user: { ...session.user, role: session.user.role } }
		},
	})

	.macro(
		'role',
		(asked: Role | [Omit<Role, 'superadmin'> | [Omit<Role, 'superadmin'>], ...Role[]]) => ({
			resolve: async function roleMiddleware({ request: { headers }, log, statusError }) {
				const rawSession = await auth.api.getSession({ headers })

				if (!rawSession || !AuthService.isValidAuthRole(rawSession.user.role)) {
					return statusError(401, { message: 'You are not authenticated' })
				}

				const accountAgeDays = daysSince(rawSession.user.createdAt)
				const session = normalizeAuthSession(rawSession)

				const userRoles = await db.query.userRoles.findMany({ where: { userId: session.user.id } })

				log.set({
					user: {
						accountAgeDays,
						authRole: session.user.role,
						id: session.user.id,
						roles: userRoles.map((userRole) => userRole.role),
					},
				})

				// If the user has no roles, not authorized, return an error
				if (userRoles.length === 0) {
					return statusError(403, { message: 'You are not authorized to access this resource' })
				}

				// Superadmin bypasses all role checks and: has all permissions
				const isSuperadmin = userRoles.some((userRole) => userRole.role === 'superadmin')
				if (isSuperadmin) {
					return { session: session.session, user: { ...session.user, role: session.user.role } }
				}

				const askedRoles = Array.isArray(asked) ? asked : [asked]

				// Check if the user has at least one of the asked roles
				const hasAtLeastOneRole = userRoles.some((userRole) => askedRoles.includes(userRole.role))
				if (!hasAtLeastOneRole) {
					return statusError(403, { message: 'You are not authorized to access this resource' })
				}

				// If the user has at least one of the asked roles, return the user and session
				return { session: session.session, user: { ...session.user, role: session.user.role } }
			},
		})
	)

function daysSince(date: Date): number {
	return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24))
}
