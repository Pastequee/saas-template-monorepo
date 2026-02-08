import { todoInsertSchema, todoUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { authMacro } from '#lib/auth'
import { TodosService } from './todo.service'

export const todosRouter = new Elysia({ name: 'todos', tags: ['Todo'] })
	.use(authMacro)
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
		async ({ body, params, status, user, statusError }) => {
			const todo = await TodosService.getTodo(params.id)

			if (!todo) return statusError(404, { message: 'Todo not found' })
			if (todo.userId !== user.id) return statusError(403, { message: 'This todo is not yours' })

			const emptyBody = !(body.content || body.status)
			if (emptyBody) return todo

			const updatedTodo = await TodosService.updateTodo(params.id, body)

			return status('OK', updatedTodo)
		},
		{ auth: true, body: todoUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/todos/:id',
		async ({ params, status, user, statusError }) => {
			const todo = await TodosService.getTodo(params.id)

			if (!todo) return statusError('Not Found', { message: 'Todo not found' })
			if (todo.userId !== user.id) return statusError(403, { message: 'This todo is not yours' })

			await TodosService.deleteTodo(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
