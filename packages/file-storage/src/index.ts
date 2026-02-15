import { env } from '@repo/env/web'
import { ONE_HOUR_IN_SECONDS } from '@repo/utils'
import { S3Client } from 'bun'
import type { FileStorage } from './types'

const bucketConfig = {
	accessKey: env.S3_ACCESS_KEY,
	secretKey: env.S3_SECRET_KEY,
	endpoint: env.S3_ENDPOINT,
}

const client = new S3Client({
	endpoint: bucketConfig.endpoint,
	accessKeyId: bucketConfig.accessKey,
	secretAccessKey: bucketConfig.secretKey,
})

export const fileStorage: FileStorage = {
	getUrl: (key, options) => {
		if (options?.public) {
			return `${bucketConfig.endpoint}/${key}`
		}

		return client.presign(key, { expiresIn: options?.expiresIn ?? ONE_HOUR_IN_SECONDS })
	},

	getUploadUrl: (key, options) =>
		client.presign(key, {
			method: 'PUT',
			expiresIn: options?.expiresIn ?? ONE_HOUR_IN_SECONDS,
			acl: options?.public ? 'public-read' : 'private',
		}),

	exists: (key) => client.exists(key),

	delete: (key) => client.delete(key),
}
