import type { DatabaseType, TransactionType } from '@repo/db'
import { eq, inArray } from '@repo/db'
import { assets, listingImages } from '@repo/db/schemas'
import type { Asset, AssetInsert, Listing } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { randomUUIDv7 } from 'bun'
import { subDays } from 'date-fns'

type UploadIntentOptions = { public?: boolean }

type AssetLifecycleAdapters = {
	assets: {
		activate: (id: Asset['id']) => Promise<Asset>
		create: (asset: AssetInsert) => Promise<Asset>
		delete: (ids: Asset['id'][]) => Promise<void>
		findPendingByKey: (key: Asset['key'], ownerId: Asset['ownerId']) => Promise<Asset | null>
		findStalePending: (createdBefore: Date) => Promise<Asset[]>
		retire?: (ids: Asset['id'][]) => Promise<void>
	}
	clock: {
		now: () => Date
	}
	ids: {
		create: () => string
	}
	listingImages: {
		attach: (image: { assetId: Asset['id']; listingId: Listing['id'] }) => Promise<void>
		detach?: (listingId: Listing['id']) => Promise<Asset['id'][]>
		replace?: (image: { assetId: Asset['id']; listingId: Listing['id'] }) => Promise<Asset['id'][]>
	}
	storage: {
		delete: (key: Asset['key']) => Promise<void>
		exists: (key: Asset['key']) => Promise<boolean>
	}
	uploadIntents: {
		create: (key: string, options: UploadIntentOptions) => string
	}
}

type ReserveUploadInput = {
	contentType: AssetInsert['contentType']
	filename: AssetInsert['filename']
	ownerId: AssetInsert['ownerId']
	public?: boolean
	size: AssetInsert['size']
}

type AttachListingImageInput = {
	assetKey: Asset['key']
	listingId: Listing['id']
	ownerId: Asset['ownerId']
}

export const AssetLifecycle = (adapters: AssetLifecycleAdapters) => ({
	attachListingImage: async ({ assetKey, listingId, ownerId }: AttachListingImageInput) => {
		const activeAsset = await activateVerifiedPendingAsset(adapters, { assetKey, ownerId })
		await adapters.listingImages.attach({ assetId: activeAsset.id, listingId })

		return activeAsset
	},

	cleanupStalePendingAssets: async () => {
		const staleAssets = await adapters.assets.findStalePending(subDays(adapters.clock.now(), 2))
		const cleanedAssetIds: Asset['id'][] = []

		for (const asset of staleAssets) {
			const fileExists = await adapters.storage.exists(asset.key)

			if (!fileExists) {
				cleanedAssetIds.push(asset.id)
				continue
			}

			try {
				await adapters.storage.delete(asset.key)
				cleanedAssetIds.push(asset.id)
			} catch {
				continue
			}
		}

		if (cleanedAssetIds.length > 0) {
			await adapters.assets.delete(cleanedAssetIds)
		}

		return { filesDeleted: cleanedAssetIds.length }
	},

	replaceListingImage: async ({ assetKey, listingId, ownerId }: AttachListingImageInput) => {
		if (!adapters.listingImages.replace) {
			throw new Error('Listing image replacement is not configured')
		}

		const activeAsset = await activateVerifiedPendingAsset(adapters, { assetKey, ownerId })
		const retiredAssetIds = await adapters.listingImages.replace({
			assetId: activeAsset.id,
			listingId,
		})
		await retireAssets(adapters, retiredAssetIds)

		return activeAsset
	},

	reserveUpload: async ({
		contentType,
		filename,
		ownerId,
		public: isPublic,
		size,
	}: ReserveUploadInput) => {
		const key = createAssetKey({ contentType, filename, ownerId }, adapters.ids.create())
		const url = adapters.uploadIntents.create(key, { public: isPublic })
		const asset = await adapters.assets.create({
			contentType,
			filename,
			key,
			ownerId,
			size,
			status: 'pending',
		})

		return { asset, url }
	},

	retireListingMedia: async ({ listingId }: { listingId: Listing['id'] }) => {
		if (!adapters.listingImages.detach) {
			throw new Error('Listing media retirement is not configured')
		}

		const retiredAssetIds = await adapters.listingImages.detach(listingId)
		await retireAssets(adapters, retiredAssetIds)

		return { retiredAssetIds }
	},
})

export const createAssetLifecycleAdapters = (db: DatabaseType | TransactionType) => ({
	assets: {
		activate: async (id: Asset['id']) =>
			db
				.update(assets)
				.set({ status: 'active' })
				.where(eq(assets.id, id))
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([asset]) => asset!),
		create: async (asset: AssetInsert) =>
			db
				.insert(assets)
				.values(asset)
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([createdAsset]) => createdAsset!),
		delete: async (ids: Asset['id'][]) => {
			await db.delete(assets).where(inArray(assets.id, ids))
		},
		findPendingByKey: async (key: Asset['key'], ownerId: Asset['ownerId']) =>
			(await db.query.assets.findFirst({ where: { key, ownerId, status: 'pending' } })) ?? null,
		findStalePending: async (createdBefore: Date) =>
			db.query.assets.findMany({
				where: { createdAt: { lt: createdBefore }, status: 'pending' },
			}),
		retire: async (ids: Asset['id'][]) => {
			if (ids.length === 0) {
				return
			}

			await db.update(assets).set({ status: 'deleted' }).where(inArray(assets.id, ids))
		},
	},
	clock: {
		now: () => new Date(),
	},
	ids: {
		create: () => randomUUIDv7(),
	},
	listingImages: {
		attach: async ({ assetId, listingId }: { assetId: Asset['id']; listingId: Listing['id'] }) => {
			await db.insert(listingImages).values({ assetId, listingId, sortOrder: 0 })
		},
		detach: async (listingId: Listing['id']) => {
			const detachedImages = await db
				.delete(listingImages)
				.where(eq(listingImages.listingId, listingId))
				.returning({ assetId: listingImages.assetId })

			return detachedImages.map((image) => image.assetId)
		},
		replace: async ({ assetId, listingId }: { assetId: Asset['id']; listingId: Listing['id'] }) => {
			const replacedImages = await db
				.delete(listingImages)
				.where(eq(listingImages.listingId, listingId))
				.returning({ assetId: listingImages.assetId })
			const replacedAssetIds = replacedImages.map((image) => image.assetId)

			await db.insert(listingImages).values({ assetId, listingId, sortOrder: 0 })

			return replacedAssetIds
		},
	},
	storage: {
		delete: async (key: Asset['key']) => fileStorage.delete(key),
		exists: async (key: Asset['key']) => fileStorage.exists(key),
	},
	uploadIntents: {
		create: (key: string, options: UploadIntentOptions) => fileStorage.getUploadUrl(key, options),
	},
})

function createAssetKey(
	{
		contentType,
		filename,
		ownerId,
	}: Pick<ReserveUploadInput, 'contentType' | 'filename' | 'ownerId'>,
	id: string
) {
	const ext = filename.split('.').pop() ?? contentType.split('/').pop() ?? ''

	return `${ownerId}/${id}.${ext}`
}

async function activateVerifiedPendingAsset(
	adapters: AssetLifecycleAdapters,
	{ assetKey, ownerId }: Pick<AttachListingImageInput, 'assetKey' | 'ownerId'>
) {
	const asset = await adapters.assets.findPendingByKey(assetKey, ownerId)

	if (!asset || asset.ownerId !== ownerId) {
		throw new Error('Asset not found')
	}

	const fileExists = await adapters.storage.exists(asset.key)

	if (!fileExists) {
		throw new Error('Asset not found')
	}

	return adapters.assets.activate(asset.id)
}

async function retireAssets(adapters: AssetLifecycleAdapters, ids: Asset['id'][]) {
	if (ids.length === 0) {
		return
	}

	if (!adapters.assets.retire) {
		throw new Error('Asset retirement is not configured')
	}

	await adapters.assets.retire([...new Set(ids)])
}
