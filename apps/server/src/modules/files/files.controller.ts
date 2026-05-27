import { Elysia } from 'elysia'
import { z } from 'zod'

import type { AppDeps } from '#deps'
import { createAuthMacro } from '#lib/auth.macros'
import { FileService } from '#modules/files/file.service'

const authorizedMimeTypes = ['image/webp'] as const

export const createFilesRouter = (deps: AppDeps) => {
	const fileService = FileService(deps)

	return new Elysia({ name: 'files', tags: ['File'] })
		.use(createAuthMacro(deps))

		.post(
			'/files/presign',
			async ({ body, user }) => {
				try {
					const result = await fileService.reserveUpload({
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
				const result = await fileService.cleanupStalePendingFiles()
				return { ...result, message: 'Cleanup complete' }
			},
			{ role: 'superadmin' }
		)
}
