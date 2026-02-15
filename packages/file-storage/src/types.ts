type PresignedUrlOptions =
	| {
			public?: false
			expiresIn?: number
	  }
	| {
			public: true
			expiresIn?: never
	  }

export type FileStorage = {
	getUrl: (key: string, options?: PresignedUrlOptions) => string
	getUploadUrl: (key: string, options?: PresignedUrlOptions) => string
	exists: (key: string) => Promise<boolean>
	delete: (key: string) => Promise<void>
}
