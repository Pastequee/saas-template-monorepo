import { db, sql } from '@repo/db'
import { env } from '@repo/env/web'
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
	.get('/', () => 'Application API' as const)
	.get('/health', async () => {
		const [, error] = await tryCatch(db.execute(sql`SELECT 1`))
		const dbStatus = error ? ('unhealthy' as const) : ('healthy' as const)

		return {
			commitHash: env.COMMIT_HASH,
			database: dbStatus,
			environment: env.NODE_ENV,
			status: 'healthy' as const,
			timestamp: new Date().toISOString(),
		}
	})

export const utils = new Elysia().use(utilsLifecycles).use(utilsEndpoints)
