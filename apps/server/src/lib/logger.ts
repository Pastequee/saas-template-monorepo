import { env } from '@repo/env/server'
import type { StatusMap } from 'elysia'
import { Elysia, status as elysiaStatus } from 'elysia'
import type { Prettify } from 'elysia/types'
import { initLogger } from 'evlog'
import type { SamplingConfig, RequestLogger } from 'evlog'
import { evlog } from 'evlog/elysia'

const samplingConfig: SamplingConfig = {
	keep: [{ status: 400 }, { duration: 1000 }],
	rates: { debug: 0, error: 100, info: 10, warn: 100 },
}

initLogger({
	enabled: env.NODE_ENV !== 'test',
	env: { commitHash: env.COMMIT_HASH, environment: env.NODE_ENV, service: 'server' },
	sampling: env.NODE_ENV === 'development' ? undefined : samplingConfig,
})

export const logger = new Elysia({ name: 'logger' })
	.use(evlog())

	.derive(({ log }) => {
		function createError<const TStatus extends Code, const TInfos extends CreateErrorProps>(
			status: TStatus,
			errorInfos: TInfos
		) {
			return _createError(log, status, errorInfos)
		}

		return { statusError: createError }
	})

	.as('global')

type Code = number | keyof StatusMap

type CreateErrorProps = {
	message: string
	fix?: string
	why?: string
	cause?: Error
}

export function _createError<const TStatus extends Code, const TInfos extends CreateErrorProps>(
	log: RequestLogger,
	status: TStatus,
	errorInfos: TInfos
) {
	const { cause, ...rest } = errorInfos
	const prettyRest: Prettify<Omit<TInfos, 'cause'>> = rest

	if (cause) {
		log.error(cause, prettyRest)
	}

	return elysiaStatus(status, prettyRest)
}
