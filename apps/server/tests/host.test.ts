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

const rpcResponseSchema = z.array(
	z.object({
		result: z.object({
			host: z.literal('hono'),
			rpc: z.literal('effect'),
		}),
	})
)

const rpcRequest = async (method: string, headers?: HeadersInit) =>
	app.request('/api/rpc', {
		body: JSON.stringify({
			id: 1,
			jsonrpc: '2.0',
			method,
			params: {},
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

	it('resolves auth into the typed request context', async () => {
		const headers = await testAuth.testUtils.getAuthHeaders({
			userId: testAuth.users.user.id.toString(),
		})
		const requestAuth = await Effect.runPromise(resolveRequestAuth(headers))

		expect(requestAuth?.user.id).toBe(testAuth.users.user.id)
		expect(requestAuth?.user.role).toBe(testAuth.users.user.role)
	})
})
