import { db } from '@repo/db'
import { fileStorage } from '@repo/file-storage'
import { tryCatch } from '@repo/utils'
import { Elysia } from 'elysia'
import { z } from 'zod'

import { authMacro } from '#lib/auth.macros'
import {
	AssetLifecycle,
	createAssetLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'

import { FileService } from './file.service'

const authorizedMimeTypes = ['image/webp'] as const

export const filesRouter = new Elysia({ name: 'files', tags: ['File'] })
	.use(authMacro)
	.decorate('assetLifecycle', AssetLifecycle(createAssetLifecycleAdapters(db)))
	.decorate('fileService', FileService(db))

	.post(
		'/files/presign',
		async ({ body, user, assetLifecycle }) =>
			assetLifecycle.reserveUpload({
				...body,
				ownerId: user.id,
			}),
		{
			auth: true,
			body: z.object({
				contentType: z.enum(authorizedMimeTypes),
				filename: z.string().min(1),
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
					if (error) {
						return null
					}
					return asset.id
				})
			)

			const filesDeleted = results.filter((id) => id !== null)

			await fileService.deleteAssets(filesDeleted)

			return { filesDeleted: filesDeleted.length, message: 'Cleanup complete' }
		},
		{ role: 'superadmin' }
	)
