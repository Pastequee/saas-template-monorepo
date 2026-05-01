import type { DatabaseType, TransactionType } from '@repo/db'
import { eq, inArray } from '@repo/db'
import { files, listingImages } from '@repo/db/schemas'
import type { File, FileInsert, Listing } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { randomUUIDv7 } from 'bun'
import { subDays } from 'date-fns'

type UploadIntentOptions = { public?: boolean }

type FileLifecycleAdapters = {
	files: {
		activate: (id: File['id']) => Promise<File>
		create: (file: FileInsert) => Promise<File>
		delete: (ids: File['id'][]) => Promise<void>
		findPendingByKey: (key: File['key'], ownerId: File['ownerId']) => Promise<File | null>
		findStalePending: (createdBefore: Date) => Promise<File[]>
		retire?: (ids: File['id'][]) => Promise<void>
	}
	clock: {
		now: () => Date
	}
	ids: {
		create: () => string
	}
	listingImages: {
		attach: (image: { fileId: File['id']; listingId: Listing['id'] }) => Promise<void>
		detach?: (listingId: Listing['id']) => Promise<File['id'][]>
		replace?: (image: { fileId: File['id']; listingId: Listing['id'] }) => Promise<File['id'][]>
	}
	storage: {
		delete: (key: File['key']) => Promise<void>
		exists: (key: File['key']) => Promise<boolean>
	}
	uploadIntents: {
		create: (key: string, options: UploadIntentOptions) => string
	}
}

type ReserveUploadInput = {
	contentType: FileInsert['contentType']
	filename: FileInsert['filename']
	ownerId: FileInsert['ownerId']
	public?: boolean
	size: FileInsert['size']
}

type AttachListingImageInput = {
	fileKey: File['key']
	listingId: Listing['id']
	ownerId: File['ownerId']
}

export const FileLifecycle = (adapters: FileLifecycleAdapters) => ({
	attachListingImage: async ({ fileKey, listingId, ownerId }: AttachListingImageInput) => {
		const activeFile = await activateVerifiedPendingFile(adapters, { fileKey, ownerId })
		await adapters.listingImages.attach({ fileId: activeFile.id, listingId })

		return activeFile
	},

	cleanupStalePendingFiles: async () => {
		const staleFiles = await adapters.files.findStalePending(subDays(adapters.clock.now(), 2))
		const cleanedFileIds: File['id'][] = []

		for (const file of staleFiles) {
			const fileExists = await adapters.storage.exists(file.key)

			if (!fileExists) {
				cleanedFileIds.push(file.id)
				continue
			}

			try {
				await adapters.storage.delete(file.key)
				cleanedFileIds.push(file.id)
			} catch {
				continue
			}
		}

		if (cleanedFileIds.length > 0) {
			await adapters.files.delete(cleanedFileIds)
		}

		return { filesDeleted: cleanedFileIds.length }
	},

	replaceListingImage: async ({ fileKey, listingId, ownerId }: AttachListingImageInput) => {
		if (!adapters.listingImages.replace) {
			throw new Error('Listing image replacement is not configured')
		}

		const activeFile = await activateVerifiedPendingFile(adapters, { fileKey, ownerId })
		const retiredFileIds = await adapters.listingImages.replace({
			fileId: activeFile.id,
			listingId,
		})
		await retireFiles(adapters, retiredFileIds)

		return activeFile
	},

	reserveUpload: async ({
		contentType,
		filename,
		ownerId,
		public: isPublic,
		size,
	}: ReserveUploadInput) => {
		const key = createFileKey({ contentType, filename, ownerId }, adapters.ids.create())
		const url = adapters.uploadIntents.create(key, { public: isPublic })
		const file = await adapters.files.create({
			contentType,
			filename,
			key,
			ownerId,
			size,
			status: 'pending',
		})

		return { file, url }
	},

	retireListingMedia: async ({ listingId }: { listingId: Listing['id'] }) => {
		if (!adapters.listingImages.detach) {
			throw new Error('Listing media retirement is not configured')
		}

		const retiredFileIds = await adapters.listingImages.detach(listingId)
		await retireFiles(adapters, retiredFileIds)

		return { retiredFileIds }
	},
})

export const createFileLifecycleAdapters = (db: DatabaseType | TransactionType) => ({
	clock: {
		now: () => new Date(),
	},
	files: {
		activate: async (id: File['id']) =>
			db
				.update(files)
				.set({ status: 'active' })
				.where(eq(files.id, id))
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([file]) => file!),
		create: async (file: FileInsert) =>
			db
				.insert(files)
				.values(file)
				.returning()
				// oxlint-disable-next-line typescript/no-non-null-assertion
				.then(([createdFile]) => createdFile!),
		delete: async (ids: File['id'][]) => {
			await db.delete(files).where(inArray(files.id, ids))
		},
		findPendingByKey: async (key: File['key'], ownerId: File['ownerId']) =>
			(await db.query.files.findFirst({ where: { key, ownerId, status: 'pending' } })) ?? null,
		findStalePending: async (createdBefore: Date) =>
			db.query.files.findMany({
				where: { createdAt: { lt: createdBefore }, status: 'pending' },
			}),
		retire: async (ids: File['id'][]) => {
			if (ids.length === 0) {
				return
			}

			await db.update(files).set({ status: 'deleted' }).where(inArray(files.id, ids))
		},
	},
	ids: {
		create: () => randomUUIDv7(),
	},
	listingImages: {
		attach: async ({ fileId, listingId }: { fileId: File['id']; listingId: Listing['id'] }) => {
			await db.insert(listingImages).values({ fileId, listingId, sortOrder: 0 })
		},
		detach: async (listingId: Listing['id']) => {
			const detachedImages = await db
				.delete(listingImages)
				.where(eq(listingImages.listingId, listingId))
				.returning({ fileId: listingImages.fileId })

			return detachedImages.map((image) => image.fileId)
		},
		replace: async ({ fileId, listingId }: { fileId: File['id']; listingId: Listing['id'] }) => {
			const replacedImages = await db
				.delete(listingImages)
				.where(eq(listingImages.listingId, listingId))
				.returning({ fileId: listingImages.fileId })
			const replacedFileIds = replacedImages.map((image) => image.fileId)

			await db.insert(listingImages).values({ fileId, listingId, sortOrder: 0 })

			return replacedFileIds
		},
	},
	storage: {
		delete: async (key: File['key']) => fileStorage.delete(key),
		exists: async (key: File['key']) => fileStorage.exists(key),
	},
	uploadIntents: {
		create: (key: string, options: UploadIntentOptions) => fileStorage.getUploadUrl(key, options),
	},
})

function createFileKey(
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

async function activateVerifiedPendingFile(
	adapters: FileLifecycleAdapters,
	{ fileKey, ownerId }: Pick<AttachListingImageInput, 'fileKey' | 'ownerId'>
) {
	const file = await adapters.files.findPendingByKey(fileKey, ownerId)

	if (!file || file.ownerId !== ownerId) {
		throw new Error('File not found')
	}

	const fileExists = await adapters.storage.exists(file.key)

	if (!fileExists) {
		throw new Error('File not found')
	}

	return adapters.files.activate(file.id)
}

async function retireFiles(adapters: FileLifecycleAdapters, ids: File['id'][]) {
	if (ids.length === 0) {
		return
	}

	if (!adapters.files.retire) {
		throw new Error('File retirement is not configured')
	}

	await adapters.files.retire([...new Set(ids)])
}
