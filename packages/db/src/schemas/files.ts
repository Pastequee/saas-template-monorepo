// oxlint-disable no-inline-comments
import * as d from 'drizzle-orm/pg-core'

import { id, timestamps } from '../schema-utils'
import { users } from './auth'

export const fileStatus = d.pgEnum('file_status', [
	'pending', // presigned URL issued, upload not confirmed
	'active',
	'archived',
	'deleted', // solt-deleted, pending S3 cleanup
])

export const files = d.snakeCase.table('files', {
	id: id.primaryKey(),

	// Ownership
	ownerId: id
		.type()
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	// S3 reference
	key: d.text().notNull().unique(),

	// File metadata
	filename: d.text().notNull(),
	contentType: d.text().notNull(),
	size: d.integer().notNull(), // in bytes

	// Classification
	status: fileStatus().notNull(),

	// Timestamps
	...timestamps(),
	deletedAt: d.timestamp({ withTimezone: true }),
})
