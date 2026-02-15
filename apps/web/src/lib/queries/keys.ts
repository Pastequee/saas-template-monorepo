export const keys = {
	listings: {
		all: ['todos'] as const,
		list: () => [...keys.listings.all, 'list'] as const,
		search: (query: string) => [...keys.listings.all, 'search', query] as const,
		one: (id: string) => [...keys.listings.all, 'one', id] as const,
	},
	admin: {
		all: ['admin'] as const,
		users: {
			all: () => [...keys.admin.all, 'users'] as const,
			list: () => [...keys.admin.users.all(), 'list'] as const,
		},
	},
} as const
