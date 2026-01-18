import type { Column } from '@tanstack/react-table'
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react'
import { Button } from '~/components/ui/button'
import { cn } from '~/lib/utils/cn'

interface AppTableColumnHeaderProps<TData, TValue> extends React.HTMLAttributes<HTMLDivElement> {
	column: Column<TData, TValue>
	title: string
}

export function AppTableColumnHeader<TData, TValue>({
	column,
	title,
	className,
}: AppTableColumnHeaderProps<TData, TValue>) {
	if (!column.getCanSort()) {
		return <div className={className}>{title}</div>
	}

	return (
		<Button
			className={cn('cursor-pointer px-0 hover:bg-inherit', className)}
			onClick={() => column.toggleSorting()}
			size="sm"
			variant="ghost"
		>
			{title}
			{column.getIsSorted() === 'desc' && <ArrowDown />}
			{column.getIsSorted() === 'asc' && <ArrowUp />}
			{column.getIsSorted() === false && <ChevronsUpDown />}
		</Button>
	)
}
