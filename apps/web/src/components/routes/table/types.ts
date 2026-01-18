import { typedObjectEntries } from '@repo/utils'

export const statusEnum = ['pending', 'in-progress', 'completed'] as const
export type Status = (typeof statusEnum)[number]

export const statusOptions = {
	pending: {
		label: 'Pending',
	},
	'in-progress': {
		label: 'In progress',
	},
	completed: {
		label: 'Completed',
	},
} as const satisfies Record<Status, { label: string }>

export const priorityEnum = ['low', 'medium', 'high'] as const
export type Priority = (typeof priorityEnum)[number]

export const priorityOptions = {
	low: {
		label: 'Low',
	},
	medium: {
		label: 'Medium',
	},
	high: {
		label: 'High',
	},
} as const satisfies Record<Priority, { label: string }>

export const enumOptions = <TValue extends string | number, TLabel>(
	options: Record<TValue, { label: TLabel }>
) => {
	return typedObjectEntries(options).map(([value, { label }]) => ({
		label,
		value,
	}))
}
