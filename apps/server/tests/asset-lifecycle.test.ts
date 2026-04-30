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
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in reserve upload test')
				},
			},
			storage: {
				delete: async () => {},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const reservation = await assetLifecycle.reserveUpload({
			contentType: 'image/webp',
			filename: 'photo.webp',
			ownerId: 1,
			public: true,
			size: 2048,
		})

		expect(reservation.url).toBe('https://upload.test/1/upload-123.webp?public=true')
		expect(reservation.asset.ownerId).toBe(1)
		expect(reservation.asset.key).toBe('1/upload-123.webp')
		expect(reservation.asset.status).toBe('pending')
		expect(createdAssets).toEqual([
			{
				contentType: 'image/webp',
				filename: 'photo.webp',
				key: '1/upload-123.webp',
				ownerId: 1,
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
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in reserve upload test')
				},
			},
			storage: {
				delete: async () => {},
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
				ownerId: 1,
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
		const attachedImages: { assetId: string; listingId: number }[] = []
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
						key: '1/upload-123.webp',
						ownerId: 1,
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
				delete: async () => {},
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'photo.webp',
					id: 'asset-1',
					key: '1/upload-123.webp',
					ownerId: 1,
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
				findStalePending: async () => [],
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async ({ assetId, listingId }) => {
					attachedImages.push({ assetId, listingId })
				},
			},
			storage: {
				delete: async () => {},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const asset = await assetLifecycle.attachListingImage({
			assetKey: '1/upload-123.webp',
			listingId: 1,
			ownerId: 1,
		})

		expect(asset.status).toBe('active')
		expect(updatedAssets).toEqual(['asset-1'])
		expect(attachedImages).toEqual([{ assetId: 'asset-1', listingId: 1 }])
	})

	it('replaces a listing image through one lifecycle action', async () => {
		const attachedImages: { assetId: string; listingId: number }[] = []
		const replacedImages: { assetId: string; listingId: number }[] = []
		const retiredAssetIds: string[] = []
		const updatedAssets: string[] = []

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async (id) => {
					updatedAssets.push(id)
					return {
						contentType: 'image/webp',
						createdAt: new Date(),
						deletedAt: null,
						filename: 'new-photo.webp',
						id,
						key: '1/upload-456.webp',
						ownerId: 1,
						size: 2048,
						status: 'active',
						updatedAt: new Date(),
					}
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-created',
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'new-photo.webp',
					id: 'asset-2',
					key: '1/upload-456.webp',
					ownerId: 1,
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
				findStalePending: async () => [],
				retire: async (ids) => {
					retiredAssetIds.push(...ids)
				},
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async ({ assetId, listingId }) => {
					attachedImages.push({ assetId, listingId })
				},
				replace: async ({ assetId, listingId }) => {
					replacedImages.push({ assetId, listingId })
					return ['asset-1']
				},
			},
			storage: {
				delete: async () => {},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const asset = await assetLifecycle.replaceListingImage({
			assetKey: '1/upload-456.webp',
			listingId: 1,
			ownerId: 1,
		})

		expect(asset.status).toBe('active')
		expect(updatedAssets).toEqual(['asset-2'])
		expect(attachedImages).toEqual([])
		expect(replacedImages).toEqual([{ assetId: 'asset-2', listingId: 1 }])
		expect(retiredAssetIds).toEqual(['asset-1'])
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
						key: '2/upload-123.webp',
						ownerId: 2,
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
				delete: async () => {},
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'photo.webp',
					id: 'asset-1',
					key: '2/upload-123.webp',
					ownerId: 2,
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
				findStalePending: async () => [],
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					attached = true
				},
			},
			storage: {
				delete: async () => {},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		try {
			await assetLifecycle.attachListingImage({
				assetKey: '2/upload-123.webp',
				listingId: 1,
				ownerId: 1,
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

	it('rejects invalid replacements before retiring the current listing image', async () => {
		let replaced = false
		let retired = false

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					throw new Error('not used in invalid replacement test')
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-created',
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
				retire: async () => {
					retired = true
				},
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in invalid replacement test')
				},
				replace: async () => {
					replaced = true
					return ['asset-1']
				},
			},
			storage: {
				delete: async () => {},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		try {
			await assetLifecycle.replaceListingImage({
				assetKey: '1/missing.webp',
				listingId: 1,
				ownerId: 1,
			})
			throw new Error('Expected replaceListingImage to reject')
		} catch (error) {
			expect(error).toBeInstanceOf(Error)
			if (!(error instanceof Error)) {
				throw error
			}
			expect(error.message).toBe('Asset not found')
		}
		expect(replaced).toBeFalse()
		expect(retired).toBeFalse()
	})

	it('retires listing media through the asset lifecycle seam', async () => {
		const retiredAssetIds: string[] = []
		const detachedListingIds: number[] = []

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					throw new Error('not used in retire listing media test')
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-1',
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
				retire: async (ids) => {
					retiredAssetIds.push(...ids)
				},
			},
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in retire listing media test')
				},
				detach: async (listingId) => {
					detachedListingIds.push(listingId)
					return ['asset-1']
				},
			},
			storage: {
				delete: async () => {},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const result = await assetLifecycle.retireListingMedia({ listingId: 1 })

		expect(result.retiredAssetIds).toEqual(['asset-1'])
		expect(detachedListingIds).toEqual([1])
		expect(retiredAssetIds).toEqual(['asset-1'])
	})

	it('cleans up stale pending assets through the asset lifecycle seam', async () => {
		const deletedAssetIds: string[] = []
		const deletedStorageKeys: string[] = []

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					throw new Error('not used in cleanup test')
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-1',
					updatedAt: new Date(),
				}),
				delete: async (ids: string[]) => {
					deletedAssetIds.push(...ids)
				},
				findPendingByKey: async () => null,
				findStalePending: async () => [
					{
						contentType: 'image/webp',
						createdAt: new Date('2026-04-27T10:00:00.000Z'),
						deletedAt: null,
						filename: 'photo.webp',
						id: 'asset-1',
						key: '1/stale.webp',
						ownerId: 1,
						size: 2048,
						status: 'pending',
						updatedAt: new Date('2026-04-27T10:00:00.000Z'),
					},
				],
			},
			clock: {
				now: () => new Date('2026-04-30T12:00:00.000Z'),
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in cleanup test')
				},
			},
			storage: {
				delete: async (key: string) => {
					deletedStorageKeys.push(key)
				},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const result = await assetLifecycle.cleanupStalePendingAssets()

		expect(result.filesDeleted).toBe(1)
		expect(deletedStorageKeys).toEqual(['1/stale.webp'])
		expect(deletedAssetIds).toEqual(['asset-1'])
	})

	it('removes stale pending assets even when the blob is already missing', async () => {
		const deletedAssetIds: string[] = []
		let storageDeleteCalls = 0

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					throw new Error('not used in cleanup test')
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-1',
					updatedAt: new Date(),
				}),
				delete: async (ids: string[]) => {
					deletedAssetIds.push(...ids)
				},
				findPendingByKey: async () => null,
				findStalePending: async () => [
					{
						contentType: 'image/webp',
						createdAt: new Date('2026-04-27T10:00:00.000Z'),
						deletedAt: null,
						filename: 'photo.webp',
						id: 'asset-1',
						key: '1/missing.webp',
						ownerId: 1,
						size: 2048,
						status: 'pending',
						updatedAt: new Date('2026-04-27T10:00:00.000Z'),
					},
				],
			},
			clock: {
				now: () => new Date('2026-04-30T12:00:00.000Z'),
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in cleanup test')
				},
			},
			storage: {
				delete: async () => {
					storageDeleteCalls += 1
				},
				exists: async () => false,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const result = await assetLifecycle.cleanupStalePendingAssets()

		expect(result.filesDeleted).toBe(1)
		expect(storageDeleteCalls).toBe(0)
		expect(deletedAssetIds).toEqual(['asset-1'])
	})

	it('is idempotent across repeated stale cleanup runs', async () => {
		const deletedAssetIds: string[] = []
		const deletedStorageKeys: string[] = []
		const staleAssets = [
			{
				contentType: 'image/webp',
				createdAt: new Date('2026-04-27T10:00:00.000Z'),
				deletedAt: null,
				filename: 'photo.webp',
				id: 'asset-1',
				key: '1/stale.webp',
				ownerId: 1,
				size: 2048,
				status: 'pending' as const,
				updatedAt: new Date('2026-04-27T10:00:00.000Z'),
			},
		]

		const assetLifecycle = AssetLifecycle({
			assets: {
				activate: async () => {
					throw new Error('not used in cleanup test')
				},
				create: async (asset) => ({
					...asset,
					createdAt: new Date(),
					deletedAt: null,
					id: 'asset-1',
					updatedAt: new Date(),
				}),
				delete: async (ids: string[]) => {
					deletedAssetIds.push(...ids)
					for (const id of ids) {
						const index = staleAssets.findIndex((asset) => asset.id === id)
						if (index !== -1) {
							staleAssets.splice(index, 1)
						}
					}
				},
				findPendingByKey: async () => null,
				findStalePending: async () => staleAssets,
			},
			clock: {
				now: () => new Date('2026-04-30T12:00:00.000Z'),
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in cleanup test')
				},
			},
			storage: {
				delete: async (key: string) => {
					deletedStorageKeys.push(key)
				},
				exists: async () => true,
			},
			uploadIntents: {
				create: (key, options) => `https://upload.test/${key}?public=${String(options.public)}`,
			},
		})

		const firstRun = await assetLifecycle.cleanupStalePendingAssets()
		const secondRun = await assetLifecycle.cleanupStalePendingAssets()

		expect(firstRun.filesDeleted).toBe(1)
		expect(secondRun.filesDeleted).toBe(0)
		expect(deletedStorageKeys).toEqual(['1/stale.webp'])
		expect(deletedAssetIds).toEqual(['asset-1'])
	})
})
