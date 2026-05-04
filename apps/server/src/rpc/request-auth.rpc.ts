import { Effect } from 'effect'

import { CurrentRequestAuth } from '#lib/request-auth'
import type { RequestAuth } from '#lib/request-auth'

const isRequestAuth = (value: unknown): value is NonNullable<RequestAuth> =>
	typeof value === 'object' && value !== null && 'session' in value && 'user' in value

export const getCurrentRequestAuth: Effect.Effect<RequestAuth> = Effect.withFiberRuntime(
	(fiber) => {
		const value: unknown = fiber.currentContext.unsafeMap.get(CurrentRequestAuth.key)

		return Effect.succeed(isRequestAuth(value) ? value : null)
	}
)
