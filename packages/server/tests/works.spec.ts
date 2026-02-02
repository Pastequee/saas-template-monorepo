import { expect, test } from 'bun:test'
import { api } from './setup'

test('server works', async () => {
	const response = await api.get()

	expect(response.status).toBe(200)
	expect(response.data).toBe('Backend API')
})
