import cors from '@elysiajs/cors'
import openapi, { fromTypes } from '@elysiajs/openapi'
import { auth } from '@repo/auth'
import { env } from '@repo/env/backend'
import { Elysia } from 'elysia'
import { isProduction } from 'elysia/error'
import { devLogger } from '#lib/dev-logger'
import { logger } from '#lib/logger'
import { AuthOpenAPI } from '#middlewares/auth'
import { todosRouter } from '#routers/todo/controller'
import { userRouter } from '#routers/user/controller'
import { utilsRouter } from '#routers/utils/controller'

export const app = new Elysia()
	.use(
		cors({
			origin: [env.FRONTEND_URL],
			methods: ['GET', 'POST', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization'],
		})
	)
	.use(devLogger()) // Enabled only in development
	.use(
		openapi({
			enabled: !isProduction,
			documentation: {
				components: await AuthOpenAPI.components,
				paths: await AuthOpenAPI.getPaths(),
			},
			references: fromTypes('src/index.ts'),
		})
	)
	.use(utilsRouter)
	.mount(auth.handler)
	.use(userRouter)
	.use(todosRouter)
	.listen(3001)

logger.info(
	{
		url: app.server?.url,
		environment: env.NODE_ENV,
		port: app.server?.port,
		hostname: app.server?.hostname,
	},
	'Server is running'
)

process.on('SIGTERM', async () => {
	await app.stop()
	process.exit(0)
})

process.on('SIGINT', async () => {
	await app.stop()
	process.exit(0)
})

export type App = typeof app
