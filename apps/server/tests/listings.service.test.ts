import { beforeEach, describe, expect, it } from 'bun:test'

import { db } from '@repo/db'
import { listings } from '@repo/db/schemas'
import { randomUUIDv7 } from 'bun'

import { ListingsService, isListingForbiddenError } from '../src/modules/listings/listings.service'
import { createTestUsers, testUsers } from './utils'

const validListing = { description: 'A test description', price: 100, title: 'Test Listing' }

describe('Listings service', () => {
	beforeEach(async () => {
		await createTestUsers()
	})

	it('enforces listing ownership during updates', async () => {
		const [listing] = await db
			.insert(listings)
			.values({
				...validListing,
				title: `${validListing.title} ${randomUUIDv7()}`,
				userId: testUsers.admin.id,
			})
			.returning()

		if (!listing) {
			throw new Error('Expected listing to be created')
		}

		try {
			await ListingsService(db).updateOwnedListing({
				data: { title: 'Updated title' },
				id: listing.id,
				userId: testUsers.user.id,
			})
			throw new Error('Expected updateOwnedListing to reject')
		} catch (error) {
			expect(isListingForbiddenError(error)).toBeTrue()
			if (!(error instanceof Error)) {
				throw error
			}
			expect(error.message).toBe('This listing is not yours')
		}
	})

	it('returns the current listing for empty updates', async () => {
		const [listing] = await db
			.insert(listings)
			.values({
				...validListing,
				title: `${validListing.title} ${randomUUIDv7()}`,
				userId: testUsers.user.id,
			})
			.returning()

		if (!listing) {
			throw new Error('Expected listing to be created')
		}

		const currentListing = await ListingsService(db).updateOwnedListing({
			data: {},
			id: listing.id,
			userId: testUsers.user.id,
		})

		expect(currentListing).toMatchObject({
			description: listing.description,
			id: listing.id,
			price: listing.price,
			title: listing.title,
			userId: listing.userId,
		})
	})
})
