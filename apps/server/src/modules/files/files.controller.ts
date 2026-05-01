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

	.post(
		'/files/presign',
		async ({ body, user }) => {
			try {
				const result = await FileLifecycle(createFileLifecycleAdapters(db)).reserveUpload({
					...body,
					ownerId: user.id,
				})
				return result
			} catch (error) {
				console.error(error)
				throw new Error('Failed to reserve upload', { cause: error })
			}
		},
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
		async () => {
			const result = await FileLifecycle(createFileLifecycleAdapters(db)).cleanupStalePendingFiles()
			return { ...result, message: 'Cleanup complete' }
		},
		{ role: 'superadmin' }
	)
