import type { DatabaseType, TransactionType } from '@repo/db'
import { eq, inArray } from '@repo/db'
import { files, listingImages } from '@repo/db/schemas'
import type { File, FileInsert, Listing } from '@repo/db/types'
import { fileStorage } from '@repo/file-storage'
import { randomUUIDv7 } from 'bun'
import { subDays } from 'date-fns'

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

export const FileService = (db: DatabaseType | TransactionType) => ({
	attachListingImage: async ({ fileKey, listingId, ownerId }: AttachListingImageInput) => {
		const activeFile = await activateVerifiedPendingFile(db, { fileKey, ownerId })
		await db.insert(listingImages).values({ fileId: activeFile.id, listingId, sortOrder: 0 })

		return activeFile
	},

	cleanupStalePendingFiles: async () => {
		const staleFiles = await db.query.files.findMany({
			where: { createdAt: { lt: subDays(new Date(), 2) }, status: 'pending' },
		})
		const cleanedFileIds: File['id'][] = []

		for (const file of staleFiles) {
			const fileExists = await fileStorage.exists(file.key)

			if (!fileExists) {
				cleanedFileIds.push(file.id)
				continue
			}

			try {
				await fileStorage.delete(file.key)
				cleanedFileIds.push(file.id)
			} catch {
				continue
			}
		}

		if (cleanedFileIds.length > 0) {
			await db.delete(files).where(inArray(files.id, cleanedFileIds))
		}

		return { filesDeleted: cleanedFileIds.length }
	},

	replaceListingImage: async ({ fileKey, listingId, ownerId }: AttachListingImageInput) => {
		const activeFile = await activateVerifiedPendingFile(db, { fileKey, ownerId })
		const replacedImages = await db
			.delete(listingImages)
			.where(eq(listingImages.listingId, listingId))
			.returning({ fileId: listingImages.fileId })
		const replacedFileIds = replacedImages.map((image) => image.fileId)

		await db.insert(listingImages).values({ fileId: activeFile.id, listingId, sortOrder: 0 })
		await retireFiles(db, replacedFileIds)

		return activeFile
	},

	reserveUpload: async ({
		contentType,
		filename,
		ownerId,
		public: isPublic,
		size,
	}: ReserveUploadInput) => {
		const key = createFileKey({ contentType, filename, ownerId }, randomUUIDv7())
		const url = fileStorage.getUploadUrl(key, { public: isPublic })
		const file = await db
			.insert(files)
			.values({
				contentType,
				filename,
				key,
				ownerId,
				size,
				status: 'pending',
			})
			.returning()
			// oxlint-disable-next-line typescript/no-non-null-assertion
			.then(([createdFile]) => createdFile!)

		return { file, url }
	},

	retireListingMedia: async ({ listingId }: { listingId: Listing['id'] }) => {
		const detachedImages = await db
			.delete(listingImages)
			.where(eq(listingImages.listingId, listingId))
			.returning({ fileId: listingImages.fileId })
		const retiredFileIds = detachedImages.map((image) => image.fileId)

		await retireFiles(db, retiredFileIds)

		return { retiredFileIds }
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
	db: DatabaseType | TransactionType,
	{ fileKey, ownerId }: Pick<AttachListingImageInput, 'fileKey' | 'ownerId'>
) {
	const file = await db.query.files.findFirst({ where: { key: fileKey, ownerId, status: 'pending' } })

	if (!file || file.ownerId !== ownerId) {
		throw new Error('File not found')
	}

	const fileExists = await fileStorage.exists(file.key)

	if (!fileExists) {
		throw new Error('File not found')
	}

	return db
		.update(files)
		.set({ status: 'active' })
		.where(eq(files.id, file.id))
		.returning()
		// oxlint-disable-next-line typescript/no-non-null-assertion
		.then(([activeFile]) => activeFile!)
}

async function retireFiles(db: DatabaseType | TransactionType, ids: File['id'][]) {
	if (ids.length === 0) {
		return
	}

	await db.update(files).set({ status: 'deleted' }).where(inArray(files.id, [...new Set(ids)]))
}
