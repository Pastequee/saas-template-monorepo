import { DEFAULT_ERROR_MESSAGE } from '~/lib/constants'
import { env } from '~/lib/env'

import { authClient } from '../auth/auth-client'

type JsonValue =
	| string
	| number
	| boolean
	| null
	| JsonValue[]
	| { [key: string]: JsonValue }

type RequestOptions = Omit<RequestInit, 'body'> & {
	body?: BodyInit | JsonValue
}

let unauthorizedHandler: null | (() => void | Promise<void>) = null

export class ApiError extends Error {
	constructor(
		message: string,
		public status: number,
		public data?: unknown
	) {
		super(message)
	}
}

export const setUnauthorizedHandler = (handler: typeof unauthorizedHandler) => {
	unauthorizedHandler = handler
}

const isBodyInit = (body: unknown): body is BodyInit =>
	typeof body === 'string' ||
	body instanceof Blob ||
	body instanceof FormData ||
	body instanceof URLSearchParams ||
	body instanceof ArrayBuffer

const normalizeBody = (body: RequestOptions['body']) => {
	if (!body) {
		return undefined
	}

	if (isBodyInit(body)) {
		return body
	}

	return JSON.stringify(body)
}

const normalizeUrl = (path: string) => {
	if (path.startsWith('http://') || path.startsWith('https://')) {
		return path
	}

	return `${env.EXPO_PUBLIC_SERVER_URL}${path}`
}

export const requestJson = async <T>(path: string, options: RequestOptions = {}) => {
	const headers = new Headers(options.headers)
	const cookie = await authClient.getCookie()
	const body = normalizeBody(options.body)

	if (cookie) {
		headers.set('Cookie', cookie)
	}

	if (body && !headers.has('Content-Type') && typeof body === 'string') {
		headers.set('Content-Type', 'application/json')
	}

	const response = await fetch(normalizeUrl(path), {
		...options,
		body,
		credentials: 'omit',
		headers,
	})

	const contentType = response.headers.get('content-type') ?? ''
	const isJson = contentType.includes('application/json')
	const data = isJson ? ((await response.json()) as unknown) : await response.text()

	if (!response.ok) {
		if (response.status === 401) {
			await unauthorizedHandler?.()
		}

		const message =
			typeof data === 'object' &&
			data !== null &&
			'message' in data &&
			typeof data.message === 'string'
				? data.message
				: DEFAULT_ERROR_MESSAGE

		throw new ApiError(message, response.status, data)
	}

	return data as T
}
