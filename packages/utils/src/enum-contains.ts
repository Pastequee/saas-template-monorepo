export function enumContains<T extends readonly string[]>(
	enumArray: T,
	value: string
): value is T[number] {
	return enumArray.includes(value)
}
