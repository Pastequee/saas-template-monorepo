import { env } from '@repo/env/server'
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
	delete: async (key) => client.delete(key),

	exists: async (key) => client.exists(key),

	getUploadUrl: (key, options) => {
		const isPublic = options?.public ?? false
		const expiresIn = options?.expiresIn ?? ONE_HOUR_IN_SECONDS

		return client.presign(key, {
			acl: isPublic ? 'public-read' : 'private',
			expiresIn,
			method: 'PUT',
		})
	},

	getUrl: (key, options) => {
		const isPublic = options?.public ?? false

		if (isPublic) {
			return `${bucketConfig.endpoint}/${key}`
		}

		const expiresIn = options?.expiresIn ?? ONE_HOUR_IN_SECONDS

		return client.presign(key, { expiresIn })
	},
}
