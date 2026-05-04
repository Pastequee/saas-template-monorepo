import { db } from '@repo/db'
import { Effect } from 'effect'

import {
	FileLifecycle,
	createFileLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'

import { FilesRpcs } from './files.contract'
import { UnauthorizedRpcError } from './request-auth.contract'
import { getCurrentRequestAuth } from './request-auth.rpc'

const filesRpcHandlers = FilesRpcs.toLayer({
	'files.CleanupStalePending': () =>
		Effect.gen(function* cleanupStalePending() {
			const requestAuth = yield* getCurrentRequestAuth

			if (!requestAuth) {
				return yield* Effect.fail(
					new UnauthorizedRpcError({ message: 'You are not authenticated' })
				)
			}

			const userRoles = yield* Effect.promise(() =>
				db.query.userRoles.findMany({
					where: { userId: requestAuth.user.id },
				})
			)
			const isSuperadmin = userRoles.some((userRole) => userRole.role === 'superadmin')

			if (!isSuperadmin) {
				return yield* Effect.fail(
					new UnauthorizedRpcError({ message: 'You are not authorized to access this resource' })
				)
			}

			const result = yield* Effect.promise(async () =>
				FileLifecycle(createFileLifecycleAdapters(db)).cleanupStalePendingFiles()
			)

			return { ...result, message: 'Cleanup complete' as const }
		}),
	'files.PresignUpload': ({ contentType, filename, public: isPublic, size }) =>
		Effect.gen(function* presignUpload() {
			const requestAuth = yield* getCurrentRequestAuth

			if (!requestAuth) {
				return yield* Effect.fail(
					new UnauthorizedRpcError({ message: 'You are not authenticated' })
				)
			}

			return yield* Effect.promise(async () =>
				FileLifecycle(createFileLifecycleAdapters(db)).reserveUpload({
					contentType,
					filename,
					ownerId: requestAuth.user.id,
					public: isPublic,
					size,
				})
			)
		}),
})

export const filesRpcLayer = filesRpcHandlers
