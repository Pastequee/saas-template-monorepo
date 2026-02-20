import { env } from '@repo/env/web'
import { ONE_HOUR_IN_SECONDS } from '@repo/utils'
import { S3Client } from 'bun'

import type { FileStorage } from './types'

const bucketConfig = {
	accessKey: env.S3_ACCESS_KEY,
	endpoint: env.S3_ENDPOINT,
	secretKey: env.S3_SECRET_KEY,
}

const client = new S3Client({
	accessKeyId: bucketConfig.accessKey,
	endpoint: bucketConfig.endpoint,
	secretAccessKey: bucketConfig.secretKey,
})

export const fileStorage: FileStorage = {
	delete: (key) => client.delete(key),

	exists: (key) => client.exists(key),

	getUploadUrl: (key, options) =>
		client.presign(key, {
			acl: options?.public ? 'public-read' : 'private',
			expiresIn: options?.expiresIn ?? ONE_HOUR_IN_SECONDS,
			method: 'PUT',
		}),

	getUrl: (key, options) => {
		if (options?.public) {
			return `${bucketConfig.endpoint}/${key}`
		}

		return client.presign(key, { expiresIn: options?.expiresIn ?? ONE_HOUR_IN_SECONDS })
	},
}
