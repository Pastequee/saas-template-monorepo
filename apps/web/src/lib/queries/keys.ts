export const keys = {
	todos: {
		all: ['todos'] as const,
		list: () => [...keys.todos.all, 'list'] as const,
		item: (id: string) => [...keys.todos.all, 'item', id] as const,
	},
} as const
