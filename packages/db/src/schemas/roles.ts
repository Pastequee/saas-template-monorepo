import { pgEnum, pgTable, unique } from 'drizzle-orm/pg-core'

import { common, numericId } from '../schema-utils'
import { users } from './auth'

export const roles = pgEnum('roles', ['superadmin', 'admin', 'user'])

export const userRoles = pgTable(
	'user_roles',
	{
		...common,
		userId: numericId('user_id')
			.references(() => users.id, { onDelete: 'cascade' })
			.notNull(),
		role: roles().notNull(),
		grantedById: numericId('granted_by_id').references(() => users.id, { onDelete: 'set null' }),
	},
	(table) => [unique('user_roles_userId_role_unique').on(table.userId, table.role)]
)
