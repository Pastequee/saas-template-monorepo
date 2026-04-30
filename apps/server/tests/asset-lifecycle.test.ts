import { describe, expect, it } from 'bun:test'

import { AssetLifecycle } from '../src/modules/asset-lifecycle/asset-lifecycle.service'

describe('Asset lifecycle', () => {
	it('reserves an upload with a pending asset and upload intent', async () => {
		const createdAssets: Record<string, unknown>[] = []

		const assetLifecycle = AssetLifecycle({
			assets: {
				create: async (asset) => {
					createdAssets.push(asset)
					return {
						...asset,
						createdAt: new Date(),
						deletedAt: null,
						id: 'asset-1',
						updatedAt: new Date(),
					}
				},
			},
			ids: { create: () => 'upload-123' },
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const reservation = await assetLifecycle.reserveUpload({
			contentType: 'image/webp',
			filename: 'photo.webp',
			ownerId: 'user-1',
			public: true,
			size: 2048,
		})

		expect(reservation.url).toBe('https://upload.test/user-1/upload-123.webp?public=true')
		expect(reservation.asset.ownerId).toBe('user-1')
		expect(reservation.asset.key).toBe('user-1/upload-123.webp')
		expect(reservation.asset.status).toBe('pending')
		expect(createdAssets).toEqual([
			{
				contentType: 'image/webp',
				filename: 'photo.webp',
				key: 'user-1/upload-123.webp',
				ownerId: 'user-1',
				size: 2048,
				status: 'pending',
			},
		])
	})

	it('does not create an asset when upload intent creation fails', async () => {
		let createdAssets = 0

		const assetLifecycle = AssetLifecycle({
			assets: {
				create: async (asset) => {
					createdAssets += 1
					return {
						...asset,
						createdAt: new Date(),
						deletedAt: null,
						id: 'asset-1',
						updatedAt: new Date(),
					}
				},
			},
			ids: { create: () => 'upload-123' },
			uploadIntents: {
				create: () => {
					throw new Error('Upload intent unavailable')
				},
			},
		})

		try {
			await assetLifecycle.reserveUpload({
				contentType: 'image/webp',
				filename: 'photo.webp',
				ownerId: 'user-1',
				size: 2048,
			})
			throw new Error('Expected upload reservation to fail')
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
			if (!(error instanceof Error)) {
				throw error
			}
			expect(error.message).toBe('Upload intent unavailable')
		}
		expect(createdAssets).toBe(0)
	})
})
