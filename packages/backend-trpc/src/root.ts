import { authRouter } from './router/auth'
import { todoRouter } from './router/todo'
import { createTRPCRouter } from './trpc'

export const appRouter = createTRPCRouter({
  auth: authRouter,
  todo: todoRouter,
})

export type AppRouter = typeof appRouter
