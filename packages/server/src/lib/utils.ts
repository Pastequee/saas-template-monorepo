import { db, sql } from '@repo/db'
import { tryCatch } from '@repo/utils'
import { Elysia } from 'elysia'

import { authMacro } from './auth'

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

		// oxlint-disable-next-line no-useless-return
		return
	})
	.as('global')

const utilsEndpoints = new Elysia({ name: 'utils', tags: ['Utils'] })
	.use(authMacro)
	.get('/', () => 'Backend API' as const)
	.get('/health', () => ({
		status: 'healthy' as const,
		timestamp: new Date().toISOString(),
	}))
	.get('/health/private', async () => {
		const [, error] = await tryCatch(db.execute(sql`SELECT 1`))
		const dbStatus = error ? ('unhealthy' as const) : ('healthy' as const)

		return {
			database: dbStatus,
			status: 'healthy' as const,
			timestamp: new Date().toISOString(),
		}
	})

export const utils = new Elysia().use(utilsLifecycles).use(utilsEndpoints)
