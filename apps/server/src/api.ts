import { cors } from '@elysiajs/cors'
import { auth } from '@repo/auth'
import { env } from '@repo/env/server'
import { Elysia } from 'elysia'

import { logger } from '#lib/logger'
import { utils } from '#lib/utils'
import { filesRouter } from '#modules/files/files.controller'
import { listingsRouter } from '#modules/listings/listings.controller'
import { userRouter } from '#modules/users/users.controller'

export const app = new Elysia({ prefix: '/api' })
	.use(
		cors({
			allowedHeaders: ['Content-Type', 'Authorization'],
			credentials: true,
			methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
			origin: [env.WEB_URL],
		})
	)
	.use(logger)
	.use(utils)
	.mount(auth.handler)
	.use(userRouter)
	.use(listingsRouter)
	.use(filesRouter)
