import type { FileStorage } from './types'

const files = new Map<string, string>()

export const fileStorageMock: FileStorage & {
	_setFile: (key: string, url: string) => void
	_cleanFiles: () => void
} = {
	_cleanFiles: () => {
		files.clear()
	},
	_setFile: (key, url) => {
		files.set(key, url)
	},
	delete: (key) => {
		files.delete(key)
		return Promise.resolve()
	},
	exists: async (key) => await files.has(key),
	getUploadUrl: (key) => `https://${key}.com`,
	getUrl: (key) => `https://${key}.com`,
}
