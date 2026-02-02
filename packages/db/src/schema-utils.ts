import { env } from '@repo/env/server'
import { timestamp, uuid } from 'drizzle-orm/pg-core'
import { sql } from 'drizzle-orm/sql'

const testId = uuid().primaryKey().defaultRandom()
const productionId = uuid().primaryKey().default(sql`uuidv7()`)

export const id = env.NODE_ENV === 'test' ? testId : productionId

export const timestamps = {
	createdAt: timestamp().notNull().defaultNow(),
	updatedAt: timestamp()
		.notNull()
		.defaultNow()
		.$onUpdate(() => new Date()),
}
