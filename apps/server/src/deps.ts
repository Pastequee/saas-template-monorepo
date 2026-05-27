import { auth } from '@repo/auth/config'
import type { Auth } from '@repo/auth/config'
import { db } from '@repo/db'
import type { AppDbType } from '@repo/db'
import { env } from '@repo/env/server'
import { fileStorage } from '@repo/file-storage'
import type { FileStorage } from '@repo/file-storage'

export type AppDb = AppDbType

export type DbDeps = {
	db: AppDb
}

export type AppDeps = {
	auth: Auth
	db: AppDb
	env: typeof env
	fileStorage: FileStorage
}

export const createProductionDeps = () =>
	({
		auth,
		db,
		env,
		fileStorage,
	}) satisfies AppDeps

export const withDb = <TDeps extends DbDeps>(deps: TDeps, newDb: AppDb) => ({
	...deps,
	db: newDb,
})
