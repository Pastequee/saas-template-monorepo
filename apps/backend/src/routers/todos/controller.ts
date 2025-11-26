import { TodoPlainInputCreate, TodoPlainInputUpdate } from '@repo/db-prisma/schemas'
import { Elysia } from 'elysia'
import { betterAuth } from '#middlewares/auth'
import { TodosService } from './service'

export const todosRouter = new Elysia({ name: 'todos', tags: ['Todo'] })
  .use(betterAuth)

  .get('/todos', ({ user }) => TodosService.getUserTodos(user.id), {
    auth: true,
  })

  .post(
    '/todos',
    async ({ body, status, user }) => {
      const todo = await TodosService.createTodos({ userId: user.id, ...body })

      return status('Created', todo)
    },
    { auth: true, body: TodoPlainInputCreate }
  )

  .patch(
    '/todos/:id',
    async ({ body, params, status, user }) => {
      const todo = await TodosService.getTodo(params.id)

      if (!todo) return status('Not Found')
      if (todo.userId !== user.id) return status('Forbidden')

      const emptyBody = !(body.content || body.status)
      if (emptyBody) return todo

      const updatedTodo = await TodosService.updateTodo(params.id, body)

      return updatedTodo
    },
    { auth: true, body: TodoPlainInputUpdate }
  )

  .delete(
    '/todos/:id',
    async ({ params, status, user }) => {
      const todo = await TodosService.getTodo(params.id)

      if (!todo) return status('Not Found')
      if (todo.userId !== user.id) return status('Forbidden')

      const deletedTodo = await TodosService.deleteTodo(params.id)

      return deletedTodo
    },
    { auth: true }
  )
