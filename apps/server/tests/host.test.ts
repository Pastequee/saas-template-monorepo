import { describe, expect, it } from 'bun:test'

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

const rpcErrorResponseSchema = z.array(
	z.object({
		error: z.object({
			_tag: z.string(),
			data: z.object({
				_tag: z.literal('Fail'),
				error: z.object({
					_tag: z.string(),
					message: z.string(),
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
