import { todos } from '@repo/db/schemas'
import { t } from 'elysia'
import { createInsertSchema, createUpdateSchema } from '#lib/typebox-generators'

const _insertTodo = createInsertSchema(todos)
export const insertTodo = t.Omit(_insertTodo, ['id', 'createdAt', 'updatedAt'])
export type InsertTodo = (typeof insertTodo)['static']

const _udpateTodo = createUpdateSchema(todos)
export const udpateTodo = t.Omit(_udpateTodo, ['id', 'createdAt', 'updatedAt'])
export type UpdateTodo = (typeof udpateTodo)['static']

const _selectTodo = createUpdateSchema(todos)
export const selectTodo = t.Omit(_selectTodo, [])
export type SelectTodo = (typeof selectTodo)['static']
