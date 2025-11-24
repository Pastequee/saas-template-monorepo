import { db } from '@repo/db'
import { todos } from '@repo/db/schemas'
import { asc, eq } from 'drizzle-orm'
import type { InsertTodo, UpdateTodo } from './models'

export const TodosService = {
  getUserTodos: async (userId: string) =>
    db.query.todos.findMany({
      where: eq(todos.userId, userId),
      orderBy: asc(todos.createdAt),
    }),

  getTodo: async (id: string) =>
    db.query.todos.findFirst({
      where: eq(todos.id, id),
    }),

  createTodos: async (data: InsertTodo) => db.insert(todos).values(data).returning(),

  updateTodo: async (id: string, data: UpdateTodo) =>
    db.update(todos).set(data).where(eq(todos.id, id)).returning(),

  deleteTodo: async (id: string) => db.delete(todos).where(eq(todos.id, id)),
}
