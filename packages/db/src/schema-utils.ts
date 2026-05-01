import { bigint, timestamp } from 'drizzle-orm/pg-core'

export const id = {
	primaryKey: (name?: string) => id.type(name).generatedAlwaysAsIdentity().primaryKey(),
	type: (name?: string) => (name ? bigint(name, { mode: 'number' }) : bigint({ mode: 'number' })),
}

export const timestamps = () => ({
	createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
})
