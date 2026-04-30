import { bigint, timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm/sql'

export const numericId = (name = 'id') => bigint(name, { mode: 'number' })

export const identityId = (name = 'id') => numericId(name).primaryKey().generatedAlwaysAsIdentity()

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
