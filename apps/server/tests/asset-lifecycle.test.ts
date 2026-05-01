import { describe, expect, it } from 'bun:test'

import { FileLifecycle } from '../src/modules/asset-lifecycle/asset-lifecycle.service'
import { testUsers } from './utils'

describe('Asset lifecycle', () => {
	it('reserves an upload with a pending asset and upload intent', async () => {
		const createdFiles: Record<string, unknown>[] = []

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async () => {
					throw new Error('not used in reserve upload test')
				},
				create: async (file) => {
					createdFiles.push(file)
					return {
						...file,
						createdAt: new Date(),
						deletedAt: null,
						id: 1,
						updatedAt: new Date(),
					}
				},
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
			},
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
			ownerId: testUsers.user.id,
			public: true,
			size: 2048,
		})

		expect(reservation.url).toBe('https://upload.test/user-1/upload-123.webp?public=true')
		expect(reservation.file.ownerId).toBe(testUsers.user.id)
		expect(reservation.file.key).toBe('user-1/upload-123.webp')
		expect(reservation.file.status).toBe('pending')
		expect(createdFiles).toEqual([
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
		let createdFiles = 0

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async () => {
					throw new Error('not used in reserve upload test')
				},
				create: async (file) => {
					createdFiles += 1
					return {
						...file,
						createdAt: new Date(),
						deletedAt: null,
						id: 1,
						updatedAt: new Date(),
					}
				},
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
			},
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
				ownerId: testUsers.user.id,
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
		expect(createdFiles).toBe(0)
	})

	it('attaches a pending asset to a listing after upload verification', async () => {
		const attachedImages: Record<string, number>[] = []
		const updatedFiles: number[] = []

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async (id) => {
					updatedFiles.push(id)
					return {
						contentType: 'image/webp',
						createdAt: new Date(),
						deletedAt: null,
						filename: 'photo.webp',
						id,
						key: 'user-1/upload-123.webp',
						ownerId: testUsers.user.id,
						size: 2048,
						status: 'active',
						updatedAt: new Date(),
					}
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'photo.webp',
					id: 1,
					key: 'user-1/upload-123.webp',
					ownerId: testUsers.user.id,
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
				findStalePending: async () => [],
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async ({ fileId, listingId }) => {
					attachedImages.push({ fileId, listingId })
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
			fileKey: 'user-1/upload-123.webp',
			listingId: 1,
			ownerId: testUsers.user.id,
		})

		expect(asset.status).toBe('active')
		expect(updatedFiles).toEqual([1])
		expect(attachedImages).toEqual([{ fileId: 1, listingId: 1 }])
	})

	it('replaces a listing image through one lifecycle action', async () => {
		const attachedImages: Record<string, number>[] = []
		const replacedImages: Record<string, number>[] = []
		const retiredFileIds: number[] = []
		const updatedFiles: number[] = []

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async (id) => {
					updatedFiles.push(id)
					return {
						contentType: 'image/webp',
						createdAt: new Date(),
						deletedAt: null,
						filename: 'new-photo.webp',
						id,
						key: 'user-1/upload-456.webp',
						ownerId: testUsers.user.id,
						size: 2048,
						status: 'active',
						updatedAt: new Date(),
					}
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 2,
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'new-photo.webp',
					id: 2,
					key: 'user-1/upload-456.webp',
					ownerId: testUsers.user.id,
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
				findStalePending: async () => [],
				retire: async (ids) => {
					retiredFileIds.push(...ids)
				},
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async ({ fileId, listingId }) => {
					attachedImages.push({ fileId, listingId })
				},
				replace: async ({ fileId, listingId }) => {
					replacedImages.push({ fileId, listingId })
					return [2]
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
			fileKey: 'user-1/upload-456.webp',
			listingId: 1,
			ownerId: testUsers.user.id,
		})

		expect(asset.status).toBe('active')
		expect(updatedFiles).toEqual([2])
		expect(attachedImages).toEqual([])
		expect(replacedImages).toEqual([{ fileId: 2, listingId: 1 }])
		expect(retiredFileIds).toEqual([1])
	})

	it('rejects attaching an asset owned by another user', async () => {
		let activated = false
		let attached = false

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async () => {
					activated = true
					return {
						contentType: 'image/webp',
						createdAt: new Date(),
						deletedAt: null,
						filename: 'photo.webp',
						id: 1,
						key: 'user-2/upload-123.webp',
						ownerId: testUsers.user.id,
						size: 2048,
						status: 'active',
						updatedAt: new Date(),
					}
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => ({
					contentType: 'image/webp',
					createdAt: new Date(),
					deletedAt: null,
					filename: 'photo.webp',
					id: 1,
					key: 'user-2/upload-123.webp',
					ownerId: testUsers.user.id,
					size: 2048,
					status: 'pending',
					updatedAt: new Date(),
				}),
				findStalePending: async () => [],
			},
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
				fileKey: 'user-2/upload-123.webp',
				listingId: 1,
				ownerId: testUsers.user.id,
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

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async () => {
					throw new Error('not used in invalid replacement test')
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
				retire: async () => {
					retired = true
				},
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in invalid replacement test')
				},
				replace: async () => {
					replaced = true
					return [1]
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
				fileKey: 'user-1/missing.webp',
				listingId: 1,
				ownerId: testUsers.user.id,
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
		const retiredFileIds: number[] = []
		const detachedListingIds: number[] = []

		const assetLifecycle = FileLifecycle({
			clock: { now: () => new Date('2026-04-30T12:00:00.000Z') },
			files: {
				activate: async () => {
					throw new Error('not used in retire listing media test')
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async () => {},
				findPendingByKey: async () => null,
				findStalePending: async () => [],
				retire: async (ids) => {
					retiredFileIds.push(...ids)
				},
			},
			ids: { create: () => 'upload-123' },
			listingImages: {
				attach: async () => {
					throw new Error('not used in retire listing media test')
				},
				detach: async (listingId) => {
					detachedListingIds.push(listingId)
					return [1]
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

		expect(result.retiredFileIds).toEqual([1])
		expect(detachedListingIds).toEqual([1])
		expect(retiredFileIds).toEqual([1])
	})

	it('cleans up stale pending assets through the asset lifecycle seam', async () => {
		const deletedFileIds: number[] = []
		const deletedStorageKeys: string[] = []

		const assetLifecycle = FileLifecycle({
			clock: {
				now: () => new Date('2026-04-30T12:00:00.000Z'),
			},
			files: {
				activate: async () => {
					throw new Error('not used in cleanup test')
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async (ids) => {
					deletedFileIds.push(...ids)
				},
				findPendingByKey: async () => null,
				findStalePending: async () => [
					{
						contentType: 'image/webp',
						createdAt: new Date('2026-04-27T10:00:00.000Z'),
						deletedAt: null,
						filename: 'photo.webp',
						id: 1,
						key: 'user-1/stale.webp',
						ownerId: testUsers.user.id,
						size: 2048,
						status: 'pending',
						updatedAt: new Date('2026-04-27T10:00:00.000Z'),
					},
				],
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

		const result = await assetLifecycle.cleanupStalePendingFiles()

		expect(result.filesDeleted).toBe(1)
		expect(deletedStorageKeys).toEqual(['user-1/stale.webp'])
		expect(deletedFileIds).toEqual([1])
	})

	it('removes stale pending assets even when the blob is already missing', async () => {
		const deletedFileIds: number[] = []
		let storageDeleteCalls = 0

		const assetLifecycle = FileLifecycle({
			clock: {
				now: () => new Date('2026-04-30T12:00:00.000Z'),
			},
			files: {
				activate: async () => {
					throw new Error('not used in cleanup test')
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async (ids) => {
					deletedFileIds.push(...ids)
				},
				findPendingByKey: async () => null,
				findStalePending: async () => [
					{
						contentType: 'image/webp',
						createdAt: new Date('2026-04-27T10:00:00.000Z'),
						deletedAt: null,
						filename: 'photo.webp',
						id: 1,
						key: 'user-1/missing.webp',
						ownerId: testUsers.user.id,
						size: 2048,
						status: 'pending',
						updatedAt: new Date('2026-04-27T10:00:00.000Z'),
					},
				],
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

		const result = await assetLifecycle.cleanupStalePendingFiles()

		expect(result.filesDeleted).toBe(1)
		expect(storageDeleteCalls).toBe(0)
		expect(deletedFileIds).toEqual([1])
	})

	it('is idempotent across repeated stale cleanup runs', async () => {
		const deletedFileIds: number[] = []
		const deletedStorageKeys: string[] = []
		const staleFiles = [
			{
				contentType: 'image/webp',
				createdAt: new Date('2026-04-27T10:00:00.000Z'),
				deletedAt: null,
				filename: 'photo.webp',
				id: 1,
				key: 'user-1/stale.webp',
				ownerId: testUsers.user.id,
				size: 2048,
				status: 'pending' as const,
				updatedAt: new Date('2026-04-27T10:00:00.000Z'),
			},
		]

		const assetLifecycle = FileLifecycle({
			clock: {
				now: () => new Date('2026-04-30T12:00:00.000Z'),
			},
			files: {
				activate: async () => {
					throw new Error('not used in cleanup test')
				},
				create: async (file) => ({
					...file,
					createdAt: new Date(),
					deletedAt: null,
					id: 1,
					updatedAt: new Date(),
				}),
				delete: async (ids) => {
					deletedFileIds.push(...ids)
					for (const id of ids) {
						const index = staleFiles.findIndex((file) => file.id === id)
						if (index !== -1) {
							staleFiles.splice(index, 1)
						}
					}
				},
				findPendingByKey: async () => null,
				findStalePending: async () => staleFiles,
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

		const firstRun = await assetLifecycle.cleanupStalePendingFiles()
		const secondRun = await assetLifecycle.cleanupStalePendingFiles()

		expect(firstRun.filesDeleted).toBe(1)
		expect(secondRun.filesDeleted).toBe(0)
		expect(deletedStorageKeys).toEqual(['user-1/stale.webp'])
		expect(deletedFileIds).toEqual([1])
	})
})
