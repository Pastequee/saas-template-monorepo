import { eq, inArray } from '@repo/db'
import type { DatabaseType, TransactionType } from '@repo/db'
import { assets } from '@repo/db/schemas'
import type { Asset, AssetInsert, AssetUpdate } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { subDays } from 'date-fns'

export const FileService = (db: DatabaseType | TransactionType) => ({
	createAsset: async (data: AssetInsert) => {
		const asset = await db
			.insert(assets)
			.values(data)
			.returning()
			// oxlint-disable-next-line typescript/no-non-null-assertion
			.then(([a]) => a!)
		return asset
	},

	deleteAssets: async (ids: Asset['id'][]) =>
		await db.delete(assets).where(inArray(assets.id, ids)),

	getPendingAssets: async () => {
		const twoDaysAgo = subDays(new Date(), 2)
		return await db.query.assets.findMany({
			where: { createdAt: { lt: twoDaysAgo }, status: 'pending' },
		})
	},

	promotePendingAsset: async (key: Asset['key']) => {
		const asset = await db.query.assets.findFirst({ where: { key, status: 'pending' } })

		if (!asset) {
			throw new Error('Asset not found')
		}

		if (!fileStorage.exists(asset.key)) {
			throw new Error('Asset not found')
		}

		await db
			.update(assets)
			.set({ status: 'active' })
			.where(eq(assets.id, asset.id))
			.returning()
			// oxlint-disable-next-line typescript/no-non-null-assertion
			.then(([a]) => a!)
		return asset
	},

	updateAsset: async (id: Asset['id'], data: AssetUpdate) => {
		const asset = await db
			.update(assets)
			.set(data)
			.where(eq(assets.id, id))
			.returning()
			// oxlint-disable-next-line typescript/no-non-null-assertion
			.then(([a]) => a!)
		return asset
	},
})
