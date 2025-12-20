import { createInsertSchema, createSelectSchema, createUpdateSchema } from 'drizzle-zod'
import { type accounts, roles, type sessions, type users, type verifications } from './schemas/auth'
import { todoStatus, todos } from './schemas/todos'

const omits = { id: true, createdAt: true, updatedAt: true } as const

// todos.ts
export const TodoStatus = [...todoStatus.enumValues] as const
export type TodoStatus = (typeof TodoStatus)[number]

export type Todo = typeof todos.$inferSelect
export type TodoInsert = typeof todos.$inferInsert
export type TodoUpdate = Partial<TodoInsert>
export const todoSchema = createSelectSchema(todos)
export const todoInsertSchema = createInsertSchema(todos).omit({ ...omits, userId: true })
export const todoUpdateSchema = createUpdateSchema(todos).omit({ ...omits, userId: true })

// auth.ts
export const UserRole = [...roles.enumValues] as const
export type UserRole = (typeof UserRole)[number]

export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type SessionInsert = typeof sessions.$inferInsert

export type Account = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type VerificationInsert = typeof verifications.$inferInsert
