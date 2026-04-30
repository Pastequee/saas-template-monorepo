import { describe, expect, it } from 'bun:test'

import { coercePositiveInt, normalizeOptionalPositiveInt } from '@repo/utils'

describe('numeric id helpers', () => {
	it('coerces positive integer inputs and preserves nullish optional values', () => {
		expect(coercePositiveInt('9')).toBe(9)
		expect(coercePositiveInt(4)).toBe(4)
		expect(normalizeOptionalPositiveInt('3')).toBe(3)
		expect(normalizeOptionalPositiveInt(null)).toBeNull()
		expect(normalizeOptionalPositiveInt()).toBeUndefined()
	})

	it('rejects non-positive and non-integer values', () => {
		expect(() => coercePositiveInt('0', 'listing id')).toThrow('Invalid listing id: 0')
		expect(() => coercePositiveInt('4.2', 'listing id')).toThrow('Invalid listing id: 4.2')
	})

	it('rejects non-decimal string coercions', () => {
		expect(() => coercePositiveInt('1e2', 'listing id')).toThrow('Invalid listing id: 1e2')
		expect(() => coercePositiveInt('0x10', 'listing id')).toThrow('Invalid listing id: 0x10')
		expect(() => coercePositiveInt(' 7 ', 'listing id')).toThrow('Invalid listing id:  7 ')
	})
})
