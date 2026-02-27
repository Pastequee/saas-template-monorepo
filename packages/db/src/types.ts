import { createInsertSchema, createSelectSchema } from 'drizzle-orm/zod'

import { roles, userRoles } from './schemas'
import type { assets } from './schemas/assets'
import { authRoles } from './schemas/auth'
import type { accounts, sessions, users, verifications } from './schemas/auth'
import { listingImages, listings } from './schemas/listings'

const omits = { createdAt: true, id: true, updatedAt: true } as const

// auth.ts
export const AuthRole = [...authRoles.enumValues] as const
export type AuthRole = (typeof AuthRole)[number]

export type User = typeof users.$inferSelect
export type UserInsert = typeof users.$inferInsert

export type Session = typeof sessions.$inferSelect
export type SessionInsert = typeof sessions.$inferInsert

export type Account = typeof accounts.$inferSelect
export type AccountInsert = typeof accounts.$inferInsert

export type Verification = typeof verifications.$inferSelect
export type VerificationInsert = typeof verifications.$inferInsert

// roles.ts
export const Role = [...roles.enumValues] as const
export type Role = (typeof Role)[number]

export type UserRole = typeof userRoles.$inferSelect
export type UserRoleInsert = typeof userRoles.$inferInsert
export type UserRoleUpdate = Partial<UserRoleInsert>
export const userRoleSchema = createSelectSchema(userRoles)
export const userRoleInsertSchema = createInsertSchema(userRoles).omit({
	createdAt: true,
	updatedAt: true,
})

// listings.ts
export type Listing = typeof listings.$inferSelect & {
	image?: string | null
	user?: Pick<User, 'id' | 'name'> | null
}
export type ListingInsert = typeof listings.$inferInsert
export type ListingUpdate = Partial<ListingInsert>
export const listingSchema = createSelectSchema(listings)
export const listingInsertSchema = createInsertSchema(listings, {
	description: (s) => s.nonempty(),
	title: (s) => s.nonempty(),
}).omit({ ...omits, userId: true })
export const listingUpdateSchema = listingInsertSchema.partial()

export type ListingImage = typeof listingImages.$inferSelect
export type ListingImageInsert = typeof listingImages.$inferInsert
export type ListingImageUpdate = Partial<ListingImageInsert>
export const listingImageSchema = createSelectSchema(listingImages)
export const listingImageInsertSchema = createInsertSchema(listingImages).omit({ listingId: true })
export const listingImageUpdateSchema = listingImageInsertSchema.partial()

// assets.ts
export type Asset = typeof assets.$inferSelect
export type AssetInsert = typeof assets.$inferInsert
export type AssetUpdate = Partial<AssetInsert>
