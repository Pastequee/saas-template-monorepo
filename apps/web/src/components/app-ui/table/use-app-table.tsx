/** biome-ignore-all lint/suspicious/noExplicitAny: necessary for type inference */
import {
	type ColumnDef,
	type ColumnFiltersState,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	type RowSelectionState,
	type SortingState,
	useReactTable,
	type VisibilityState,
} from '@tanstack/react-table'
import { useState } from 'react'

type UseAppTableProps<TData> = {
	/**
	 * The columns to display in the table.
	 */
	columns: ColumnDef<TData, any>[]
	/**
	 * The data to display in the table.
	 */
	data: TData[]
	/**
	 * Whether to display the pagination or not.
	 * @default false
	 */
	paginate?: boolean
	/**
	 * Whether to display the lines selection or not.
	 * @default false
	 */
	rowSelection?: boolean
	/**
	 * Whether to display the search or not.
	 * @default false
	 */
	search?: boolean
}

export const useAppTable = <TData,>({
	columns,
	data,
	paginate,
	rowSelection,
}: UseAppTableProps<TData>) => {
	const [sorting, setSorting] = useState<SortingState>([])
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})
	const [rowSelectionState, setRowSelectionState] = useState<RowSelectionState>({})

	const table = useReactTable({
		data,
		columns,

		getCoreRowModel: getCoreRowModel(),

		getPaginationRowModel: paginate ? getPaginationRowModel() : undefined,

		onSortingChange: setSorting,
		getSortedRowModel: getSortedRowModel(),

		onColumnFiltersChange: setColumnFilters,
		getFilteredRowModel: getFilteredRowModel(),

		onColumnVisibilityChange: setColumnVisibility,

		onRowSelectionChange: rowSelection ? setRowSelectionState : undefined,

		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection: rowSelectionState,
		},
	})

	return table
}
