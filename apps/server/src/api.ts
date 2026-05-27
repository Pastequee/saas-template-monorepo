import { cors } from '@elysiajs/cors'
import { Elysia } from 'elysia'

import { logger } from '#lib/logger'
import { createUtils } from '#lib/utils'
import { createFilesRouter } from '#modules/files/files.controller'
import { createListingsRouter } from '#modules/listings/listings.controller'
import { createUserRouter } from '#modules/users/users.controller'

import type { AppDeps } from './deps'
import { createProductionDeps } from './deps'

export const createApp = (deps: AppDeps = createProductionDeps()) =>
	new Elysia({ prefix: '/api' })
		.use(
			cors({
				allowedHeaders: ['Content-Type', 'Authorization'],
				credentials: true,
				methods: ['GET', 'POST', 'PATCH', 'DELETE', 'PUT', 'HEAD', 'OPTIONS'],
				origin: [deps.env.WEB_URL],
			})
		)
		.use(logger)
		.use(createUtils(deps))
		.mount(deps.auth.handler)
		.use(createUserRouter(deps))
		.use(createListingsRouter(deps))
		.use(createFilesRouter(deps))

export const app = createApp()
