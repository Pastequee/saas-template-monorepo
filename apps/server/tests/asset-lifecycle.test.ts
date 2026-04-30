import { describe, expect, it } from 'bun:test'

import { AssetLifecycle } from '../src/modules/asset-lifecycle/asset-lifecycle.service'

describe('Asset lifecycle', () => {
	it('reserves an upload with a pending asset and upload intent', async () => {
		const createdAssets: Record<string, unknown>[] = []

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					throw new Error('not used in reserve upload test')
				},
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
				findPendingByKey: async () => null,
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in reserve upload test')
				},
			},
			storage: {
				exists: async () => true,
			},
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
				activate: async () => {
					throw new Error('not used in reserve upload test')
				},
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
				findPendingByKey: async () => null,
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in reserve upload test')
				},
			},
			storage: {
				exists: async () => true,
			},
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

	it('attaches a pending asset to a listing after upload verification', async () => {
		const attachedImages: Record<string, string>[] = []
		const updatedAssets: string[] = []

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async (id) => {
					updatedAssets.push(id)
					return {
						contentType: 'image/webp',
						createdAt: new Date(),
						deletedAt: null,
						filename: 'photo.webp',
						id,
						key: 'user-1/upload-123.webp',
						ownerId: 'user-1',
						size: 2048,
						status: 'active',
						updatedAt: new Date(),
					}
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-1',
					updatedAt: new Date(),
				}),
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'photo.webp',
					id: 'asset-1',
					key: 'user-1/upload-123.webp',
					ownerId: 'user-1',
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async ({ assetId, listingId }) => {
					attachedImages.push({ assetId, listingId })
				},
			},
			storage: {
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const asset = await assetLifecycle.attachListingImage({
			assetKey: 'user-1/upload-123.webp',
			listingId: 'listing-1',
			ownerId: 'user-1',
		})

		expect(asset.status).toBe('active')
		expect(updatedAssets).toEqual(['asset-1'])
		expect(attachedImages).toEqual([{ assetId: 'asset-1', listingId: 'listing-1' }])
	})

	it('rejects attaching an asset owned by another user', async () => {
		let activated = false
		let attached = false

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					activated = true
					return {
						contentType: 'image/webp',
						createdAt: new Date(),
						deletedAt: null,
						filename: 'photo.webp',
						id: 'asset-1',
						key: 'user-2/upload-123.webp',
						ownerId: 'user-2',
						size: 2048,
						status: 'active',
						updatedAt: new Date(),
					}
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-1',
					updatedAt: new Date(),
				}),
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'photo.webp',
					id: 'asset-1',
					key: 'user-2/upload-123.webp',
					ownerId: 'user-2',
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					attached = true
				},
			},
			storage: {
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		try {
			await assetLifecycle.attachListingImage({
				assetKey: 'user-2/upload-123.webp',
				listingId: 'listing-1',
				ownerId: 'user-1',
			})
			throw new Error('Expected attachListingImage to reject')
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
			if (!(error instanceof Error)) {
				throw error
			}
			expect(error.message).toBe('Asset not found')
		}
		expect(activated).toBeFalse()
		expect(attached).toBeFalse()
	})
})
