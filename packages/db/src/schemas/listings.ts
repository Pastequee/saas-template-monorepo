import { integer, pgTable, primaryKey, text } from 'drizzle-orm/pg-core'

import { id, timestamps } from '../schema-utils'
import { users } from './auth'
import { files } from './files'

export const listings = pgTable('listings', {
	id: id.primaryKey(),
	userId: id
		.type()
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	title: text().notNull(),
	description: text().notNull(),
	price: integer().notNull(),
	...timestamps(),
})

export const listingImages = pgTable(
	'listing_images',
	{
		listingId: id
			.type()
			.references(() => listings.id, { onDelete: 'cascade' })
			.notNull(),
		fileId: id
			.type()
			.references(() => files.id, { onDelete: 'cascade' })
			.notNull(),
		sortOrder: integer().notNull().default(0),
	},
	(t) => [primaryKey({ columns: [t.listingId, t.fileId] })]
)
