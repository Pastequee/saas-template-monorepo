export const keys = {
	todos: {
		all: ['todos'] as const,
		list: () => [...keys.todos.all, 'list'] as const,
		item: (id: string) => [...keys.todos.all, 'item', id] as const,
	},
	admin: {
		all: ['admin'] as const,
		users: {
			all: () => [...keys.admin.all, 'users'] as const,
			list: () => [...keys.admin.users.all(), 'list'] as const,
		},
	},
} as const
