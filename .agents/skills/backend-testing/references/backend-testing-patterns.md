# Backend Testing Patterns

## Test Framework

Bun Test is used for backend testing:

- Import: `import { describe, it, expect, beforeEach, afterEach } from 'bun:test'`
- Files located in: `packages/server/tests/`
- Run tests: `bun test:server`

## Test Guidelines

- Keep the tests cases as concise as possible
- One test per endpoint, unless complicated logic is involved (in that case, a special test case should be created to cover it)

## Test Utilities

Use the test utilities from `./utils`:

```typescript
import { createApi, createApiWithAuth, createTestUsers, type TestUsers } from './utils'

// Create unauthenticated API client
const api = createApi()

// Create authenticated API client (requires existing user)
const authApi = (await createApiWithAuth(user)).api

// Create test users (admin + normal)
const users: TestUsers = await createTestUsers()
// users.admin, users.normal
```

## Test Structure

Organize tests by feature in `*.spec.ts` files:

```typescript
import { beforeEach, describe, expect, it } from 'bun:test'
import type { Treaty } from '@elysiajs/eden'
import type { App } from '../src'
import { createApiWithAuth, createTestUsers } from './utils'

describe('FeatureName', () => {
	let adminApi: Treaty.Create<App>['api']
	let normalApi: Treaty.Create<App>['api']
	let users: TestUsers

	beforeEach(async () => {
		users = await createTestUsers()
		adminApi = (await createApiWithAuth(users.admin)).api
		normalApi = (await createApiWithAuth(users.normal)).api
	})

	it('should do something', async () => {
		const response = await adminApi.endpoint.get()

		expect(response.status).toBe(200)
		expect(response.data).toEqual(expectedValue)
	})
})
```

## Test Patterns

### Unauthenticated Endpoints

```typescript
it('public endpoint works', async () => {
	const response = await api.public.get()

	expect(response.status).toBe(200)
})
```

### Authenticated Endpoints

```typescript
it('auth endpoint returns user data', async () => {
	const response = await normalApi.me.get()

	expect(response.status).toBe(200)
	expect(response.data?.user?.id).toBe(users.normal.id)
})
```

### Role-based Endpoints

```typescript
it('admin-only endpoint', async () => {
	const adminResponse = await adminApi.admin.get()
	const userResponse = await normalApi.admin.get()

	expect(adminResponse.status).toBe(200)
	expect(userResponse.status).toBe(403) // Unauthorized
})
```

### CRUD Operations

```typescript
it('creates and deletes todo', async () => {
	// Create
	const createRes = await adminApi.todos.post({ content: 'Test' })
	expect(createRes.status).toBe(201)

	// Read
	const readRes = await adminApi.todos.get()
	expect(readRes.status).toBe(200)
	expect(readRes.data?.some((t) => t.id === createRes.data?.id)).toBe(true)

	// Delete
	const deleteRes = await adminApi.todos({ id: createRes.data?.id }).delete()
	expect(deleteRes.status).toBe(204)
})
```

## Assertions

- Use `expect()` from `bun:test`
- Common assertions: `toBe()`, `toEqual()`, `toBeGreaterThan()`, `toContain()`, `toBeDefined()`
- Status codes: `expect(response.status).toBe(200)`
- Data checks: `expect(response.data?.property).toBe(expected)`

## Test Isolation

- Use `beforeEach` to reset state between tests
- Test users are created fresh in each test suite
- Database state is isolated per test run
