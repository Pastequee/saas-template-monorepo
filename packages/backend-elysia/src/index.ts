import { openapi } from '@elysiajs/openapi'
import auth from '@repo/auth'
import { logger as loggerMiddleware } from '@tqman/nice-logger'
import { Elysia } from 'elysia'
import { todosRouter } from '#routers/todos/controller'
import { utilsRouter } from '#routers/utils/controller'

const isProduction = process.env.NODE_ENV === 'production'

const disableInProdOptions = { enabled: !isProduction }

export const app = new Elysia({ prefix: '/api' })
  .use(loggerMiddleware(disableInProdOptions))
  .onError(({ error, status }) => {
    if (!isProduction) {
      // biome-ignore lint/suspicious/noConsole: dev only
      console.error(error)
      return status(500, error)
    }

    // TODO: report error to log system
    return status(500)
  })
  .use(
    openapi({
      ...disableInProdOptions,
      // only works if Elysia is hosted separately
      // references: fromTypes(),
    })
  )
  .mount(auth.handler)
  .use(utilsRouter)
  .use(todosRouter)

export type App = typeof app
