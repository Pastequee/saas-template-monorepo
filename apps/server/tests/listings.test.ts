// oxlint-disable typescript/no-non-null-assertion
// oxlint-disable unicorn/no-await-expression-member
import { beforeEach, describe, expect, it } from 'bun:test'

import { db } from '@repo/db'
import { listings } from '@repo/db/schemas'
import { fileStorageMock } from '@repo/file-storage/test'

import { createApi, createApiWithAuth, createTestUsers, testUsers } from './utils'

/** Presign a test image and simulate S3 upload. Returns the asset key. */
async function presignImage(api: Awaited<ReturnType<typeof createApiWithAuth>>['api']) {
	const res = await api.files.presign.post({
		contentType: 'image/webp',
		filename: 'test.webp',
		public: false,
		size: 1024,
	})

	if (!res.data) {
		console.error('presign failed:', res.status, res.error)
		throw new Error(`presign failed: ${res.status}`)
	}
	const { key } = res.data.asset
	fileStorageMock._setFile(key, res.data.url)
	return key
}

const validListing = { description: 'A test description', price: 100, title: 'Test Listing' }

describe('Listings', () => {
	const unauthApi = createApi()
	let userApi: Awaited<ReturnType<typeof createApiWithAuth>>['api']
	let adminApi: Awaited<ReturnType<typeof createApiWithAuth>>['api']

	beforeEach(async () => {
		await createTestUsers()
		userApi = (await createApiWithAuth(testUsers.user)).api
		adminApi = (await createApiWithAuth(testUsers.admin)).api
	})

	// ── Auth guard ──────────────────────────────────────────────

	describe('auth guard', () => {
		it('GET /listings returns 401 unauthenticated', async () => {
			const res = await unauthApi.listings.get()
			expect(res.status).toBe(401)
		})

		it('POST /listings returns 401 unauthenticated', async () => {
			const res = await unauthApi.listings.post({ ...validListing, imageKey: 'fake' })
			expect(res.status).toBe(401)
		})
	})

	// ── GET /listings ───────────────────────────────────────────

	describe('GET /listings', () => {
		it('returns empty array when no listings', async () => {
			const res = await userApi.listings.get()
			expect(res.status).toBe(200)
			expect(res.data).toEqual([])
		})

		it('returns user listings with image urls', async () => {
			const imageKey = await presignImage(userApi)
			await userApi.listings.post({ ...validListing, imageKey })

			const res = await userApi.listings.get()
			expect(res.status).toBe(200)
			expect(res.data).toHaveLength(1)
			expect(res.data?.at(0)?.title).toBe(validListing.title)
			expect(res.data?.at(0)?.image).toBeString()
		})

		it('does not return other users listings', async () => {
			const imageKey = await presignImage(adminApi)
			await adminApi.listings.post({ ...validListing, imageKey })

			const res = await userApi.listings.get()
			expect(res.status).toBe(200)
			expect(res.data).toEqual([])
		})
	})

	// // ── GET /listings/:id ───────────────────────────────────────

	describe('GET /listings/:id', () => {
		it('returns listing with image url', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).get()
			expect(res.status).toBe(200)
			expect(res.data?.title).toBe(validListing.title)
			expect(res.data?.image).toBeString()
		})

		it('rejects invalid numeric route params at the boundary', async () => {
			const res = await userApi.listings({ id: '0' }).get()
			expect(res.status).toBe(422)
		})

		it('rejects non-decimal numeric route params at the boundary', async () => {
			const res = await userApi.listings({ id: '1e2' }).get()
			expect(res.status).toBe(422)
		})

		it('returns 404 for nonexistent id', async () => {
			const res = await userApi.listings({ id: 999_999 }).get()
			expect(res.status).toBe(404)
		})
	})

	// // ── POST /listings ──────────────────────────────────────────

	describe('POST /listings', () => {
		it('creates listing with image, returns 201', async () => {
			const imageKey = await presignImage(userApi)
			const res = await userApi.listings.post({ ...validListing, imageKey })

			expect(res.status).toBe(201)
			expect(res.data?.id).toBeNumber()
			expect(res.data?.title).toBe(validListing.title)
			expect(res.data?.price).toBe(validListing.price)
		})

		it('stores numeric asset ownership and listing-media relation ids', async () => {
			const imageKey = await presignImage(userApi)
			const res = await userApi.listings.post({ ...validListing, imageKey })

			const asset = await db.query.assets.findFirst({ where: { key: imageKey } })
			const relation = await db.query.listingImages.findFirst({
				where: { listingId: res.data!.id },
			})

			expect(asset).toBeDefined()
			expect(asset?.id).toBeNumber()
			expect(asset?.ownerId).toBe(testUsers.user.id)
			expect(relation).toBeDefined()
			expect(relation?.assetId).toBe(asset?.id)
			expect(relation?.listingId).toBe(res.data?.id)
		})

		it('validates required fields', async () => {
			// @ts-expect-error - intentionally missing fields
			const res = await userApi.listings.post({})
			expect(res.status).toBe(422)
		})
	})

	// // ── PATCH /listings/:id ─────────────────────────────────────

	describe('PATCH /listings/:id', () => {
		it('updates listing fields', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).patch({ title: 'Updated' })
			expect(res.status).toBe(200)
			expect(res.data?.title).toBe('Updated')
		})

		it('updates listing image', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const newImageKey = await presignImage(userApi)
			const res = await userApi.listings({ id }).patch({ imageKey: newImageKey })
			expect(res.status).toBe(200)
		})

		it('returns 403 when updating another users listing', async () => {
			const imageKey = await presignImage(adminApi)
			const created = await adminApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).patch({ title: 'Hacked' })
			expect(res.status).toBe(403)
		})

		it('returns 404 for nonexistent id', async () => {
			const res = await userApi.listings({ id: 999_999 }).patch({ title: 'Nope' })
			expect(res.status).toBe(404)
		})

		it('returns unchanged listing when body is empty', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).patch({})
			expect(res.status).toBe(200)
			expect(res.data?.title).toBe(validListing.title)
		})
	})

	// // ── DELETE /listings/:id ────────────────────────────────────

	describe('DELETE /listings/:id', () => {
		it('deletes listing, returns 204', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).delete()
			expect(res.status).toBe(204)

			const getRes = await userApi.listings({ id }).get()
			expect(getRes.status).toBe(404)
		})

		it('retires attached media when deleting a listing', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).delete()

			expect(res.status).toBe(204)
			expect(await db.query.assets.findFirst({ where: { key: imageKey } })).toMatchObject({
				key: imageKey,
				status: 'deleted',
			})
		})

		it('deletes a listing safely when no image is attached', async () => {
			const [listing] = await db
				.insert(listings)
				.values({
					description: validListing.description,
					price: validListing.price,
					title: `${validListing.title} without image`,
					userId: testUsers.user.id,
				})
				.returning()

			const res = await userApi.listings({ id: listing!.id }).delete()

			expect(res.status).toBe(204)
			expect(await db.query.listings.findFirst({ where: { id: listing!.id } })).toBeUndefined()
		})

		it('returns 403 when deleting another users listing', async () => {
			const imageKey = await presignImage(adminApi)
			const created = await adminApi.listings.post({ ...validListing, imageKey })
			const { id } = created.data!

			const res = await userApi.listings({ id }).delete()
			expect(res.status).toBe(403)
		})

		it('returns 404 for nonexistent id', async () => {
			const res = await userApi.listings({ id: 999_999 }).delete()
			expect(res.status).toBe(404)
		})
	})

	// // ── GET /listings/search ────────────────────────────────────

	describe('GET /listings/search', () => {
		it('finds listings by title match', async () => {
			const imageKey = await presignImage(userApi)
			await userApi.listings.post({ ...validListing, imageKey, title: 'Vintage Guitar' })

			const res = await userApi.listings.search.get({ query: { q: 'Guitar' } })
			expect(res.status).toBe(200)
			expect(res.data).toHaveLength(1)
			expect(res.data?.at(0)?.title).toBe('Vintage Guitar')
		})

		it('finds listings by description match', async () => {
			const imageKey = await presignImage(userApi)
			await userApi.listings.post({
				...validListing,
				description: 'Rare collectible item',
				imageKey,
			})

			const res = await userApi.listings.search.get({ query: { q: 'collectible' } })
			expect(res.status).toBe(200)
			expect(res.data).toHaveLength(1)
		})

		it('returns empty array for no match', async () => {
			const res = await userApi.listings.search.get({ query: { q: 'nonexistent' } })
			expect(res.status).toBe(200)
			expect(res.data).toEqual([])
		})
	})
})
