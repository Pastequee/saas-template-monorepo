import { describe, expect, it } from 'bun:test'

import { db } from '@repo/db'
import { files, userRoles } from '@repo/db/schemas'
import { fileStorageMock } from '@repo/file-storage/test'
import { Effect } from 'effect'
import { z } from 'zod'

import { app } from '../src/app'
import { resolveRequestAuth } from '../src/lib/request-auth'
import { testAuth } from './utils'

const healthResponseSchema = z.object({
	database: z.literal('healthy'),
	environment: z.literal('test'),
	status: z.literal('healthy'),
})

const authSessionSchema = z.object({
	user: z.object({
		email: z.string(),
	}),
})

const currentUserResponseSchema = z.array(
	z.object({
		result: z.object({
			session: z.object({
				userId: z.string(),
			}),
			user: z.object({
				email: z.email(),
				id: z.number(),
				role: z.string(),
			}),
		}),
	})
)

const filePresignResponseSchema = z.array(
	z.object({
		result: z.object({
			file: z.object({
				contentType: z.literal('image/webp'),
				filename: z.string(),
				id: z.number(),
				key: z.string(),
				ownerId: z.number(),
				size: z.number(),
				status: z.literal('pending'),
			}),
			url: z.url(),
		}),
	})
)

const fileCleanupResponseSchema = z.array(
	z.object({
		result: z.object({
			filesDeleted: z.number(),
			message: z.literal('Cleanup complete'),
		}),
	})
)

const listingRecordSchema = z.object({
	description: z.string(),
	id: z.number(),
	price: z.number(),
	title: z.string(),
	userId: z.number(),
})

const listingWithImageSchema = listingRecordSchema.extend({
	image: z.string().nullable(),
})

const listingDetailSchema = listingWithImageSchema.extend({
	user: z.object({
		id: z.number(),
		name: z.string(),
	}),
})

const listingResponseSchema = z.array(
	z.object({
		result: listingRecordSchema,
	})
)

const listingCollectionResponseSchema = z.array(
	z.object({
		result: z.array(listingWithImageSchema),
	})
)

const listingDetailResponseSchema = z.array(
	z.object({
		result: listingDetailSchema,
	})
)

const listingSearchResponseSchema = z.array(
	z.object({
		result: z.array(listingDetailSchema),
	})
)

const listingDeleteResponseSchema = z.array(
	z.object({
		result: z.object({
			success: z.literal(true),
		}),
	})
)

const rpcErrorResponseSchema = z.array(
	z.object({
		error: z.object({
			_tag: z.string(),
			data: z.object({
				_tag: z.literal('Fail'),
				error: z.object({
					_tag: z.string(),
					message: z.string(),
					reason: z.string().optional(),
				}),
			}),
		}),
	})
)

const rpcResponseSchema = z.array(
	z.object({
		result: z.object({
			host: z.literal('hono'),
			rpc: z.literal('effect'),
		}),
	})
)

const rpcValidationErrorResponseSchema = z.array(
	z.object({
		error: z.object({
			_tag: z.literal('Cause'),
			data: z.object({
				_tag: z.literal('Die'),
				defect: z.string(),
			}),
		}),
	})
)

const rpcRequest = async (
	method: string,
	headers?: HeadersInit,
	params: Record<string, unknown> = {}
) =>
	app.request('/api/rpc', {
		body: JSON.stringify({
			id: 1,
			jsonrpc: '2.0',
			method,
			params,
		}),
		headers: new Headers({
			...Object.fromEntries(new Headers(headers).entries()),
			'content-type': 'application/json',
		}),
		method: 'POST',
	})

async function presignImageForRpc(userId: number, filename = 'rpc-listing.webp') {
	const headers = await testAuth.testUtils.getAuthHeaders({
		userId: userId.toString(),
	})
	const response = await rpcRequest('files.PresignUpload', headers, {
		contentType: 'image/webp',
		filename,
		size: 2048,
	})
	const data = filePresignResponseSchema.parse(await response.json())
	const key = data.at(0)?.result.file.key

	if (!key) {
		throw new Error('Missing presigned file key')
	}

	fileStorageMock._setFile(key, data.at(0)?.result.url ?? `https://upload.test/${key}`)

	return { headers, key }
}

async function createListingForRpc(
	userId: number,
	overrides: Partial<{
		description: string
		filename: string
		price: number
		title: string
	}> = {}
) {
	const { headers, key } = await presignImageForRpc(userId, overrides.filename)
	const response = await rpcRequest('listings.CreateListing', headers, {
		description: overrides.description ?? 'RPC listing description',
		imageKey: key,
		price: overrides.price ?? 4200,
		title: overrides.title ?? 'RPC listing',
	})
	const data = listingResponseSchema.parse(await response.json())
	const listing = data.at(0)?.result

	if (!listing) {
		throw new Error('Missing listing result')
	}

	return { headers, imageKey: key, listing }
}

describe('Host', () => {
	it('serves the health endpoint from the Hono host', async () => {
		const response = await app.request('/api/health')
		const data = healthResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.database).toBe('healthy')
		expect(data.environment).toBe('test')
		expect(data.status).toBe('healthy')
	})

	it('mounts better-auth on the Hono host', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await app.request('/api/auth/get-session', { headers })
		const data = authSessionSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.user.email).toBe(testAuth.users.user.email)
	})

	it('serves the effect rpc host', async () => {
		const response = await rpcRequest('GetHostInfo')
		const data = rpcResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.host).toBe('hono')
		expect(data.at(0)?.result.rpc).toBe('effect')
	})

	it('serves the authenticated current-user rpc', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('users.GetCurrentUser', headers)
		const data = currentUserResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.user.id).toBe(testAuth.users.user.id)
		expect(data.at(0)?.result.user.email).toBe(testAuth.users.user.email)
		expect(data.at(0)?.result.user.role).toBe(testAuth.users.user.role)
		expect(data.at(0)?.result.session.userId).toBe(testAuth.users.user.id.toString())
	})

	it('serves the authenticated file presign rpc', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('files.PresignUpload', headers, {
			contentType: 'image/webp',
			filename: 'rpc-photo.webp',
			size: 2048,
		})
		const data = filePresignResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.file.filename).toBe('rpc-photo.webp')
		expect(data.at(0)?.result.file.contentType).toBe('image/webp')
		expect(data.at(0)?.result.file.ownerId).toBe(testAuth.users.user.id)
		expect(data.at(0)?.result.file.size).toBe(2048)
		expect(data.at(0)?.result.file.status).toBe('pending')
		expect(data.at(0)?.result.file.key).toStartWith(`${testAuth.users.user.id}/`)
		expect(data.at(0)?.result.url).toBeString()
	})

	it('serves the authenticated listing create rpc', async () => {
		const { listing } = await createListingForRpc(testAuth.users.user.id)

		expect(listing.title).toBe('RPC listing')
		expect(listing.description).toBe('RPC listing description')
		expect(listing.price).toBe(4200)
		expect(listing.userId).toBe(testAuth.users.user.id)
	})

	it('serves the authenticated user listings rpc', async () => {
		await createListingForRpc(testAuth.users.user.id, { title: 'User RPC listing' })
		await createListingForRpc(testAuth.users.admin.id, { title: 'Admin RPC listing' })

		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('listings.GetUserListings', headers)
		const data = listingCollectionResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result).toHaveLength(1)
		expect(data.at(0)?.result.at(0)?.title).toBe('User RPC listing')
		expect(data.at(0)?.result.at(0)?.image).toBeString()
	})

	it('serves the authenticated listing detail rpc', async () => {
		const { headers, listing } = await createListingForRpc(testAuth.users.user.id)
		const response = await rpcRequest('listings.GetListing', headers, { id: listing.id })
		const data = listingDetailResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.id).toBe(listing.id)
		expect(data.at(0)?.result.title).toBe('RPC listing')
		expect(data.at(0)?.result.user.id).toBe(testAuth.users.user.id)
		expect(data.at(0)?.result.user.name).toBe(testAuth.users.user.name)
		expect(data.at(0)?.result.image).toBeString()
	})

	it('serves the authenticated listing update rpc', async () => {
		const { headers, listing } = await createListingForRpc(testAuth.users.user.id)
		const response = await rpcRequest('listings.UpdateOwnedListing', headers, {
			data: { title: 'Updated RPC listing' },
			id: listing.id,
		})
		const data = listingResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.id).toBe(listing.id)
		expect(data.at(0)?.result.title).toBe('Updated RPC listing')
	})

	it('serves the authenticated listing delete rpc', async () => {
		const { headers, imageKey, listing } = await createListingForRpc(testAuth.users.user.id)
		const response = await rpcRequest('listings.DeleteOwnedListing', headers, { id: listing.id })
		const data = listingDeleteResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.success).toBeTrue()
		expect(await db.query.listings.findFirst({ where: { id: listing.id } })).toBeUndefined()
		expect(await db.query.files.findFirst({ where: { key: imageKey } })).toMatchObject({
			key: imageKey,
			status: 'deleted',
		})
	})

	it('serves the authenticated listing search rpc', async () => {
		await createListingForRpc(testAuth.users.user.id, {
			description: 'Vintage amplifier from the RPC suite',
			title: 'RPC Vintage Amp',
		})

		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('listings.SearchListings', headers, { q: 'Vintage' })
		const data = listingSearchResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result.at(0)?.title).toBe('RPC Vintage Amp')
		expect(data.at(0)?.result.at(0)?.user.id).toBe(testAuth.users.user.id)
		expect(data.at(0)?.result.at(0)?.image).toBeString()
	})

	it('serves the superadmin file cleanup rpc', async () => {
		await db.insert(userRoles).values({
			grantedById: testAuth.users.admin.id,
			role: 'superadmin',
			userId: testAuth.users.admin.id,
		})

		const staleKey = `${testAuth.users.user.id}/stale-cleanup-rpc.webp`
		fileStorageMock._setFile(staleKey, `https://upload.test/${staleKey}`)

		await db.insert(files).values({
			contentType: 'image/webp',
			createdAt: new Date('2026-04-27T10:00:00.000Z'),
			filename: 'stale-cleanup-rpc.webp',
			key: staleKey,
			ownerId: testAuth.users.user.id,
			size: 2048,
			status: 'pending',
			updatedAt: new Date('2026-04-27T10:00:00.000Z'),
		})

		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.admin.id.toString(),
		})
		const response = await rpcRequest('files.CleanupStalePending', headers)
		const data = fileCleanupResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.result).toEqual({ filesDeleted: 1, message: 'Cleanup complete' })
		expect(await fileStorageMock.exists(staleKey)).toBeFalse()
		expect(await db.query.files.findFirst({ where: { key: staleKey } })).toBeUndefined()
	})

	it('rejects non-superadmin file cleanup rpc requests', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('files.CleanupStalePending', headers)
		const data = rpcErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error._tag).toBe('Cause')
		expect(data.at(0)?.error.data.error._tag).toBe('UnauthorizedRpcError')
		expect(data.at(0)?.error.data.error.message).toBe(
			'You are not authorized to access this resource'
		)
	})

	it('rejects invalid file presign payloads at the rpc boundary', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('files.PresignUpload', headers, {
			contentType: 'image/png',
			filename: 'invalid.png',
			size: 1024,
		})
		const data = rpcValidationErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error._tag).toBe('Cause')
		expect(data.at(0)?.error.data.defect).toContain('Expected "image/webp"')
	})

	it('rejects unauthenticated listings rpc requests', async () => {
		const response = await rpcRequest('listings.GetUserListings')
		const data = rpcErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error.data.error._tag).toBe('ListingRpcError')
		expect(data.at(0)?.error.data.error.reason).toBe('unauthenticated')
		expect(data.at(0)?.error.data.error.message).toBe('You are not authenticated')
	})

	it('rejects forbidden listing updates through rpc', async () => {
		const { listing } = await createListingForRpc(testAuth.users.admin.id)
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('listings.UpdateOwnedListing', headers, {
			data: { title: 'nope' },
			id: listing.id,
		})
		const data = rpcErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error.data.error._tag).toBe('ListingRpcError')
		expect(data.at(0)?.error.data.error.reason).toBe('forbidden')
		expect(data.at(0)?.error.data.error.message).toBe('This listing is not yours')
	})

	it('rejects missing listings through rpc', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('listings.GetListing', headers, { id: 999_999 })
		const data = rpcErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error.data.error._tag).toBe('ListingRpcError')
		expect(data.at(0)?.error.data.error.reason).toBe('not_found')
		expect(data.at(0)?.error.data.error.message).toBe('Listing not found')
	})

	it('rejects invalid listing payloads at the rpc boundary', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const response = await rpcRequest('listings.CreateListing', headers, {
			description: '',
			imageKey: '',
			price: 4200,
			title: '',
		})
		const data = rpcValidationErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error.data.defect).toContain('NonEmptyString')
	})

	it('rejects unauthenticated current-user rpc requests', async () => {
		const response = await rpcRequest('users.GetCurrentUser')
		const data = rpcErrorResponseSchema.parse(await response.json())

		expect(response.status).toBe(200)
		expect(data.at(0)?.error._tag).toBe('Cause')
		expect(data.at(0)?.error.data.error._tag).toBe('UnauthorizedRpcError')
	})

	it('resolves auth into the typed request context', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const requestAuth = await Effect.runPromise(resolveRequestAuth(headers))

		expect(requestAuth?.user.id).toBe(testAuth.users.user.id)
		expect(requestAuth?.user.role).toBe(testAuth.users.user.role)
	})
})
