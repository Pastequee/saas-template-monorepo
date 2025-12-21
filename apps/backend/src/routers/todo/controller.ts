import { todoInsertSchema, todoUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { betterAuth } from '#middlewares/auth'
import { TodosService } from './service'

export const todosRouter = new Elysia({ name: 'todos', tags: ['Todo'] })
	.use(betterAuth)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/todos', ({ user }) => TodosService.getUserTodos(user.id), {
		auth: true,
	})

	.post(
		'/todos',
		async ({ body, status, user }) => {
			const createdTodo = await TodosService.createTodos({ userId: user.id, ...body })

			return status('Created', createdTodo)
		},
		{ auth: true, body: todoInsertSchema }
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

			return status('OK', updatedTodo)
		},
		{ auth: true, body: todoUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/todos/:id',
		async ({ params, status, user }) => {
			const todo = await TodosService.getTodo(params.id)

			if (!todo) return status('Not Found')
			if (todo.userId !== user.id) return status('Forbidden')

			await TodosService.deleteTodo(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
