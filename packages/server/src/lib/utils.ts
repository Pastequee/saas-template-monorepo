import Elysia from 'elysia'

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
	.get('/', () => 'Backend API' as const)
	.get('/health', () => ({
		status: 'healthy' as const,
		timestamp: new Date().toISOString(),
	}))

export const utils = new Elysia().use(utilsLifecycles).use(utilsEndpoints)
