import { env } from '@repo/env/web'
import { drizzle } from 'drizzle-orm/node-postgres'
import { relations } from './relations'
import * as schema from './schemas'

export const db = drizzle(env.DATABASE_URL, { relations, schema, casing: 'snake_case' })

export type DatabaseType = typeof db
export type TransactionType = Parameters<Parameters<DatabaseType['transaction']>[0]>[0]

export function withTransaction<T>(
	db: DatabaseType | TransactionType,
	fn: (tx: TransactionType) => Promise<T>
): Promise<T> {
	if ('rollback' in db) return fn(db)
	return db.transaction(fn)
}

export * from 'drizzle-orm'
