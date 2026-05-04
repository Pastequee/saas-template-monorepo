import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'

import { UnauthorizedRpcError } from './request-auth.contract'

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

export const UsersRpcs = RpcGroup.make(
	Rpc.make('GetCurrentUser', {
		success: CurrentUserResponse,
	}).setError(UnauthorizedRpcError)
).prefix('users.')
