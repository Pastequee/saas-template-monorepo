import { db } from '@repo/db'
import { Elysia } from 'elysia'
import { z } from 'zod'

import { authMacro } from '#lib/auth.macros'
import {
	AssetLifecycle,
	createAssetLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'

const authorizedMimeTypes = ['image/webp'] as const

export const filesRouter = new Elysia({ name: 'files', tags: ['File'] })
	.use(authMacro)
	.decorate('assetLifecycle', AssetLifecycle(createAssetLifecycleAdapters(db)))

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
		async ({ assetLifecycle }) => {
			const result = await assetLifecycle.cleanupStalePendingAssets()
			return { ...result, message: 'Cleanup complete' }
		},
		{ role: 'superadmin' }
	)
