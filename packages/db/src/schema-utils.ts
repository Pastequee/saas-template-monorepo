import { timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm/sql'

// oxlint-disable-next-line sort-keys
export const common = {
	id: uuid()
		.primaryKey()
		.default(sql`uuidv7()`),

	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
}
