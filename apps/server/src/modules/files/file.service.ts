import { eq, inArray } from '@repo/db'
import { files, listingImages } from '@repo/db/schemas'
import type { File, FileInsert, Listing } from '@repo/db/types'
import { randomUUIDv7 } from 'bun'
import { subDays } from 'date-fns'

import type { AppDeps } from '#deps'

type FileServiceDeps = Pick<AppDeps, 'db' | 'fileStorage'>

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

export const FileService = (deps: FileServiceDeps) => ({
	attachListingImage: async ({ fileKey, listingId, ownerId }: AttachListingImageInput) => {
		const activeFile = await activateVerifiedPendingFile(deps, { fileKey, ownerId })
		await deps.db.insert(listingImages).values({ fileId: activeFile.id, listingId, sortOrder: 0 })

		return activeFile
	},

	cleanupStalePendingFiles: async () => {
		const staleFiles = await deps.db.query.files.findMany({
			where: { createdAt: { lt: subDays(new Date(), 2) }, status: 'pending' },
		})
		const cleanedFileIds: File['id'][] = []

		for (const file of staleFiles) {
			const fileExists = await deps.fileStorage.exists(file.key)

			if (!fileExists) {
				cleanedFileIds.push(file.id)
				continue
			}

			try {
				await deps.fileStorage.delete(file.key)
				cleanedFileIds.push(file.id)
			} catch {
				continue
			}
		}

		if (cleanedFileIds.length > 0) {
			await deps.db.delete(files).where(inArray(files.id, cleanedFileIds))
		}

		return { filesDeleted: cleanedFileIds.length }
	},

	replaceListingImage: async ({ fileKey, listingId, ownerId }: AttachListingImageInput) => {
		const activeFile = await activateVerifiedPendingFile(deps, { fileKey, ownerId })
		const replacedImages = await deps.db
			.delete(listingImages)
			.where(eq(listingImages.listingId, listingId))
			.returning()
		const replacedFileIds = replacedImages.map((image) => image.fileId)

		await deps.db.insert(listingImages).values({ fileId: activeFile.id, listingId, sortOrder: 0 })
		await retireFiles(deps, replacedFileIds)

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
		const url = deps.fileStorage.getUploadUrl(key, { public: isPublic })
		const file = await deps.db
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
		const detachedImages = await deps.db
			.delete(listingImages)
			.where(eq(listingImages.listingId, listingId))
			.returning()
		const retiredFileIds = detachedImages.map((image) => image.fileId)

		await retireFiles(deps, retiredFileIds)

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
	deps: FileServiceDeps,
	{ fileKey, ownerId }: Pick<AttachListingImageInput, 'fileKey' | 'ownerId'>
) {
	const file = await deps.db.query.files.findFirst({
		where: { key: fileKey, ownerId, status: 'pending' },
	})

	if (!file || file.ownerId !== ownerId) {
		throw new Error('File not found')
	}

	const fileExists = await deps.fileStorage.exists(file.key)

	if (!fileExists) {
		throw new Error('File not found')
	}

	return (
		deps.db
			.update(files)
			.set({ status: 'active' })
			.where(eq(files.id, file.id))
			.returning()
			// oxlint-disable-next-line typescript/no-non-null-assertion
			.then(([activeFile]) => activeFile!)
	)
}

async function retireFiles(deps: FileServiceDeps, ids: File['id'][]) {
	if (ids.length === 0) {
		return
	}

	await deps.db
		.update(files)
		.set({ status: 'deleted' })
		.where(inArray(files.id, [...new Set(ids)]))
}
