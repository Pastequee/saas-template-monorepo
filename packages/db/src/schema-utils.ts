import * as d from 'drizzle-orm/pg-core'

export const id = {
	primaryKey: (name?: string) => id.type(name).generatedAlwaysAsIdentity().primaryKey(),
	type: (name?: string) =>
		name ? d.bigint(name, { mode: 'number' }) : d.bigint({ mode: 'number' }),
}

export const timestamps = () => ({
	createdAt: d.timestamp({ withTimezone: true }).notNull().defaultNow(),
	updatedAt: d
		.timestamp({ withTimezone: true })
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
})
