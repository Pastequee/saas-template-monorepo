import type { FileStorage } from './types'

const files = new Map<string, string>()

export const fileStorageMock: FileStorage & {
	_setFile: (key: string, url: string) => void
	_cleanFiles: () => void
} = {
	getUrl: (key) => {
		return `https://${key}.com`
	},
	getUploadUrl: (key) => {
		return `https://${key}.com`
	},
	exists: (key) => {
		return Promise.resolve(files.has(key))
	},
	delete: (key) => {
		files.delete(key)
		return Promise.resolve()
	},
	_setFile: (key, url) => {
		files.set(key, url)
	},
	_cleanFiles: () => {
		files.clear()
	},
}
