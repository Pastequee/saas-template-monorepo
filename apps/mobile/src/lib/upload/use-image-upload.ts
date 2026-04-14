import * as FileSystem from 'expo-file-system/legacy'
import { manipulateAsync, SaveFormat } from 'expo-image-manipulator'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'

import { api } from '~/lib/api/client'
import { DEFAULT_ERROR_MESSAGE } from '~/lib/constants'

type UploadStatus = 'complete' | 'error' | 'idle' | 'processing' | 'uploading'

type UploadState = {
	error?: string
	imageKey: string
	previewUri: string
	status: UploadStatus
}

const initialState: UploadState = {
	imageKey: '',
	previewUri: '',
	status: 'idle',
}

export const useImageUpload = () => {
	const [state, setState] = useState<UploadState>(initialState)

	const reset = () => {
		setState(initialState)
	}

	const pickImage = async () => {
		setState(initialState)

		const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
		if (!permission.granted) {
			setState({
				...initialState,
				error: "L'acces a la phototheque est requis.",
				status: 'error',
			})
			return ''
		}

		const result = await ImagePicker.launchImageLibraryAsync({
			allowsEditing: true,
			mediaTypes: ImagePicker.MediaTypeOptions.Images,
			quality: 1,
			selectionLimit: 1,
		})

		if (result.canceled) {
			return ''
		}

		// oxlint-disable-next-line prefer-destructuring
		const asset = result.assets[0]
		if (!asset) {
			return ''
		}

		try {
			setState({
				...initialState,
				previewUri: asset.uri,
				status: 'processing',
			})

			const processedImage = await manipulateAsync(
				asset.uri,
				[{ resize: { width: Math.min(asset.width ?? 1600, 1600) } }],
				{ compress: 0.8, format: SaveFormat.WEBP }
			)

			const fileInfo = await FileSystem.getInfoAsync(processedImage.uri)
			const uploadSize = fileInfo.exists && fileInfo.size ? fileInfo.size : (asset.fileSize ?? 1)
			const filename = `${(asset.fileName ?? `listing-${Date.now()}`).replace(/\.[^.]+$/, '')}.webp`

			const { asset: uploadedAsset, url } = await api.presignFile({
				contentType: 'image/webp',
				filename,
				public: true,
				size: uploadSize,
			})

			setState((current) => ({
				...current,
				previewUri: processedImage.uri,
				status: 'uploading',
			}))

			await FileSystem.uploadAsync(url, processedImage.uri, {
				headers: {
					'Content-Type': 'image/webp',
				},
				httpMethod: 'PUT',
				uploadType: FileSystem.FileSystemUploadType.BINARY_CONTENT,
			})

			setState({
				error: undefined,
				imageKey: uploadedAsset.key,
				previewUri: processedImage.uri,
				status: 'complete',
			})

			return uploadedAsset.key
		} catch (error) {
			setState({
				...initialState,
				error: error instanceof Error ? error.message : DEFAULT_ERROR_MESSAGE,
				previewUri: asset.uri,
				status: 'error',
			})
			return ''
		}
	}

	return {
		hasImage: Boolean(state.imageKey),
		isUploading: state.status === 'processing' || state.status === 'uploading',
		pickImage,
		reset,
		state,
	}
}
