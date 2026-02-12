import { todoInsertSchema, todoUpdateSchema } from '@repo/db/types'
import { Elysia } from 'elysia'
import z from 'zod'
import { authMacro } from '#lib/auth'
import { todoService } from './todo.service'

export const todosRouter = new Elysia({ name: 'todos', tags: ['Todo'] })
	.use(authMacro)
	.use(todoService)
	.model('uuidParam', z.object({ id: z.uuidv7() }))

	.get('/todos', ({ user, todoService }) => todoService.getUserTodos(user.id), {
		auth: true,
	})

	.post(
		'/todos',
		async ({ body, status, user, todoService }) => {
			const createdTodo = await todoService.createTodos({ userId: user.id, ...body })

			return status('Created', createdTodo)
		},
		{ auth: true, body: todoInsertSchema }
	)

	.patch(
		'/todos/:id',
		async ({ body, params, status, user, statusError, todoService }) => {
			const todo = await todoService.getTodo(params.id)

			if (!todo) return statusError(404, { message: 'Todo not found' })
			if (todo.userId !== user.id) return statusError(403, { message: 'This todo is not yours' })

			const emptyBody = !(body.content || body.status)
			if (emptyBody) return todo

			const updatedTodo = await todoService.updateTodo(params.id, body)

			return status('OK', updatedTodo)
		},
		{ auth: true, body: todoUpdateSchema, params: 'uuidParam' }
	)

	.delete(
		'/todos/:id',
		async ({ params, status, user, statusError, todoService }) => {
			const todo = await todoService.getTodo(params.id)

			if (!todo) return statusError('Not Found', { message: 'Todo not found' })
			if (todo.userId !== user.id) return statusError(403, { message: 'This todo is not yours' })

			await todoService.deleteTodo(params.id)

			return status('No Content')
		},
		{ auth: true, params: 'uuidParam' }
	)
