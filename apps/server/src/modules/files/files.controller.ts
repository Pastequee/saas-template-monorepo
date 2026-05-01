import { db } from '@repo/db'
import { Elysia } from 'elysia'
import { z } from 'zod'

import { authMacro } from '#lib/auth.macros'
import {
	FileLifecycle,
	createFileLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'

const authorizedMimeTypes = ['image/webp'] as const

export const filesRouter = new Elysia({ name: 'files', tags: ['File'] })
	.use(authMacro)
	.decorate('fileLifecycle', FileLifecycle(createFileLifecycleAdapters(db)))

	.post(
		'/files/presign',
		async ({ body, user, fileLifecycle }) =>
			fileLifecycle.reserveUpload({
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
		async ({ fileLifecycle }) => {
			const result = await fileLifecycle.cleanupStalePendingFiles()
			return { ...result, message: 'Cleanup complete' }
		},
		{ role: 'superadmin' }
	)
