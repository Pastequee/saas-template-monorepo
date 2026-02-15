import { defineRelations } from 'drizzle-orm'
import * as schema from './schemas'

export const relations = defineRelations(schema, (r) => ({
	users: {
		sessions: r.many.sessions(),
		accounts: r.many.accounts(),
		todos: r.many.listings(),
		// roles: r.many.userRoles(),
	},

	sessions: {
		user: r.one.users({
			from: r.sessions.userId,
			to: r.users.id,
		}),
	},

	accounts: {
		user: r.one.users({
			from: r.accounts.userId,
			to: r.users.id,
		}),
	},

	userRoles: {
		user: r.one.users({
			from: r.userRoles.userId,
			to: r.users.id,
		}),
		grantedBy: r.one.users({
			from: r.userRoles.grantedById,
			to: r.users.id,
		}),
	},

	assets: {
		owner: r.one.users({
			from: r.assets.ownerId,
			to: r.users.id,
		}),
	},

	listings: {
		user: r.one.users({
			from: r.listings.userId,
			to: r.users.id,
		}),
		image: r.one.assets({
			from: r.listings.id.through(r.listingImages.listingId),
			to: r.assets.id.through(r.listingImages.assetId),
		}),
	},

	listingImages: {
		listing: r.one.listings({
			from: r.listingImages.listingId,
			to: r.listings.id,
		}),
		asset: r.one.assets({
			from: r.listingImages.assetId,
			to: r.assets.id,
		}),
	},
}))
