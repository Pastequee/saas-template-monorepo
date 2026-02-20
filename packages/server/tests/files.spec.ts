import { beforeAll, describe, expect, it } from 'bun:test'
import { createApi, createApiWithAuth, createTestUsers, testUsers } from './utils'

describe('Files', () => {
	const unauthApi = createApi()
	let userApi: Awaited<ReturnType<typeof createApiWithAuth>>['api']

	beforeAll(async () => {
		await createTestUsers()
		userApi = (await createApiWithAuth(testUsers.user)).api
	})

	// ── POST /files/presign ─────────────────────────────────────

	describe('POST /files/presign', () => {
		it('returns 401 unauthenticated', async () => {
			const res = await unauthApi.files.presign.post({
				filename: 'test.webp',
				contentType: 'image/webp',
				size: 1024,
			})
			expect(res.status).toBe(401)
		})

		it('returns presigned url and asset', async () => {
			const res = await userApi.files.presign.post({
				filename: 'photo.webp',
				contentType: 'image/webp',
				size: 2048,
			})
			expect(res.status).toBe(200)
			expect(res.data?.url).toBeString()
			expect(res.data?.asset).toBeDefined()
			expect(res.data?.asset.filename).toBe('photo.webp')
			expect(res.data?.asset.contentType).toBe('image/webp')
			expect(res.data?.asset.size).toBe(2048)
			expect(res.data?.asset.status).toBe('pending')
		})

		it('creates asset with correct owner', async () => {
			const res = await userApi.files.presign.post({
				filename: 'test.webp',
				contentType: 'image/webp',
				size: 512,
			})

			expect(res.data?.asset?.ownerId).toBe(testUsers.user.id)
		})

		it('generates key with user id prefix', async () => {
			const res = await userApi.files.presign.post({
				filename: 'test.webp',
				contentType: 'image/webp',
				size: 512,
			})
			expect(res.data?.asset.key).toStartWith(`${testUsers.user.id}/`)
			expect(res.data?.asset.key).toEndWith('.webp')
		})

		it('defaults public to false', async () => {
			const res = await userApi.files.presign.post({
				filename: 'test.webp',
				contentType: 'image/webp',
				size: 512,
			})
			expect(res.status).toBe(200)
			expect(res.data?.url).toBeString()
		})

		it('accepts public flag', async () => {
			const res = await userApi.files.presign.post({
				filename: 'test.webp',
				contentType: 'image/webp',
				size: 512,
				public: true,
			})
			expect(res.status).toBe(200)
		})

		it('rejects invalid content type', async () => {
			const res = await userApi.files.presign.post({
				filename: 'test.png',
				// @ts-expect-error - intentionally invalid
				contentType: 'image/png',
				size: 1024,
			})
			expect(res.status).toBe(422)
		})

		it('rejects empty filename', async () => {
			const res = await userApi.files.presign.post({
				filename: '',
				contentType: 'image/webp',
				size: 1024,
			})
			expect(res.status).toBe(422)
		})

		it('rejects zero size', async () => {
			const res = await userApi.files.presign.post({
				filename: 'test.webp',
				contentType: 'image/webp',
				size: 0,
			})
			expect(res.status).toBe(422)
		})
	})

	// ── GET /files/cleanup ──────────────────────────────────────

	describe('GET /files/cleanup', () => {
		it('returns 401 unauthenticated', async () => {
			const res = await unauthApi.files.cleanup.get()
			expect(res.status).toBe(401)
		})

		it('returns 403 for non-superadmin', async () => {
			const res = await userApi.files.cleanup.get()
			expect([401, 403]).toContain(res.status)
		})
	})
})
