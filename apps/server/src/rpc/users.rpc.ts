import { Rpc, RpcGroup } from '@effect/rpc'
import { Effect, Schema } from 'effect'

import { CurrentRequestAuth } from '#lib/request-auth'
import type { RequestAuth } from '#lib/request-auth'

const CurrentSession = Schema.Struct({
	createdAt: Schema.Date,
	expiresAt: Schema.Date,
	id: Schema.String,
	impersonatedBy: Schema.NullOr(Schema.String),
	ipAddress: Schema.NullOr(Schema.String),
	updatedAt: Schema.Date,
	userAgent: Schema.NullOr(Schema.String),
	userId: Schema.String,
})

const CurrentUser = Schema.Struct({
	banExpires: Schema.NullOr(Schema.Date),
	banReason: Schema.NullOr(Schema.String),
	banned: Schema.Boolean,
	createdAt: Schema.Date,
	email: Schema.String,
	emailVerified: Schema.Boolean,
	id: Schema.Number,
	image: Schema.NullOr(Schema.String),
	name: Schema.String,
	role: Schema.String,
	updatedAt: Schema.Date,
})

const CurrentUserResponse = Schema.Struct({
	session: CurrentSession,
	user: CurrentUser,
})

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

const isRequestAuth = (value: unknown): value is NonNullable<RequestAuth> =>
	typeof value === 'object' && value !== null && 'session' in value && 'user' in value

const getCurrentRequestAuth: Effect.Effect<RequestAuth> = Effect.withFiberRuntime((fiber) => {
	const value: unknown = fiber.currentContext.unsafeMap.get(CurrentRequestAuth.key)

	return Effect.succeed(isRequestAuth(value) ? value : null)
})

export class UnauthorizedRpcError extends Schema.TaggedError<UnauthorizedRpcError>()(
	'UnauthorizedRpcError',
	{
		message: Schema.String,
	}
) {}

export const UsersRpcs = RpcGroup.make(
	Rpc.make('GetCurrentUser', {
		success: CurrentUserResponse,
	}).setError(UnauthorizedRpcError)
).prefix('users.')

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
