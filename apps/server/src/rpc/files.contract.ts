import { Rpc, RpcGroup } from '@effect/rpc'
import { Schema } from 'effect'

import { UnauthorizedRpcError } from './request-auth.contract'

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
