import { expect, test } from 'bun:test'
import { randomUUIDv7 } from 'bun'
import { api } from './setup'

test('GET /todos requires auth', async () => {
	const response = await api.todos.get()

	expect(response.status).toBe(401)
})

test('POST /todos requires auth', async () => {
	const response = await api.todos.post({
		content: 'Needs auth',
		status: 'pending',
	})

	expect(response.status).toBe(401)
})

test('PATCH /todos/:id requires auth', async () => {
	const response = await api.todos({ id: randomUUIDv7() }).patch({
		content: 'Needs auth',
	})

	expect(response.status).toBe(401)
})

test('DELETE /todos/:id requires auth', async () => {
	const response = await api.todos({ id: randomUUIDv7() }).delete()

	expect(response.status).toBe(401)
})
