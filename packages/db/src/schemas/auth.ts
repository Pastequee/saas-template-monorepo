// oxlint-disable no-inline-comments
import * as d from 'drizzle-orm/pg-core'

import { id } from '../schema-utils'

export const authSchema = d.snakeCase.schema('auth')

export const authRoles = authSchema.enum('roles', ['admin', 'user'])

export const users = authSchema.table('users', {
	id: id.primaryKey(),
	name: d.text('name').notNull(),
	email: d.text('email').notNull().unique(),
	emailVerified: d.boolean('email_verified').default(false).notNull(),
	image: d.text('image'),
	createdAt: d.timestamp('created_at').defaultNow().notNull(),
	updatedAt: d
		.timestamp('updated_at')
		.defaultNow()
		.$onUpdate(() => /* @__PURE__ */ new Date())
		.notNull(),
	role: authRoles('role').notNull().default('user'),
	banned: d.boolean('banned').notNull().default(false),
	banReason: d.text('ban_reason'),
	banExpires: d.timestamp('ban_expires'),
})

export const sessions = authSchema.table(
	'sessions',
	{
		id: id.primaryKey(),
		expiresAt: d.timestamp('expires_at').notNull(),
		token: d.text('token').notNull().unique(),
		createdAt: d.timestamp('created_at').defaultNow().notNull(),
		updatedAt: d
			.timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
		ipAddress: d.text('ip_address'),
		userAgent: d.text('user_agent'),
		userId: id
			.type('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		impersonatedBy: d.text('impersonated_by'),
	},
	(table) => [d.index('sessions_userId_idx').on(table.userId)]
)

export const accounts = authSchema.table(
	'accounts',
	{
		id: id.primaryKey(),
		accountId: d.text('account_id').notNull(),
		providerId: d.text('provider_id').notNull(),
		userId: id
			.type('user_id')
			.notNull()
			.references(() => users.id, { onDelete: 'cascade' }),
		accessToken: d.text('access_token'),
		refreshToken: d.text('refresh_token'),
		idToken: d.text('id_token'),
		accessTokenExpiresAt: d.timestamp('access_token_expires_at'),
		refreshTokenExpiresAt: d.timestamp('refresh_token_expires_at'),
		scope: d.text('scope'),
		password: d.text('password'),
		createdAt: d.timestamp('created_at').defaultNow().notNull(),
		updatedAt: d
			.timestamp('updated_at')
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [d.index('accounts_userId_idx').on(table.userId)]
)

export const verifications = authSchema.table(
	'verifications',
	{
		id: id.primaryKey(),
		identifier: d.text('identifier').notNull(),
		value: d.text('value').notNull(),
		expiresAt: d.timestamp('expires_at').notNull(),
		createdAt: d.timestamp('created_at').defaultNow().notNull(),
		updatedAt: d
			.timestamp('updated_at')
			.defaultNow()
			.$onUpdate(() => /* @__PURE__ */ new Date())
			.notNull(),
	},
	(table) => [d.index('verifications_identifier_idx').on(table.identifier)]
)
