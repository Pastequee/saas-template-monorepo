import Elysia from 'elysia'
import { isProduction } from 'elysia/error'
import { logger } from '#lib/logger'

const shouldLogError = () => {
	if (!isProduction) return true

	return true
}

export const utilsLifecycles = new Elysia({ name: 'utils-lifecycles' })
	// TODO: add biome rule: no throws other than Error
	.onError(({ status, code, error, set }) => {
		if (shouldLogError()) {
			logger.error({ error, status: set.status, code })
		}

		// Obfuscate unpredictable errors
		if (code === 'INTERNAL_SERVER_ERROR' || code === 'UNKNOWN' || typeof code === 'number') {
			return status(500)
		}

		return
	})
	.as('global')

const utilsEndpoints = new Elysia({ name: 'utils', tags: ['Utils'] })
	.get('/', () => 'Backend API' as const)
	.get('/health', () => ({
		status: 'healthy' as const,
		timestamp: new Date().toISOString(),
	}))

export const utilsRouter = new Elysia().use(utilsLifecycles).use(utilsEndpoints)
