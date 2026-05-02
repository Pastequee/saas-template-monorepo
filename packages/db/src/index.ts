import { env } from '@repo/env/server'
import { drizzle } from 'drizzle-orm/node-postgres'

import { relations } from './relations'

export const db = drizzle({ connection: env.DATABASE_URL, relations })

export type DatabaseType = typeof db
export type TransactionType = Parameters<Parameters<DatabaseType['transaction']>[0]>[0]

export async function withTransaction<T>(
	// oxlint-disable-next-line no-shadow
	db: DatabaseType | TransactionType,
	fn: (tx: TransactionType) => Promise<T>
): Promise<T> {
	if ('rollback' in db) {
		return fn(db)
	}

	return db.transaction(fn)
}

export * from 'drizzle-orm'
