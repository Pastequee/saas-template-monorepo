import { cors } from '@elysiajs/cors'
import { auth } from '@repo/auth'
import { env } from '@repo/env/web'
import { Elysia } from 'elysia'

import { logger } from '#lib/logger'
import { utils } from '#lib/utils'
import { filesRouter } from '#routers/files/files.controller'
import { listingsRouter } from '#routers/listings/listings.controller'
import { userRouter } from '#routers/user/controller'

export const app = new Elysia({ prefix: '/api' })
	.use(
		cors({
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
			methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
			origin: [env.VITE_FRONTEND_URL],
		})
	)
	.use(logger())
	.use(utils)
	.mount(auth.handler)
	.use(userRouter)
	.use(listingsRouter)
	.use(filesRouter)

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
