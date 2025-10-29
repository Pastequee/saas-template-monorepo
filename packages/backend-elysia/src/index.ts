import { fromTypes, openapi } from '@elysiajs/openapi'
import auth from '@repo/auth'
import { logger } from '@tqman/nice-logger'
import { Elysia } from 'elysia'
import { todosRouter } from '#routers/todos/controller'
import { utilsRouter } from '#routers/utils/controller'

const isProduction = process.env.NODE_ENV === 'production'

const disableInProdOptions = { enabled: !isProduction }

export const app = new Elysia()
  .use(logger(disableInProdOptions))
  .onError(({ error, status }) => {
    if (!isProduction) {
      return status(500, error)
    }

    return status(500)
  })
  .use(
    openapi({
      ...disableInProdOptions,
      references: fromTypes('./src/index.ts'),
    })
  )
  .mount(auth.handler)
  .use(utilsRouter)
  .use(todosRouter)
  .listen(3001)

export type App = typeof app
