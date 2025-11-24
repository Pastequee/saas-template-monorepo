import { relations, sql } from 'drizzle-orm'
import { pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { users } from './auth'

export const todoStatus = pgEnum('todo_status', ['PENDING', 'COMPLETED'])

export const todos = pgTable('todos', {
  id: uuid().primaryKey().default(sql`uuidv7()`),
  userId: uuid()
    .references(() => users.id, { onDelete: 'cascade', onUpdate: 'cascade' })
    .notNull(),

  content: text().notNull(),
  status: todoStatus().notNull(),

  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp()
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
