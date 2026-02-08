import cors from '@elysiajs/cors'
import auth from '@repo/auth'
import { env } from '@repo/env/server'
import { Elysia } from 'elysia'
import { logger } from '#lib/logger'
import { utils } from '#lib/utils'
import { todosRouter } from '#routers/todo/todo.controller'
import { userRouter } from '#routers/user/controller'

export const app = new Elysia({ prefix: '/api' })
	.use(
		cors({
			origin: [env.FRONTEND_URL],
			methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
			credentials: true,
			allowedHeaders: ['Content-Type', 'Authorization'],
		})
	)
	// .use(devLogger())
	.use(logger())
	.use(utils)
	.mount(auth.handler)
	.use(userRouter)
	.use(todosRouter)

// Only for standalone server version
// app.listen(3001, ({ url }) => {
// 	console.info(`Server is running on ${url}`)

// 	process.on('SIGTERM', async () => {
// 		await app.stop()
// 		process.exit(0)
// 	})

// 	process.on('SIGINT', async () => {
// 		await app.stop()
// 		process.exit(0)
// 	})
// })

export type App = typeof app
