import { pgEnum, pgTable, text, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const todoStatus = pgEnum('todo_status', ['pending', 'completed'])

export const todos = pgTable('todos', {
	id,

	userId: uuid('user_id')
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	content: text().notNull(),
	status: todoStatus().notNull(),

	...timestamps,
})
