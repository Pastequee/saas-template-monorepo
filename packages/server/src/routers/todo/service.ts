import { db } from '@repo/db'
import { todos } from '@repo/db/schemas'
import type { Todo, TodoInsert, TodoUpdate, User } from '@repo/db/types'
import { eq } from 'drizzle-orm'

export const TodosService = {
	getUserTodos: async (userId: User['id']) =>
		db.query.todos.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		}),

	getTodo: async (id: Todo['id']) =>
		db.query.todos.findFirst({
			where: { id },
		}),

	createTodos: async (data: TodoInsert) =>
		db
			.insert(todos)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns a todo
			.then(([todo]) => todo!),

	updateTodo: async (id: Todo['id'], data: TodoUpdate) =>
		db
			.update(todos)
			.set(data)
			.where(eq(todos.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns a todo
			.then(([todo]) => todo!),

	deleteTodo: async (id: Todo['id']) => {
		await db.delete(todos).where(eq(todos.id, id))
	},
}
