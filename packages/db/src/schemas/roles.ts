import { pgEnum, pgTable, primaryKey, uuid } from 'drizzle-orm/pg-core'
import { timestamps } from '../schema-utils'
import { users } from './auth'

export const roles = pgEnum('roles', ['superadmin', 'admin', 'user'])

export const userRoles = pgTable(
	'user_roles',
	{
		userId: uuid()
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		role: roles().notNull(),
		grantedById: uuid().references(() => users.id, { onDelete: 'set null' }),

		...timestamps,
	},
	(table) => [primaryKey({ columns: [table.userId, table.role] })]
)
