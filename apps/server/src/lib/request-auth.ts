import type * as RpcHeaders from '@effect/platform/Headers'
import { auth } from '@repo/auth/config'
import { formatAuthSession } from '@repo/auth/utils'
import { Context, Effect, Layer } from 'effect'

export type RequestAuth = ReturnType<typeof summarizeRequestAuth> | null

export class CurrentRequestAuth extends Context.Tag('server/CurrentRequestAuth')<
	CurrentRequestAuth,
	RequestAuth
>() {}

const summarizeRequestAuth = (
	session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>
) => formatAuthSession(session)

export const resolveRequestAuth = (headers: Headers | RpcHeaders.Headers) =>
	Effect.promise(async () => {
		const session = await auth.api.getSession({ headers: new Headers(headers) })

		return session ? summarizeRequestAuth(session) : null
	})

export const requestAuthLayer = (headers: Headers | RpcHeaders.Headers) =>
	Layer.effect(CurrentRequestAuth, resolveRequestAuth(headers))
