import { type DatabaseType, eq, inArray, type TransactionType } from '@repo/db'
import { assets } from '@repo/db/schemas'
import type { Asset, AssetInsert, AssetUpdate } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { subDays } from 'date-fns'

export const FileService = (db: DatabaseType | TransactionType) => ({
	async createAsset(data: AssetInsert) {
		const asset = await db
			.insert(assets)
			.values(data)
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an asset
			.then(([asset]) => asset!)
		return asset
	},

	async updateAsset(id: Asset['id'], data: AssetUpdate) {
		const asset = await db
			.update(assets)
			.set(data)
			.where(eq(assets.id, id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an asset
			.then(([asset]) => asset!)
		return asset
	},

	async promotePendingAsset(key: Asset['key']) {
		const asset = await db.query.assets.findFirst({ where: { key, status: 'pending' } })
		if (!asset) throw new Error('Asset not found')
		if (!fileStorage.exists(asset.key)) throw new Error('Asset not found')

		await db
			.update(assets)
			.set({ status: 'active' })
			.where(eq(assets.id, asset.id))
			.returning()
			// biome-ignore lint/style/noNonNullAssertion: always returns an asset
			.then(([asset]) => asset!)
		return asset
	},

	async getPendingAssets() {
		const twoDaysAgo = subDays(new Date(), 2)
		return await db.query.assets.findMany({
			where: { status: 'pending', createdAt: { lt: twoDaysAgo } },
		})
	},

	async deleteAssets(ids: Asset['id'][]) {
		return await db.delete(assets).where(inArray(assets.id, ids))
	},
})
