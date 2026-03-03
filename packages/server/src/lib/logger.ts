// oxlint-disable no-nested-ternary
import { env } from '@repo/env/web'
import { Elysia, ElysiaCustomStatusResponse, status as elysiaStatus, StatusMap } from 'elysia'
import type { Prettify } from 'elysia/types'
import { createRequestLogger, initLogger } from 'evlog'
import type { DrainContext, RequestLogger, SamplingConfig } from 'evlog'
import { createAxiomDrain } from 'evlog/axiom'
import { createDrainPipeline } from 'evlog/pipeline'

import { requestId as requestIdPlugin } from './request-id'

const pipeline = createDrainPipeline<DrainContext>({
	batch: { intervalMs: 5000, size: 25 },
})

const axiomDrain = pipeline(
	createAxiomDrain({
		dataset: env.AXIOM_DATASET,
		edgeUrl: 'https://eu-central-1.aws.edge.axiom.co',
		token: env.AXIOM_API_KEY,
	})
)

const samplingConfig: SamplingConfig = {
	keep: [{ status: 400 }, { duration: 1000 }],
	rates: { debug: 0, error: 100, info: 10, warn: 40 },
}

initLogger({
	drain: env.NODE_ENV === 'development' ? undefined : axiomDrain,
	enabled: env.NODE_ENV !== 'test',
	env: { commitHash: env.COMMIT_HASH, environment: env.NODE_ENV, service: 'server' },
	sampling: env.NODE_ENV === 'development' ? undefined : samplingConfig,
})

export const logger = () =>
	new Elysia({ name: 'logger' })
		.use(requestIdPlugin())

		.derive(({ requestId, request, path }) => ({
			log: createRequestLogger({
				method: request.method,
				path,
				requestId,
			}),
		}))

		.derive(({ log }) => {
			function createError<const TStatus extends Code, const TInfos extends CreateErrorProps>(
				status: TStatus,
				errorInfos: TInfos
			) {
				return _createError(log, status, errorInfos)
			}

			return { statusError: createError }
		})

		.onError(({ error, log, code }) => {
			if (log?.getContext().error) {
				return
			}

			if (error instanceof ElysiaCustomStatusResponse) {
				const message =
					typeof error.response === 'string'
						? error.response
						: typeof error.response === 'object' &&
							  'message' in error.response &&
							  typeof error.response.message === 'string'
							? error.response.message
							: 'Unknown error'

				log?.error(new Error(message), error.response)
			} else if (typeof code === 'number') {
				log?.error(new Error(error.toString()), error)
			} else {
				log?.error(error)
			}
		})

		.onAfterResponse(({ log, set, responseValue }) => {
			const statusCode =
				(responseValue &&
				typeof responseValue === 'object' &&
				'status' in responseValue &&
				typeof responseValue.status === 'number'
					? responseValue.status
					: typeof set.status === 'string'
						? StatusMap[set.status]
						: set.status) ?? 500

			log.set({ status: statusCode })

			const context = log.getContext()
			const sanitizedContext = deepSanitize(context)

			log.emit(sanitizedContext)
		})
		.as('global')

const SENSITIVE_KEYS = [
	'password',
	'confirmPassword',
	'cardNumber',
	'token',
	'apiKey',
	'authorization',
	'cookie',
	'secret',
	'authToken',
	'accessToken',
	'refreshToken',
]

export function deepSanitize(obj: Record<string, unknown>): Record<string, unknown> {
	const result: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(obj)) {
		// Check if key contains any sensitive keyword (case-insensitive)
		if (SENSITIVE_KEYS.some((k) => key.toLowerCase().includes(k))) {
			result[key] = '[REDACTED]'
		} else if (value && typeof value === 'object' && !Array.isArray(value)) {
			// Recursively sanitize nested objects
			result[key] = deepSanitize(value as Record<string, unknown>)
		} else {
			result[key] = value
		}
	}

	return result
}

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

process.on('SIGTERM', () => {
	axiomDrain.flush()
})

process.on('SIGINT', () => {
	axiomDrain.flush()
})
