export const isAuthenticationRpcError = (error: unknown) => {
	if (typeof error !== 'object' || error === null || !('_tag' in error)) {
		return false
	}

	if (error._tag === 'UnauthorizedRpcError') {
		return true
	}

	return error._tag === 'ListingRpcError' && 'reason' in error && error.reason === 'unauthenticated'
}
