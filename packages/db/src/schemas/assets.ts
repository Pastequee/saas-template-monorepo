import { integer, pgEnum, pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core'
import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const assetStatus = pgEnum('asset_status', [
	'pending', // presigned URL issued, upload not confirmed
	'active',
	'archived',
	'deleted', // solt-deleted, pending S3 cleanup
])

export const assets = pgTable('assets', {
	id,

	// Ownership
	ownerId: uuid()
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// S3 reference
	key: text().notNull().unique(),

	// File metadata
	filename: text().notNull(),
	contentType: text().notNull(),
	size: integer().notNull(), // in bytes

	// Classification
	status: assetStatus().notNull(),

	// Timestamps
	...timestamps,
	deletedAt: timestamp({ withTimezone: true }),
})
