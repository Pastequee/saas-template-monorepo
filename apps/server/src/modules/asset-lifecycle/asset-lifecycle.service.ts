import type { DatabaseType, TransactionType } from '@repo/db'
import { eq } from '@repo/db'
import { assets, listingImages } from '@repo/db/schemas'
import type { Asset, AssetInsert } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { randomUUIDv7 } from 'bun'

type UploadIntentOptions = { public?: boolean }

type AssetLifecycleAdapters = {
	assets: {
		activate: (id: Asset['id']) => Promise<Asset>
		create: (asset: AssetInsert) => Promise<Asset>
		findPendingByKey: (key: Asset['key'], ownerId: Asset['ownerId']) => Promise<Asset | null>
	}
	ids: {
		create: () => string
	}
	listingImages: {
		attach: (image: { assetId: Asset['id']; listingId: string }) => Promise<void>
	}
	storage: {
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
	listingId: string
	ownerId: Asset['ownerId']
}

export const AssetLifecycle = (adapters: AssetLifecycleAdapters) => ({
	attachListingImage: async ({ assetKey, listingId, ownerId }: AttachListingImageInput) => {
		const asset = await adapters.assets.findPendingByKey(assetKey, ownerId)

		if (!asset || asset.ownerId !== ownerId) {
			throw new Error('Asset not found')
		}

		const fileExists = await adapters.storage.exists(asset.key)

		if (!fileExists) {
			throw new Error('Asset not found')
		}

		const activeAsset = await adapters.assets.activate(asset.id)
		await adapters.listingImages.attach({ assetId: activeAsset.id, listingId })

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
		findPendingByKey: async (key: Asset['key'], ownerId: Asset['ownerId']) =>
			(await db.query.assets.findFirst({ where: { key, ownerId, status: 'pending' } })) ?? null,
	},
	ids: {
		create: () => randomUUIDv7(),
	},
	listingImages: {
		attach: async ({ assetId, listingId }: { assetId: Asset['id']; listingId: string }) => {
			await db.insert(listingImages).values({ assetId, listingId, sortOrder: 0 })
		},
	},
	storage: {
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
