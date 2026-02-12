import { sql } from '@repo/db'
import { tryCatch } from '@repo/utils'
import Elysia from 'elysia'
import { dbService } from '#services/db.service'
import { authMacro } from './auth'
import { logger } from './logger'

export const utilsLifecycles = new Elysia({ name: 'utils-lifecycles' })
	.onError(({ status, code }) => {
		// Obfuscate unpredictable errors
		if (
			code === 'INTERNAL_SERVER_ERROR' ||
			code === 'UNKNOWN' ||
			(typeof code === 'number' && code >= 500)
		) {
			return status(500, { message: 'Internal server error' })
		}

		return
	})
	.as('global')

const utilsEndpoints = new Elysia({ name: 'utils', tags: ['Utils'] })
	.use(authMacro)
	.use(dbService)
	.use(logger())

	.get('/', () => 'Backend API' as const)

	.get('/health', () => ({
		status: 'healthy' as const,
		timestamp: new Date().toISOString(),
	}))

	.get('/health/private', async ({ db }) => {
		console.log(db.$client.options)
		const [, error] = await tryCatch(db.execute(sql`SELECT 1`))
		const dbStatus = error ? ('unhealthy' as const) : ('healthy' as const)

		return {
			status: 'healthy' as const,
			timestamp: new Date().toISOString(),
			database: dbStatus,
		}
	})

export const utils = new Elysia().use(utilsLifecycles).use(utilsEndpoints)
