import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'

import { user } from './auth.schema'

export const todoStatus = pgEnum('todo_status', ['pending', 'completed'])

export const todos = pgTable('todos', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: text('user_id')
    .notNull()
    .references(() => user.id, { onDelete: 'cascade', onUpdate: 'cascade' }),
  content: text('content').notNull(),
  status: todoStatus('status')
    .$default(() => 'pending')
    .notNull(),
  createdAt: timestamp('created_at')
    .$defaultFn(() => new Date())
    .notNull(),
  updatedAt: timestamp('updated_at')
    .$defaultFn(() => new Date())
    .notNull(),
})
