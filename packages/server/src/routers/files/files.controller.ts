import { db } from '@repo/db'
import { fileStorage } from '@repo/file-storage'
import { tryCatch } from '@repo/utils'
import { randomUUIDv7 } from 'bun'
import Elysia from 'elysia'
import z from 'zod'
import { authMacro } from '#lib/auth'
import { FileService } from './file.service'

const authorizedMimeTypes = ['image/webp'] as const

export const filesRouter = new Elysia({ name: 'files', tags: ['File'] })
	.use(authMacro)
	.decorate('fileService', FileService(db))

	.post(
		'/files/presign',
		async ({ body, user, fileService }) => {
			const ext = body.filename.split('.').pop() ?? body.contentType.split('/').pop() ?? ''
			const key = `${user.id}/${randomUUIDv7()}.${ext}`
			const url = fileStorage.getUploadUrl(key, { public: body.public })

			const asset = await fileService.createAsset({
				ownerId: user.id,
				key,
				filename: body.filename,
				contentType: body.contentType,
				size: body.size,
				status: 'pending',
			})

			return { url, asset }
		},
		{
			auth: true,
			body: z.object({
				filename: z.string().min(1),
				contentType: z.enum(authorizedMimeTypes),
				public: z.boolean().optional(),
				size: z.number().min(1),
			}),
		}
	)

	.get(
		'/files/cleanup',
		async ({ fileService }) => {
			const assets = await fileService.getPendingAssets()

			const results = await Promise.all(
				assets.map(async (asset) => {
					const [, error] = await tryCatch(fileStorage.delete(asset.key))
					if (error) return null
					return asset.id
				})
			)

			const filesDeleted = results.filter((id) => id !== null)

			await fileService.deleteAssets(filesDeleted)

			return { message: 'Cleanup complete', filesDeleted: filesDeleted.length }
		},
		{ role: 'superadmin' }
	)
