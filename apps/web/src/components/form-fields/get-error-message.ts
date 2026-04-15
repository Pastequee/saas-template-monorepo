export function getErrorMessage(errors: unknown[]) {
	const firstError = errors.at(0)

	if (firstError === undefined || firstError === null) {
		return null
	}

	if (typeof firstError === 'string') {
		return firstError
	}

	if (
		typeof firstError === 'object' &&
		'message' in firstError &&
		typeof firstError.message === 'string'
	) {
		return firstError.message
	}

	return 'Une erreur inconnue est survenue'
}
