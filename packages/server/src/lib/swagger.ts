import openapi, { fromTypes } from '@elysiajs/openapi'
import { isProduction } from 'elysia/error'
import { AuthOpenAPI } from './auth'

export const swagger = openapi({
	enabled: !isProduction,
	documentation: {
		components: await AuthOpenAPI.components,
		paths: await AuthOpenAPI.getPaths(),
	},
	references: fromTypes('src/index.ts'),
})
