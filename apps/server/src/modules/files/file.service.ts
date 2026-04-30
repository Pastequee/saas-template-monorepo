import { eq } from '@repo/db'
import type { DatabaseType, TransactionType } from '@repo/db'
import { assets } from '@repo/db/schemas'
import type { Asset, AssetUpdate } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'

export const FileService = (db: DatabaseType | TransactionType) => ({
	promotePendingAsset: async (key: Asset['key']) => {
		const asset = await db.query.assets.findFirst({ where: { key, status: 'pending' } })

		if (!asset) {
			throw new Error('Asset not found')
		}

		const fileExists = await fileStorage.exists(asset.key)

		if (!fileExists) {
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
