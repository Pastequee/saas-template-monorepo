import type { DatabaseType, TransactionType } from '@repo/db'
import { assets } from '@repo/db/schemas'
import type { Asset, AssetInsert } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { randomUUIDv7 } from 'bun'

type UploadIntentOptions = { public?: boolean }

type AssetLifecycleAdapters = {
	assets: {
		create: (asset: AssetInsert) => Promise<Asset>
	}
	ids: {
		create: () => string
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

export const AssetLifecycle = (adapters: AssetLifecycleAdapters) => ({
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
		create: async (asset: AssetInsert) =>
			db
				.insert(assets)
				.values(asset)
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([createdAsset]) => createdAsset!),
	},
	ids: {
		create: () => randomUUIDv7(),
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
