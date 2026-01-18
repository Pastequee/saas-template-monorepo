import type { Table } from '@tanstack/react-table'
import { Settings2 } from 'lucide-react'
import { Button } from '~/components/ui/button'
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu'

type AppTableHeaderColumnFilterProps<TData> = {
	/**
	 * The table object from useTable to display the header for.
	 */
	table: Table<TData>
}

export function AppTableHeaderColumnFilter<TData>({
	table,
}: AppTableHeaderColumnFilterProps<TData>) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger>
				<Button className="ml-auto" variant="outline">
					<Settings2 />
					Columns
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end">
				{table
					.getAllColumns()
					.filter((column) => column.getCanHide())
					.map((column) => (
						<DropdownMenuCheckboxItem
							checked={column.getIsVisible()}
							className="capitalize"
							key={column.id}
							onCheckedChange={(value) => column.toggleVisibility(!!value)}
						>
							{column.id}
						</DropdownMenuCheckboxItem>
					))}
			</DropdownMenuContent>
		</DropdownMenu>
	)
}
