type NumericId = number | string

export const coercePositiveInt = (value: NumericId, label = 'value') => {
	if (typeof value === 'string') {
		if (!/^\d+$/.test(value)) {
			throw new Error(`Invalid ${label}: ${value}`)
		}

		const normalized = Number(value)

		if (!Number.isSafeInteger(normalized) || normalized < 1) {
			throw new Error(`Invalid ${label}: ${value}`)
		}

		return normalized
	}

	if (!Number.isSafeInteger(value) || value < 1) {
		throw new Error(`Invalid ${label}: ${value}`)
	}

	return value
}

export const normalizeOptionalPositiveInt = (
	value: NumericId | null | undefined,
	label = 'value'
) => (value === null || value === undefined ? value : coercePositiveInt(value, label))
