import { Effect } from 'effect'

import type { RequestAuth } from '#lib/request-auth'

import { UnauthorizedRpcError } from './request-auth.contract'
import { getCurrentRequestAuth } from './request-auth.rpc'
import { UsersRpcs } from './users.contract'

const formatCurrentUserResponse = (requestAuth: NonNullable<RequestAuth>) => ({
	session: {
		createdAt: requestAuth.session.createdAt,
		expiresAt: requestAuth.session.expiresAt,
		id: requestAuth.session.id,
		impersonatedBy: requestAuth.session.impersonatedBy ?? null,
		ipAddress: requestAuth.session.ipAddress ?? null,
		updatedAt: requestAuth.session.updatedAt,
		userAgent: requestAuth.session.userAgent ?? null,
		userId: requestAuth.session.userId,
	},
	user: {
		banExpires: requestAuth.user.banExpires ?? null,
		banReason: requestAuth.user.banReason ?? null,
		banned: requestAuth.user.banned ?? false,
		createdAt: requestAuth.user.createdAt,
		email: requestAuth.user.email,
		emailVerified: requestAuth.user.emailVerified,
		id: requestAuth.user.id,
		image: requestAuth.user.image ?? null,
		name: requestAuth.user.name,
		role: requestAuth.user.role,
		updatedAt: requestAuth.user.updatedAt,
	},
})

const usersRpcHandlers = UsersRpcs.toLayer({
	'users.GetCurrentUser': () =>
		Effect.gen(function* getCurrentUser() {
			const requestAuth = yield* getCurrentRequestAuth

			if (!requestAuth) {
				return yield* Effect.fail(
					new UnauthorizedRpcError({ message: 'You are not authenticated' })
				)
			}

			return formatCurrentUserResponse(requestAuth)
		}),
})

export const usersRpcLayer = usersRpcHandlers
