import * as d from 'drizzle-orm/pg-core'

import { id, timestamps } from '../schema-utils'
import { users } from './auth'
import { files } from './files'

export const listings = d.snakeCase.table('listings', {
	id: id.primaryKey(),
	userId: id
		.type()
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	title: d.text().notNull(),
	description: d.text().notNull(),
	price: d.integer().notNull(),
	...timestamps(),
})

export const listingImages = d.snakeCase.table(
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
		sortOrder: d.integer().notNull().default(0),
	},
	(t) => [d.primaryKey({ columns: [t.listingId, t.fileId] })]
)
