import { requestJson } from './request'

export type SessionUser = {
	email: string
	id: string
	name: null | string
	role?: null | string
}

export type SessionData = {
	session: {
		id: string
		impersonatedBy?: null | { userId?: string }
		userId: string
	}
	user: SessionUser
}

export type Listing = {
	createdAt: string
	description: string
	id: string
	image: null | string
	price: number
	title: string
	updatedAt: string
	user?: null | Pick<SessionUser, 'id' | 'name'>
	userId: string
}

export type CreateListingInput = {
	description: string
	imageKey: string
	price: number
	title: string
}

type DeleteListingInput = { id: string }
type UpdateListingInput = Partial<CreateListingInput> & { id: string }

type PresignFileInput = {
	contentType: 'image/webp'
	filename: string
	public?: boolean
	size: number
}

type PresignFileResponse = {
	asset: {
		id: string
		key: string
	}
	url: string
}

export const api = {
	createListing: (input: CreateListingInput) =>
		requestJson<Listing>('/api/listings', { body: input, method: 'POST' }),

	deleteListing: ({ id }: DeleteListingInput) =>
		requestJson<void>(`/api/listings/${id}`, { method: 'DELETE' }),

	getListing: (id: string) => requestJson<Listing>(`/api/listings/${id}`),

	getMyListings: () => requestJson<Listing[]>('/api/listings'),

	presignFile: (input: PresignFileInput) =>
		requestJson<PresignFileResponse>('/api/files/presign', {
			body: input,
			method: 'POST',
		}),

	searchListings: (query: string) =>
		requestJson<Listing[]>(`/api/listings/search?q=${encodeURIComponent(query)}`),

	updateListing: ({ id, ...input }: UpdateListingInput) =>
		requestJson<Listing>(`/api/listings/${id}`, { body: input, method: 'PATCH' }),
}
