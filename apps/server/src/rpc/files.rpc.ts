import { Rpc, RpcGroup } from '@effect/rpc'
import { db } from '@repo/db'
import { Effect, Schema } from 'effect'

import {
	FileLifecycle,
	createFileLifecycleAdapters,
} from '#modules/asset-lifecycle/asset-lifecycle.service'

import { getCurrentRequestAuth, UnauthorizedRpcError } from './request-auth.rpc'

const FileRecord = Schema.Struct({
	contentType: Schema.String,
	createdAt: Schema.Date,
	deletedAt: Schema.NullOr(Schema.Date),
	filename: Schema.String,
	id: Schema.Number,
	key: Schema.String,
	ownerId: Schema.Number,
	size: Schema.Number,
	status: Schema.String,
	updatedAt: Schema.Date,
})

const PresignUploadInput = Schema.Struct({
	contentType: Schema.Literal('image/webp'),
	filename: Schema.NonEmptyString,
	public: Schema.optional(Schema.Boolean),
	size: Schema.Number.pipe(Schema.positive()),
})

const PresignUploadResponse = Schema.Struct({
	file: FileRecord,
	url: Schema.String,
})

const CleanupStalePendingResponse = Schema.Struct({
	filesDeleted: Schema.Number,
	message: Schema.Literal('Cleanup complete'),
})

export const FilesRpcs = RpcGroup.make(
	Rpc.make('PresignUpload', {
		payload: PresignUploadInput,
		success: PresignUploadResponse,
	}).setError(UnauthorizedRpcError),
	Rpc.make('CleanupStalePending', {
		success: CleanupStalePendingResponse,
	}).setError(UnauthorizedRpcError)
).prefix('files.')

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
