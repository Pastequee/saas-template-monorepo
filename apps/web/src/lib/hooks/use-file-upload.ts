import { useEffect, useEffectEvent, useRef, useState } from 'react'
import type { ChangeEvent, InputHTMLAttributes } from 'react'

import { eden } from '~/lib/server-fn/eden'

// ── Types ──────────────────────────────────────────────────────────────

export type UploadStatus = 'processing' | 'uploading' | 'complete' | 'error'

export type UploadingFile = {
	file: File
	id: string
	preview?: string
	status: UploadStatus
	progress: number
	assetKey?: string
	error?: string
}

export type FileUploadState = {
	files: UploadingFile[]
	errors: string[]
}

export type FileUploadOptions = {
	maxSize?: number
	accept?: string
	maxWidth?: number
	maxHeight?: number
	quality?: number
	public?: boolean
	onFilesChange?: (files: UploadingFile[]) => void
	onFileUploaded?: (file: UploadingFile) => void
	onError?: (errors: string[]) => void
} & ({ multiple: true; maxFiles?: number } | { multiple?: false; maxFiles?: never })

// ── Image processing (Canvas API) ─────────────────────────────────────

function processImage(
	file: File,
	opts: { maxWidth: number; maxHeight: number; quality: number }
): Promise<Blob> {
	// oxlint-disable-next-line promise/avoid-new
	return new Promise((resolve, reject) => {
		const img = new Image()
		const url = URL.createObjectURL(file)

		img.addEventListener('load', () => {
			URL.revokeObjectURL(url)

			let { width, height } = img
			const ratio = Math.min(opts.maxWidth / width, opts.maxHeight / height, 1)
			width = Math.round(width * ratio)
			height = Math.round(height * ratio)

			const canvas = document.createElement('canvas')
			canvas.width = width
			canvas.height = height
			const ctx = canvas.getContext('2d')
			if (!ctx) {
				return reject(new Error("Impossible d'obtenir le contexte du canvas"))
			}

			ctx.drawImage(img, 0, 0, width, height)

			canvas.toBlob(
				(blob) => {
					if (blob) {
						resolve(blob)
					} else {
						reject(new Error('Impossible de convertir le canvas en blob'))
					}
				},
				'image/webp',
				opts.quality
			)
		})

		img.addEventListener('error', () => {
			URL.revokeObjectURL(url)
			reject(new Error("Impossible de charger l'image"))
		})

		img.src = url
	})
}

// ── S3 upload via XHR (for progress) ──────────────────────────────────

function uploadToS3(
	url: string,
	blob: Blob,
	onProgress: (pct: number) => void,
	signal: { xhr: XMLHttpRequest | null }
): Promise<void> {
	// oxlint-disable-next-line promise/avoid-new
	return new Promise((resolve, reject) => {
		const xhr = new XMLHttpRequest()
		signal.xhr = xhr

		xhr.upload.addEventListener('progress', (e) => {
			if (e.lengthComputable) {
				onProgress(Math.round((e.loaded / e.total) * 100))
			}
		})

		xhr.addEventListener('load', () => {
			if (xhr.status >= 200 && xhr.status < 300) {
				resolve()
			} else {
				reject(new Error(`Échec de l'upload S3 : ${xhr.status}`))
			}
		})

		xhr.addEventListener('error', () => reject(new Error("Erreur réseau lors de l'upload S3")))
		xhr.addEventListener('abort', () => reject(new Error('Upload annulé')))

		xhr.open('PUT', url)
		xhr.setRequestHeader('Content-Type', 'image/webp')
		xhr.send(blob)
	})
}

// ── Hook ───────────────────────────────────────────────────────────────

export function useFileUpload(options: FileUploadOptions = {}) {
	const {
		maxFiles = Number.POSITIVE_INFINITY,
		maxSize = Number.POSITIVE_INFINITY,
		accept = 'image/*',
		multiple = false,
		maxWidth = 1920,
		maxHeight = 1080,
		quality = 0.7,
		public: isPublic = false,
		onFilesChange,
		onFileUploaded,
		onError,
	} = options

	const [state, setState] = useState<FileUploadState>({ errors: [], files: [] })
	const inputRef = useRef<HTMLInputElement>(null)
	const xhrMapRef = useRef(new Map<string, XMLHttpRequest>())

	const cleanup = useEffectEvent(() => {
		for (const file of state.files) {
			if (file.preview) {
				URL.revokeObjectURL(file.preview)
			}
		}
		// Abort any in-flight XHR requests
		for (const xhr of xhrMapRef.current.values()) {
			xhr.abort()
		}
	})

	// Revoke preview URLs on unmount
	useEffect(
		() => () => {
			cleanup()
		},
		[]
	)

	// ── Helpers ──────────────────────────────────────────────────────────

	const updateFile = (id: string, patch: Partial<UploadingFile>) => {
		setState((prev) => {
			const files = prev.files.map((f) => (f.id === id ? { ...f, ...patch } : f))
			onFilesChange?.(files)
			return { ...prev, files }
		})
	}

	const uploadFile = async (entry: UploadingFile) => {
		try {
			// 1. Process image
			updateFile(entry.id, { status: 'processing' })
			const blob = await processImage(entry.file, { maxHeight, maxWidth, quality })

			// 2. Presign
			const webpFilename = entry.file.name.replace(/\.[^.]+$/, '.webp')
			const { data, error } = await eden().files.presign.post({
				contentType: 'image/webp',
				filename: webpFilename,
				public: isPublic,
				size: blob.size,
			})

			if (error || !data) {
				throw new Error("Impossible d'obtenir l'URL signée")
			}

			// 3. Upload to S3
			updateFile(entry.id, { progress: 0, status: 'uploading' })
			const signal = { xhr: null as XMLHttpRequest | null }

			// uploadToS3 sets signal.xhr synchronously before returning the promise
			const uploadPromise = uploadToS3(
				data.url,
				blob,
				(pct) => updateFile(entry.id, { progress: pct }),
				signal
			)

			// Store xhr ref right after creation
			if (signal.xhr) {
				xhrMapRef.current.set(entry.id, signal.xhr)
			}

			await uploadPromise

			// 4. Complete
			updateFile(entry.id, { assetKey: data.asset.key, progress: 100, status: 'complete' })
			onFileUploaded?.({ ...entry, assetKey: data.asset.key, progress: 100, status: 'complete' })
			xhrMapRef.current.delete(entry.id)
		} catch (error) {
			const message = error instanceof Error ? error.message : "Échec de l'upload"
			if (message === 'Upload annulé') {
				return
			}
			updateFile(entry.id, { error: message, status: 'error' })
		} finally {
			xhrMapRef.current.delete(entry.id)
		}
	}

	// ── Public API ───────────────────────────────────────────────────────

	const addFiles = (files: FileList | File[]) => {
		if (!files || (files instanceof FileList && files.length === 0)) {
			return
		}

		const arr = [...files]
		const errors: string[] = []

		if (
			multiple &&
			maxFiles !== Number.POSITIVE_INFINITY &&
			state.files.length + arr.length > maxFiles
		) {
			errors.push(`Maximum ${maxFiles} fichier(s) autorisé(s).`)
			onError?.(errors)
			setState((prev) => ({ ...prev, errors }))
			return
		}

		const entries: UploadingFile[] = []

		for (const file of arr) {
			if (file.size > maxSize) {
				errors.push(`"${file.name}" dépasse ${formatBytes(maxSize)}.`)
				continue
			}
			entries.push({
				file,
				id: crypto.randomUUID(),
				preview: URL.createObjectURL(file),
				progress: 0,
				status: 'processing',
			})
		}

		if (errors.length > 0) {
			onError?.(errors)
		}

		if (entries.length === 0) {
			setState((prev) => ({ ...prev, errors }))
			return
		}

		setState((prev) => {
			const newFiles = multiple ? [...prev.files, ...entries] : entries

			// Revoke old previews when replacing in single mode
			if (!multiple) {
				for (const f of prev.files) {
					if (f.preview) {
						URL.revokeObjectURL(f.preview)
					}
				}
				// Abort old uploads
				xhrMapRef.current.clear()
			}

			onFilesChange?.(newFiles)
			return { errors, files: newFiles }
		})

		// Kick off uploads
		for (const entry of entries) {
			uploadFile(entry)
		}

		if (inputRef.current) {
			inputRef.current.value = ''
		}
	}

	const removeFile = (id: string) => {
		// Abort entire pipeline (presign fetch + XHR)
		xhrMapRef.current.delete(id)

		setState((prev) => {
			const target = prev.files.find((f) => f.id === id)
			if (target?.preview) {
				URL.revokeObjectURL(target.preview)
			}

			const files = prev.files.filter((f) => f.id !== id)
			onFilesChange?.(files)
			return { ...prev, files }
		})
	}

	const clearFiles = () => {
		xhrMapRef.current.clear()

		setState((prev) => {
			for (const f of prev.files) {
				if (f.preview) {
					URL.revokeObjectURL(f.preview)
				}
			}
			onFilesChange?.([])
			return { errors: [], files: [] }
		})

		if (inputRef.current) {
			inputRef.current.value = ''
		}
	}

	const clearErrors = () => setState((prev) => ({ ...prev, errors: [] }))

	const openFileDialog = () => inputRef.current?.click()

	const getInputProps = (props: InputHTMLAttributes<HTMLInputElement> = {}) => ({
		...props,
		accept: props.accept || accept,
		multiple: props.multiple === undefined ? multiple : props.multiple,
		onChange: (e: ChangeEvent<HTMLInputElement>) => addFiles(e.target.files ?? []),
		ref: inputRef,
		type: 'file' as const,
	})

	return [
		state,
		{ addFiles, clearErrors, clearFiles, getInputProps, openFileDialog, removeFile },
	] as const
}

function formatBytes(bytes: number, decimals = 2): string {
	if (bytes === 0) {
		return '0 Octets'
	}

	const k = 1024
	const dm = Math.max(0, decimals)
	const sizes = ['Octets', 'Ko', 'Mo', 'Go', 'To', 'Po', 'Eo', 'Zo', 'Yo']

	const i = Math.floor(Math.log(bytes) / Math.log(k))

	return `${Number.parseFloat((bytes / k ** i).toFixed(dm))} ${sizes[i]}`
}
