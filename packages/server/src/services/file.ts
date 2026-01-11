import { S3Client } from 'bun'

const bucketInfos = {
	name: 'bucket-name',
	region: 'bucket-region',
	endpoint: 'endpoint.com',
}

const client = new S3Client({})

type PresignedUrlOptions = {
	public?: boolean
	expiresIn?: number
}

const ONE_HOUR = 3600

export const files = {
	getUrl: (key: string, options?: PresignedUrlOptions) => {
		if (options?.public) {
			return `https://${bucketInfos.name}.${bucketInfos.endpoint}/${key}`
		}

		return client.presign(key, { expiresIn: options?.expiresIn ?? ONE_HOUR })
	},

	getUploadUrl: (key: string, options?: PresignedUrlOptions) =>
		client.presign(key, {
			method: 'PUT',
			expiresIn: options?.expiresIn ?? ONE_HOUR,
			acl: options?.public ? 'public-read' : undefined,
		}),

	exists: (key: string) => client.exists(key),

	delete: (key: string) => client.delete(key),
}
