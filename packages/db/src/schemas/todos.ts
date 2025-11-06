import { relations, sql } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const todoStatus = pgEnum('todo_status', ['PENDING', 'COMPLETED'])

export const todos = pgTable('todos', {
  id: uuid('id').primaryKey().default(sql`uuidv7()`),
  userId: uuid('user_id')
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),

  content: text('content').notNull(),
  status: todoStatus('status').notNull(),

  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at')
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
})

export const todosRelations = relations(todos, ({ one }) => ({
  user: one(users, {
    fields: [todos.userId],
    references: [users.id],
  }),
}))
