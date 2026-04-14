export const keys = {
	listings: {
		all: ['listings'] as const,
		list: () => [...keys.listings.all, 'list'] as const,
		one: (id: string) => [...keys.listings.all, 'one', id] as const,
		search: (query: string) => [...keys.listings.all, 'search', query] as const,
	},
} as const
