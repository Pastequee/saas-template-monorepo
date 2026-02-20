import { integer, pgTable, primaryKey, text, uuid } from 'drizzle-orm/pg-core'

import { common } from '../schema-utils'
import { assets } from './assets'
import { users } from './auth'

export const listings = pgTable('listings', {
	...common,
	userId: uuid()
		.references(() => users.id, { onDelete: 'cascade' })
		.notNull(),

	title: text().notNull(),
	description: text().notNull(),
	price: integer().notNull(),
})

export const listingImages = pgTable(
	'listing_images',
	{
		listingId: uuid()
			.references(() => listings.id, { onDelete: 'cascade' })
			.notNull(),
		assetId: uuid()
			.references(() => assets.id, { onDelete: 'cascade' })
			.notNull(),
		sortOrder: integer().notNull().default(0),
	},
	(t) => [primaryKey({ columns: [t.listingId, t.assetId] })]
)
