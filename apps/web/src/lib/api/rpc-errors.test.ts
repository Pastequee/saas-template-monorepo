import { describe, expect, it } from 'bun:test'

import { isAuthenticationRpcError } from './rpc-errors'

describe('isAuthenticationRpcError', () => {
	it('recognizes rpc auth failures that should sign the user out', () => {
		expect(
			isAuthenticationRpcError({
				_tag: 'UnauthorizedRpcError',
				message: 'You are not authenticated',
			})
		).toBe(true)

		expect(
			isAuthenticationRpcError({
				_tag: 'ListingRpcError',
				message: 'You are not authenticated',
				reason: 'unauthenticated',
			})
		).toBe(true)

		expect(
			isAuthenticationRpcError({
				_tag: 'ListingRpcError',
				message: 'Forbidden',
				reason: 'forbidden',
			})
		).toBe(false)
	})
})
