type NumericId = number | string

export const coercePositiveInt = (value: NumericId, label = 'value') => {
	const normalized = typeof value === 'number' ? value : Number(value)

	if (!Number.isSafeInteger(normalized) || normalized < 1) {
		throw new Error(`Invalid ${label}: ${value}`)
	}

	return normalized
}

export const normalizeOptionalPositiveInt = (
	value: NumericId | null | undefined,
	label = 'value'
) => (value === null || value === undefined ? value : coercePositiveInt(value, label))
