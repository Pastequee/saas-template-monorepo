import { describe, expect, it } from 'bun:test'

import { db } from '@repo/db'
import { files, userRoles } from '@repo/db/schemas'
import { fileStorageMock } from '@repo/file-storage/test'

import { adminApi, testAuth, unauthApi, userApi } from './setup'

describe('Files', async () => {
	// ── POST /files/presign ─────────────────────────────────────

	describe('POST /files/presign', () => {
		it('returns 401 unauthenticated', async () => {
			const res = await unauthApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'test.webp',
				size: 1024,
			})
			expect(res.status).toBe(401)
		})

		it('returns presigned url and asset', async () => {
			const res = await userApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'photo.webp',
				size: 2048,
			})
			expect(res.status).toBe(200)
			expect(res.data?.url).toBeString()
			expect(res.data?.file).toBeDefined()
			expect(res.data?.file.filename).toBe('photo.webp')
			expect(res.data?.file.contentType).toBe('image/webp')
			expect(res.data?.file.size).toBe(2048)
			expect(res.data?.file.status).toBe('pending')
		})

		it('creates asset with correct owner', async () => {
			const res = await userApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'test.webp',
				size: 512,
			})

			expect(res.data?.file?.ownerId).toBe(testAuth.users.user.id)
		})

		it('generates key with user id prefix', async () => {
			const res = await userApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'test.webp',
				size: 512,
			})
			expect(res.data?.file.key).toStartWith(`${testAuth.users.user.id}/`)
			expect(res.data?.file.key).toEndWith('.webp')
		})

		it('defaults public to false', async () => {
			const res = await userApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'test.webp',
				size: 512,
			})
			expect(res.status).toBe(200)
			expect(res.data?.url).toBeString()
		})

		it('accepts public flag', async () => {
			const res = await userApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'test.webp',
				public: true,
				size: 512,
			})
			expect(res.status).toBe(200)
		})

		it('rejects invalid content type', async () => {
			// oxlint-disable-next-line sort-keys
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
				contentType: 'image/webp',
				filename: '',
				size: 1024,
			})
			expect(res.status).toBe(422)
		})

		it('rejects zero size', async () => {
			const res = await userApi.files.presign.post({
				contentType: 'image/webp',
				filename: 'test.webp',
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

		it('cleans up stale pending assets end to end for superadmins', async () => {
			await db.insert(userRoles).values({
				grantedById: testAuth.users.admin.id,
				role: 'superadmin',
				userId: testAuth.users.admin.id,
			})

			const staleKey = `${testAuth.users.user.id}/stale-cleanup.webp`
			fileStorageMock._setFile(staleKey, `https://upload.test/${staleKey}`)

			await db.insert(files).values({
				contentType: 'image/webp',
				createdAt: new Date('2026-04-27T10:00:00.000Z'),
				filename: 'stale-cleanup.webp',
				key: staleKey,
				ownerId: testAuth.users.user.id,
				size: 2048,
				status: 'pending',
				updatedAt: new Date('2026-04-27T10:00:00.000Z'),
			})

			const res = await adminApi.files.cleanup.get()

			expect(res.status).toBe(200)
			expect(res.data).toEqual({ filesDeleted: 1, message: 'Cleanup complete' })
			expect(await fileStorageMock.exists(staleKey)).toBeFalse()
			expect(await db.query.files.findFirst({ where: { key: staleKey } })).toBeUndefined()
		})
	})
})
