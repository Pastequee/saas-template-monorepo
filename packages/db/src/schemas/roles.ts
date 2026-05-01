import { pgEnum, pgTable, unique } from 'drizzle-orm/pg-core'

import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const roles = pgEnum('roles', ['superadmin', 'admin', 'user'])

export const userRoles = pgTable(
	'user_roles',
	{
		id: id.primaryKey(),
		userId: id
			.type()
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		role: roles().notNull(),
		grantedById: id.type().references(() => users.id, { onDelete: 'set null' }),
		...timestamps(),
	},
	(table) => [unique('user_roles_userId_role_unique').on(table.userId, table.role)]
)
