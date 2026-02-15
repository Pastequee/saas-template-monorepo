/** biome-ignore-all lint/style/noNonNullAssertion: fuck off */
import { beforeAll, describe, expect, it } from 'bun:test'
import { fileStorageMock } from '@repo/file-storage/test'
import { randomUUIDv7 } from 'bun'
import { createApi, createApiWithAuth, createTestUsers, testUsers } from './utils'

/** Presign a test image and simulate S3 upload. Returns the asset key. */
async function presignImage(api: Awaited<ReturnType<typeof createApiWithAuth>>['api']) {
	const res = await api.files.presign.post({
		filename: 'test.webp',
		contentType: 'image/webp',
		size: 1024,
		public: false,
	})

	if (!res.data) {
		console.error('presign failed:', res.status, res.error)
		throw new Error(`presign failed: ${res.status}`)
	}
	const key = res.data.asset.key
	fileStorageMock._setFile(key, res.data.url)
	return key
}

const validListing = { title: 'Test Listing', description: 'A test description', price: 100 }

describe('Listings', () => {
	const unauthApi = createApi()
	let userApi: Awaited<ReturnType<typeof createApiWithAuth>>['api']
	let adminApi: Awaited<ReturnType<typeof createApiWithAuth>>['api']

	beforeAll(async () => {
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
			const id = created.data!.id

			const res = await userApi.listings({ id }).get()
			expect(res.status).toBe(200)
			expect(res.data?.title).toBe(validListing.title)
			expect(res.data?.image).toBeString()
		})

		it('returns 404 for nonexistent id', async () => {
			const res = await userApi.listings({ id: randomUUIDv7() }).get()
			expect(res.status).toBe(404)
		})
	})

	// // ── POST /listings ──────────────────────────────────────────

	describe('POST /listings', () => {
		it('creates listing with image, returns 201', async () => {
			const imageKey = await presignImage(userApi)
			const res = await userApi.listings.post({ ...validListing, imageKey })

			expect(res.status).toBe(201)
			expect(res.data?.title).toBe(validListing.title)
			expect(res.data?.price).toBe(validListing.price)
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
			const id = created.data!.id

			const res = await userApi.listings({ id }).patch({ title: 'Updated' })
			expect(res.status).toBe(200)
			expect(res.data?.title).toBe('Updated')
		})

		it('updates listing image', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const id = created.data!.id

			const newImageKey = await presignImage(userApi)
			const res = await userApi.listings({ id }).patch({ imageKey: newImageKey })
			expect(res.status).toBe(200)
		})

		it('returns 403 when updating another users listing', async () => {
			const imageKey = await presignImage(adminApi)
			const created = await adminApi.listings.post({ ...validListing, imageKey })
			const id = created.data!.id

			const res = await userApi.listings({ id }).patch({ title: 'Hacked' })
			expect(res.status).toBe(403)
		})

		it('returns 404 for nonexistent id', async () => {
			const res = await userApi.listings({ id: randomUUIDv7() }).patch({ title: 'Nope' })
			expect(res.status).toBe(404)
		})

		it('returns unchanged listing when body is empty', async () => {
			const imageKey = await presignImage(userApi)
			const created = await userApi.listings.post({ ...validListing, imageKey })
			const id = created.data!.id

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
			const id = created.data!.id

			const res = await userApi.listings({ id }).delete()
			expect(res.status).toBe(204)

			const getRes = await userApi.listings({ id }).get()
			expect(getRes.status).toBe(404)
		})

		it('returns 403 when deleting another users listing', async () => {
			const imageKey = await presignImage(adminApi)
			const created = await adminApi.listings.post({ ...validListing, imageKey })
			const id = created.data!.id

			const res = await userApi.listings({ id }).delete()
			expect(res.status).toBe(403)
		})

		it('returns 404 for nonexistent id', async () => {
			const res = await userApi.listings({ id: randomUUIDv7() }).delete()
			expect(res.status).toBe(404)
		})
	})

	// // ── GET /listings/search ────────────────────────────────────

	describe('GET /listings/search', () => {
		it('finds listings by title match', async () => {
			const imageKey = await presignImage(userApi)
			await userApi.listings.post({ ...validListing, title: 'Vintage Guitar', imageKey })

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
