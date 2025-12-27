import { env } from '@repo/env/backend'
import { isProduction } from 'elysia/error'
import pino from 'pino'

export const logger = pino({
	level: env.LOG_LEVEL,
	redact: ['request.body.password', 'request.headers.Authorization'],
	// We don't need pretty logging in production
	// We are compiling the code with bun, and pino transport feature is using
	// nodejs worker threads, which is not supported by bun, so no transport in production
	transport: isProduction
		? undefined
		: {
				target: 'pino-pretty',
				options: {
					colorize: true,
				},
			},
})
