import cors from '@elysiajs/cors'
import openapi, { fromTypes } from '@elysiajs/openapi'
import { logger as devLogger } from '@tqman/nice-logger'
import { Elysia } from 'elysia'
import { isProduction } from 'elysia/error'
import { env } from '#lib/env'
import { logger } from '#lib/logger'
import { todosRouter } from '#routers/todos/controller'
import { utilsRouter } from '#routers/utils/controller'

const app = new Elysia({ prefix: '/api' })
  .use(
    cors({
      origin: [env.FRONTEND_URL],
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      credentials: true,
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  )
  .use(
    openapi({
      enabled: !isProduction,
      references: fromTypes(),
    })
  )
  .onError({ as: 'global' }, ({ error, status }) => {
    logger.error(error)
    if (isProduction) {
      return status(500)
    }

    return status(500, error)
  })
  .use(devLogger()) // Enabled only in development
  .use(utilsRouter)
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

export type App = typeof app
