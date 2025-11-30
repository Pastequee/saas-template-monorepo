import { db } from '@repo/db-prisma'
import type {
	Todo,
	TodoUncheckedCreateInput,
	TodoUncheckedUpdateInput,
	User,
} from '@repo/db-prisma/types'

export const TodosService = {
	getUserTodos: async (userId: User['id']) =>
		db.todo.findMany({
			where: { userId },
			orderBy: { createdAt: 'desc' },
		}),

	getTodo: async (id: Todo['id']) =>
		db.todo.findFirst({
			where: { id },
		}),

	createTodos: async (data: TodoUncheckedCreateInput) =>
		db.todo.create({
			data,
		}),

	updateTodo: async (id: Todo['id'], data: TodoUncheckedUpdateInput) =>
		db.todo.update({
			where: { id },
			data,
		}),

	deleteTodo: async (id: Todo['id']) =>
		db.todo.delete({
			where: { id },
		}),
}
