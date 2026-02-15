import { timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm/sql'

export const id = uuid().primaryKey().default(sql`uuidv7()`)

export const timestamps = {
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
}
