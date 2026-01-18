import type { Column, DisplayColumnDef } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown, type LucideIcon } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { Checkbox } from '~/components/ui/checkbox'
import { cn } from '~/lib/utils/cn'

export function getRowSelectionColumn<TData>(
	options?: DisplayColumnDef<TData>
): DisplayColumnDef<TData> {
	return {
		id: 'select',

		header: ({ table }) => (
			<Checkbox
				aria-label="Select all rows"
				checked={table.getIsAllPageRowsSelected() || table.getIsSomePageRowsSelected()}
				onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
			/>
		),
		cell: ({ row }) => (
			<Checkbox
				aria-label="Select this row"
				checked={row.getIsSelected()}
				onCheckedChange={(value) => row.toggleSelected(!!value)}
			/>
		),

		enableSorting: false,
		enableHiding: false,

		...options,
	}
}

type Action<TData> = {
	/**
	 * The label to display in the action button.
	 */
	label: string
	/**
	 * The lucid icon to display in the action button.
	 */
	icon: LucideIcon
	/**
	 * The function to call when the action button is clicked.
	 */
	onClick?: (data: TData) => void
}

export function getActionsColumn<TData>(
	actions: [Action<TData>, ...Action<TData>[]],
	options?: DisplayColumnDef<TData>
): DisplayColumnDef<TData> {
	return {
		id: 'actions',
		cell: ({ row }) => (
			<div className="flex items-center justify-end gap-2">
				{actions.map((action) => (
					<Button
						key={action.label}
						onClick={() => action.onClick?.(row.original)}
						size="icon"
						title={action.label}
						variant="ghost"
					>
						<action.icon />
					</Button>
				))}
			</div>
		),

		enableSorting: false,
		enableHiding: false,

		...options,
	}
}

type AppTableColumnHeaderProps<TData, TValue> = React.HTMLAttributes<HTMLDivElement> & {
	column: Column<TData, TValue>
} & React.PropsWithChildren

export function AppTableColumnHeader<TData, TValue>({
	column,
	className,
	children,
}: AppTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={className}>{children}</div>
	}

	return (
		<Button
			className={cn('-ml-2.5 border-0', className)}
			onClick={() => column.toggleSorting()}
			size="sm"
			variant="ghost"
		>
			{children}
			{column.getIsSorted() === 'desc' && <ArrowDown />}
			{column.getIsSorted() === 'asc' && <ArrowUp />}
			{column.getIsSorted() === false && <ChevronsUpDown />}
		</Button>
	)
}
